import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel("models/gemini-2.5-flash-lite")

def ask_gemini(prompt: str) -> str:
    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.4,
            "max_output_tokens": 512
        }
    )
    return response.text.strip()
