# backend/app/services/tts_service.py
from gtts import gTTS
import io

def synthesize_speech(text: str):
    try:
        tts = gTTS(text=text, lang='en')
        audio_bytes = io.BytesIO()
        tts.write_to_fp(audio_bytes)
        audio_bytes.seek(0)
        return audio_bytes.read()

    except Exception as e:
        print("TTS ERROR:", e)

        # 🔥 fallback: return empty audio (or dummy)
        return b""