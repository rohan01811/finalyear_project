# backend/app/routers/ats_routes.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import shutil
import os
from ..core.config import UPLOAD_DIR
from ..services.resume_service import extract_text_from_pdf
from ..services.ats_service import get_gemini_response
from ..constants.ats_prompts import ATS_REVIEW_PROMPT, ATS_DETAILED_PROMPT


router = APIRouter(prefix="/ats", tags=["ATS"])

resume_text_store = ""
job_description_store = ""
prompt_store = ""


@router.post("/upload")
async def upload_resume(
    ATSdescription: str = Form(...),
    prompt_number: int = Form(...),
    file: UploadFile = File(...)
):
    global resume_text_store, job_description_store, prompt_store

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files supported")

    file_path = f"{UPLOAD_DIR}/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    resume_text_store = extract_text_from_pdf(file_path)
    job_description_store = ATSdescription
    prompt_store = ATS_REVIEW_PROMPT if prompt_number == 1 else ATS_DETAILED_PROMPT

    os.remove(file_path)

    return {"status": "success", "message": "Resume processed successfully"}


@router.post("/analyze")
async def analyze_resume():
    global resume_text_store, job_description_store, prompt_store

    if not resume_text_store:
        raise HTTPException(status_code=400, detail="Upload resume first")

    result = get_gemini_response(
        prompt_store,
        resume_text_store,
        job_description_store
    )

    return {"status": "success", "result": result}


@router.post("/clear")
async def clear_data():
    global resume_text_store, job_description_store, prompt_store

    resume_text_store = ""
    job_description_store = ""
    prompt_store = ""

    return {"status": "success", "message": "Data cleared"}
