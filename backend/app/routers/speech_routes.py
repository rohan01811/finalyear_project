# backend/app/routers/speech_routes.py
from fastapi import APIRouter, UploadFile, File
import os
from openai import OpenAI

router = APIRouter()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@router.post("/speech-to-text")
async def speech_to_text(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        with open("temp_audio.webm", "wb") as f:
              f.write(contents)

        with open("temp_audio.webm", "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="gpt-4o-mini-transcribe",
                file=("audio.webm", audio_file, "audio/webm")  # 🔥 FIX

            )
            print("TRANSCRIBED TEXT:", transcript.text)
        return {"text": transcript.text}

    except Exception as e:
        return {"error": str(e)}