# jobreadypro/backend/app/routers/job_routes.py
from fastapi import APIRouter, UploadFile, File, HTTPException,Header
import shutil
import os
import uuid
from ..services.resume_service import parse_resume_with_bert
from ..services.job_service import search_jobs
from ..core.config import UPLOAD_DIR
from config.supabase_client import supabase


router = APIRouter(prefix="/jobs", tags=["Jobs"])


def normalize(skill):
    return skill.lower().replace("js", "").replace(".", "").strip()

def calculate_match(candidate_skills, job_skills):
    if not job_skills:
        return 0

    candidate_set = set([normalize(s) for s in candidate_skills])
    job_set = set([normalize(s) for s in job_skills])

    match_count = len(candidate_set.intersection(job_set))

    return (match_count / len(job_set)) * 100

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
        candidate_skills = bert_result.get("top_skills", [])

        if not candidate_skills:
             candidate_skills = bert_result.get("all_skills", [])

        if not bert_result:
            return {
                "status": "error",
                "message": "Resume parsing failed or insufficient content"
            }

        search_query = bert_result["query"]
        candidate_domain = bert_result["candidate_domain"]

        print("FULL BERT RESULT:", bert_result)

        job_result = search_jobs(search_query, candidate_domain)
        # 🔹 Fetch HR jobs from Supabase
        hr_jobs = supabase.table("jobs").select("*").execute().data

        matched_hr_jobs = []

        for job in hr_jobs:
            job_skills = job.get("skills", [])

            match_score = calculate_match(candidate_skills, job_skills)

            print("Candidate Skills:", candidate_skills)
            print("Job Skills:", job_skills)
            print("Match Score:", match_score)
            print("----------------------")

            if match_score >= 10:
                matched_hr_jobs.append({
                    "employer_name": job.get("company", "Our Platform"),
                    "job_title": job.get("title", "Job"),
                    "job_apply_link": f"http://localhost:5173/apply/{job['id']}",
                    "job_employment_type": job.get("job_type", "full_time"),
                    "job_city": "India",
                    "job_country": "India",
                    "source": "internal",
                    "match_score": round(match_score, 2)
                })

        all_jobs = matched_hr_jobs + job_result["jobs"]

       

        return {
            "status": "success",
            "analysis": bert_result,
            "search_query": job_result["search_query"],
            "total_jobs": len(all_jobs),
            "jobs": all_jobs
        }

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


@router.post("/apply")
async def apply_job(job_id: str, authorization: str = Header(...)):
    try:
        token = authorization.replace("Bearer ", "")
        user = supabase.auth.get_user(token)

        if not user.user:
            raise HTTPException(status_code=401, detail="Unauthorized")

        candidate_id = user.user.id

        # check already applied
        existing = supabase.table("applications") \
            .select("*") \
            .eq("candidate_id", candidate_id) \
            .eq("job_id", job_id) \
            .execute()

        if existing.data:
            return {"message": "Already applied"}

        # insert
        supabase.table("applications").insert({
            "candidate_id": candidate_id,
            "job_id": job_id,
            "status": "applied"
        }).execute()

        return {"message": "Application submitted 🚀"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))            
