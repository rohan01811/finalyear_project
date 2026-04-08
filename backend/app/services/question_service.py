# backend/app/services/question_service.py
import json
import re
from .llm_client import call_llm
from .prompt_builder import build_question_prompt
def clean_json(raw: str) -> str:
    start = raw.find("{")
    end = raw.rfind("}") + 1
    if start == -1 or end == -1:
        raise ValueError("No JSON object found in the response")
    return raw[start:end]

def generate_questions(metadata: dict):
    prompt = build_question_prompt(
        role=metadata["role"],
        jd=metadata["job_description"],
        experience=metadata["experience"],
        interview_type=metadata["interview_type"]
    )

    raw = call_llm(prompt)
    cleaned = clean_json(raw)
    try:
        parsed = json.loads(cleaned)
        return parsed["questions"]
    except Exception as e:
        print("❌ JSON ERROR:", str(e))
        print("🔴 RAW RESPONSE:", raw)

    # ✅ Fallback questions (so interview doesn't crash)
    return [
        {
            "question": "Tell me about yourself",
            "difficulty": "easy",
            "ideal_answer": "A brief introduction about background, skills, and experience"
        },
        {
            "question": "What are your strengths?",
            "difficulty": "easy",
            "ideal_answer": "Mention technical strengths and examples"
        }
    ]