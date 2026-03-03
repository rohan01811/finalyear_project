import google.generativeai as genai
from ..core.config import GOOGLE_API_KEY

genai.configure(api_key=GOOGLE_API_KEY)

def get_gemini_response(prompt, resume_text, job_description):
    model = genai.GenerativeModel("gemini-2.5-flash-lite")

    full_prompt = f"""
    {prompt}

    RESUME:
    {resume_text}

    JOB DESCRIPTION:
    {job_description}
    """

    response = model.generate_content(full_prompt)
    return response.text
