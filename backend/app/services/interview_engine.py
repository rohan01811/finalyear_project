from ..services.gemini_client import ask_gemini
from ..services.prompt_builder import build_question_prompt

def generate_first_question(metadata: dict):
    prompt = build_question_prompt(
        role=metadata["role"],
        jd=metadata["job_description"],
        experience=metadata["experience"],
        interview_type=metadata["interview_type"],
        count=1
    )
    return ask_gemini(prompt)

def generate_followup_question(metadata: dict, last_answer: str):
    prompt = f"""
You are conducting a live interview.

Role: {metadata['role']}
Experience: {metadata['experience']} years

Candidate Answer:
"{last_answer}"

Ask next logical technical question.
Only return the question text.
"""

    return ask_gemini(prompt)
