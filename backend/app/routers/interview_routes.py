# backend/app/routers/interview_routes.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from fastapi import HTTPException
from openai import audio
import random
from app.services.vision_service import analyze_frame
import json

import websocket
from pydantic import BaseModel
from app.services.question_service import generate_questions
from config.supabase_client import supabase
from app.services.tts_service import synthesize_speech
from app.services.evaluation_service import evaluate_answer
# after last question OR websocket close

import requests

from app.db.session_store import create_session, get_session
from app.services.interview_engine import (
    generate_first_question,
    generate_followup_question
)

import httpx
import asyncio

import time



async def trigger_evaluation(interview_id: str):
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"http://127.0.0.1:8000/evaluation/run/{interview_id}"
            )
        print("✅ Evaluation triggered successfully")
    except Exception as e:
        print("❌ Evaluation trigger failed:", e)

router = APIRouter(
    prefix="/api/interview",
    tags=["Interview"]
)

# ===============================
# REQUEST MODEL
# ===============================

class InterviewCreateRequest(BaseModel):            
    application_id: str
    


# ===============================
# CREATE INTERVIEW SESSION (REST)
# ===============================

@router.post("/create")
def create_interview(data: InterviewCreateRequest):

    # 🧠 STEP 1: Get application details
    application = supabase.table("applications") \
        .select("*") \
        .eq("id", data.application_id) \
        .execute().data

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    application = application[0]

    candidate_id = application["candidate_id"]
    job_id = application["job_id"]

    # 🧠 STEP 2: Create interview record
    interview_res = supabase.table("interviews").insert({
        "job_id": job_id,
        "application_id": data.application_id,
        "candidate_id": candidate_id,
        "status": "started"
    }).execute()

    interview_id = interview_res.data[0]["id"]

    # 🧠 STEP 3: Create session
    session_id = create_session({
    "interview_id": interview_id,
    "application_id": data.application_id,
    "job_id": job_id,
    "candidate_id": candidate_id
      })

    # 🧠 STEP 4: Get job details (IMPORTANT 🔥)
    job = supabase.table("jobs") \
        .select("*") \
        .eq("id", job_id) \
        .execute().data[0]

    metadata = {
        "role": job["role"],
        "job_description": job["description"],
        "experience": job["experience"],
        "interview_type": job["interview_type"]
    }

    # 🧠 STEP 5: Generate questions
    questions = generate_questions(metadata)
    random.shuffle(questions)
    for q in questions:
        supabase.table("questions").insert({
            "interview_id": interview_id,
            "question": q["question"],
            "difficulty": q["difficulty"],
            "ideal_answer": q["ideal_answer"]
        }).execute()

    print("TOTAL QUESTIONS:", len(questions))
    return {"session_id": session_id}

# ===============================
# VIDEO WEBSOCKET
# ===============================


connections = set()

@router.websocket("/video")
async def video_socket(websocket: WebSocket, session_id: str = Query(...)):
    await websocket.accept()

    session = get_session(session_id)
    if not session:
        await websocket.close()
        return

    connections.add(websocket)
    print(f"Active video connections: {len(connections)}")

    # ⏱️ Logging timer
    last_log = time.time()

    # 🎯 Counters
    violation_count = session.get('violation_count', 0)        # per question
    total_violations = session.get('total_violations', 0)      # full interview

    # 🧠 Control logic
    last_violation_time = 0
    COOLDOWN = 2   # seconds
    prev_violation_state = False

    try:
        while True:
            frame = await websocket.receive_bytes()
            result = analyze_frame(frame)

            current_time = time.time()

            # 🚨 Detect violation
            is_violation = (not result["eye_contact"] or result["multiple_faces"])

            # ✅ Count ONLY new violations + cooldown
            if (
                is_violation 
                and not prev_violation_state 
                and (current_time - last_violation_time > COOLDOWN)
            ):
                violation_count += 1
                total_violations += 1
                last_violation_time = current_time

            # 🔁 Update state
            prev_violation_state = is_violation

            # 📊 Log every 30 seconds
            if current_time - last_log > 30:
                print(f"📊 30s Report → Current Q Violations: {violation_count}, Total: {total_violations}")

                # ✅ Store periodically (not every frame)
                session['violation_count'] = violation_count
                session['total_violations'] = total_violations

                last_log = current_time

            # 📡 Send result to frontend
            await websocket.send_text(json.dumps(result))

    except WebSocketDisconnect:
        # 💾 Save final values on disconnect
        session['violation_count'] = violation_count
        session['total_violations'] = total_violations

        connections.remove(websocket)
        print("Video WebSocket disconnected")



# ===============================
# INTERVIEW WEBSOCKET
# ===============================

@router.websocket("/interview")
async def interview_socket(websocket: WebSocket, session_id: str = Query(...)):
    await websocket.accept()

    session = get_session(session_id)
    if not session:
        await websocket.close()
        return


    interview_id = session.get("interview_id")


    if not interview_id:
         print("❌ interview_id missing:", session)
         await websocket.close()
         return
    
    print("Creating interview:", session.get("application_id"))
    # ✅ FETCH ALL QUESTIONS
    questions = supabase.table("questions") \
        .select("*") \
        .eq("interview_id", interview_id) \
        .execute().data

    index = 0
    MAX_QUESTIONS = 4
    
    current_q = questions[index]
    audio = synthesize_speech(current_q["question"])

    

    if not audio:
        print("❌ TTS failed...")
        audio = synthesize_speech(current_q["question"])
    
    if audio:
        await websocket.send_bytes(audio)    

    else:
        print("❌ TTS FAILED COMPLETELY — SKIPPING QUESTION")

    try:
        while True:

    # 🔥 WAIT FOR ANSWER
            answer = await websocket.receive_text()

            if not answer or answer.strip() == "" or answer == "undefined":
                answer = "no answer"

            print("USER ANSWER:", answer)

            score = float(evaluate_answer(answer, current_q["ideal_answer"]))
            behavior_score = max(0, 100 - session.get('violation_count', 0) * 5)
            
            supabase.table("answers").insert({
                "question_id": current_q["id"],
                "candidate_answer": answer,
                "similarity_score": score,
                "quick_score": score,
                "video_analysis": behavior_score,
                "difficulty": current_q["difficulty"]
            }).execute()

            session['violation_count'] = 0

            index += 1

    # ✅ CHECK RIGHT AFTER INCREMENT (CRITICAL)
            if index >= len(questions) or index >= MAX_QUESTIONS:
            
                try:
                    await websocket.send_bytes(
                    synthesize_speech(
                        "Thank you for your time. The interview is now complete."
                    )
                 )
                except Exception as e:
                 print("Send completion message failed:", e)

                supabase.table("interviews").update({
                        "status": "completed"                     

                 }).eq("id", interview_id).execute()

                supabase.table("applications").update({
                            "status": "interview_done"
                        }).eq("id", session.get("application_id")).execute()

                asyncio.create_task(trigger_evaluation(interview_id))

                await websocket.close()   # ✅ ADD THIS
                print("WebSocket closed properly")

                return

    # ✅ ASK NEXT QUESTION
            if index < len(questions):

                current_q = questions[index]

                if not questions:
                    print("❌ No questions found for interview:", interview_id)
                    await websocket.close()
                    return
                
                audio = synthesize_speech(current_q["question"])
                if not audio:
                    print("❌ TTS failed...")
                    audio = synthesize_speech(current_q["question"])
                if audio:
                    await websocket.send_bytes(audio)    
                else:
                    print("❌ TTS FAILED COMPLETELY — SKIPPING QUESTION")

    except WebSocketDisconnect:
        print("Interview WebSocket disconnected")


