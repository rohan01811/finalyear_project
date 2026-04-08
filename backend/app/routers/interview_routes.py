# backend/app/routers/interview_routes.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from fastapi import HTTPException
from openai import audio
import random

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
        "application_id":data.application_id,
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
# INTERVIEW WEBSOCKET
# ===============================

@router.websocket("/interview")
async def interview_socket(websocket: WebSocket, session_id: str = Query(...)):
    await websocket.accept()

    session = get_session(session_id)
    if not session:
        await websocket.close()
        return

    metadata = session["metadata"]
    interview_id = session["metadata"]["interview_id"]

    # ✅ FETCH ALL QUESTIONS
    questions = supabase.table("questions") \
        .select("*") \
        .eq("interview_id", interview_id) \
        .execute().data

    index = 0
    MAX_QUESTIONS = 4
    
    current_q = questions[index]
    try:
            await websocket.send_bytes(
          synthesize_speech(current_q["question"])
         )
    
    except Exception as e:
        print("Send question failed:", e)

    try:
        while True:

    # 🔥 WAIT FOR ANSWER
            answer = await websocket.receive_text()

            if not answer or answer.strip() == "" or answer == "undefined":
                answer = "no answer"

            print("USER ANSWER:", answer)

            score = float(evaluate_answer(answer, current_q["ideal_answer"]))

            supabase.table("answers").insert({
                "question_id": current_q["id"],
                "candidate_answer": answer,
                "similarity_score": score,
                "quick_score": score,
                "difficulty": current_q["difficulty"]
            }).execute()

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
                  }).eq("id", session["metadata"]["application_id"]).execute()

                asyncio.create_task(trigger_evaluation(interview_id))

                await websocket.close()   # ✅ ADD THIS
                print("WebSocket closed properly")

                return

    # ✅ ASK NEXT QUESTION
            if index < len(questions):

                current_q = questions[index]
                try:
                     await websocket.send_bytes(
                    synthesize_speech(current_q["question"])
                )
                except Exception as e:
                 print("Send question failed:", e)

    except WebSocketDisconnect:
        print("Interview WebSocket disconnected")
# ===============================
# VIDEO WEBSOCKET
# ===============================

@router.websocket("/video")
async def video_socket(websocket: WebSocket, session_id: str = Query(...)):
    await websocket.accept()

    try:
        while True:
            frame = await websocket.receive_bytes()

            # Later:
            # - Eye tracking
            # - Emotion detection
            # - Head pose

    except WebSocketDisconnect:
        print("Video WebSocket disconnected")
