# backend/app/db/session_store.py
import uuid

INTERVIEW_SESSIONS = {}

def create_session(data: dict):
    session_id = str(uuid.uuid4())
    INTERVIEW_SESSIONS[session_id] = {
        "metadata": data,
        "questions": []
    }
    return session_id

def save_questions(session_id: str, questions: list):
    INTERVIEW_SESSIONS[session_id]["questions"] = questions

def get_session(session_id: str):
    return INTERVIEW_SESSIONS.get(session_id)
