# app/services/ats_service.py

import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini once at import time
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))


def get_gemini_response(prompt: str, resume_text: str, job_description: str) -> str:
    """
    Sends resume + job description to Gemini
    and returns structured ATS response.
    """

    if not resume_text:
        raise ValueError("Resume text cannot be empty")

    if not job_description:
        raise ValueError("Job description cannot be empty")

    try:
        model = genai.GenerativeModel("gemini-2.5-flash-lite")

        final_prompt = f"""
{prompt}

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}
"""

        response = model.generate_content(final_prompt)

        return response.text if response.text else "No response generated."

    except Exception as e:
        raise RuntimeError(f"Gemini API Error: {str(e)}")
