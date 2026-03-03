import json
import re
from app.services.prompt_builder import build_question_prompt
from app.services.llm_client import call_llm

def clean_json(text: str):
    # Remove markdown ```json ``` if present
    text = re.sub(r"```json|```", "", text).strip()
    return text

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
    except Exception:
        raise ValueError("Invalid Gemini response format")
