from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from fastapi import HTTPException
from pydantic import BaseModel

from app.db.session_store import create_session, get_session
from app.services.interview_engine import (
    generate_first_question,
    generate_followup_question
)

router = APIRouter(
    prefix="/api/interview",
    tags=["Interview"]
)

# ===============================
# REQUEST MODEL
# ===============================

class InterviewCreateRequest(BaseModel):
    role: str
    job_description: str
    jobType: str
    experience: int
    interview_type: str


# ===============================
# CREATE INTERVIEW SESSION (REST)
# ===============================

@router.post("/create")
def create_interview(data: InterviewCreateRequest):
    session_id = create_session(data.dict())
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

    # First question
    first_q = generate_first_question(metadata)
    await websocket.send_text(first_q)

    try:
        while True:
            answer = await websocket.receive_text()
            next_q = generate_followup_question(metadata, answer)
            await websocket.send_text(next_q)

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
