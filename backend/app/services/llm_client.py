import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Gemini 2.5 Flash Lite model
model = genai.GenerativeModel(
    model_name="models/gemini-2.5-flash-lite"
)

def call_llm(prompt: str) -> str:
    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.4,
                "top_p": 0.9,
                "max_output_tokens": 1024
            }
        )

        return response.text.strip()

    except Exception as e:
        raise RuntimeError(f"Gemini API error: {str(e)}")
