from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid
from ..services.resume_service import parse_resume_with_bert
from ..services.job_service import search_jobs
from ..core.config import UPLOAD_DIR

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("/search")
async def job_search(resume: UploadFile = File(...)):

    if not resume.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files supported")

    import uuid
    unique_filename = f"{uuid.uuid4()}_{resume.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)

        bert_result = parse_resume_with_bert(file_path)

        if not bert_result:
            return {
                "status": "error",
                "message": "Resume parsing failed or insufficient content"
            }

        search_query = bert_result["query"]
        candidate_domain = bert_result["candidate_domain"]

        job_result = search_jobs(search_query, candidate_domain)

        return {
            "status": "success",
            "analysis": bert_result,
            "search_query": job_result["search_query"],
            "total_jobs": job_result["total_jobs"],
            "jobs": job_result["jobs"]
        }

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
