from fastapi import APIRouter, HTTPException, Header
from config.supabase_client import supabase

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/{interview_id}")
async def get_report(interview_id: str, authorization: str = Header(None)):
    try:
        # 🚨 Step 1: Check token
        if not authorization:
            raise HTTPException(status_code=401, detail="Token missing")

        token = authorization.replace("Bearer ", "")

        # 🚨 Step 2: Get user
        user = supabase.auth.get_user(token)

        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")

        candidate_id = user.user.id

        # 🚨 Step 3: Filter by BOTH interview_id + candidate_id
        response = supabase.table("reports") \
            .select("""
                *,
                jobs(title, company),
                users(name, email)
            """) \
            .eq("interview_id", interview_id) \
            .eq("candidate_id", candidate_id) \
            .execute()

        data = response.data

        if not data:
            raise HTTPException(status_code=404, detail="Report not found")

        report = data[0]

        job = report.get("jobs", {})
        user_data = report.get("users", {})

        return {
            "technical_score": report.get("technical_score"),
            "communication_score": report.get("communication_score"),
            "grammar_score": report.get("grammar_score"),
            "behavior_score": report.get("behavior_score"),
            "overall_score": report.get("overall_score"),

            "job_title": job.get("title"),
            "company_name": job.get("company"),

            "candidate_name": user_data.get("name"),
            "candidate_email": user_data.get("email"),

            "strengths": report.get("strengths"),
            "improvements": report.get("improvements"),
            "recommendation": report.get("recommendation"),
             "total_violations": report.get("total_violations"),
            "total_questions": report.get("total_questions"),
            "answered_questions": report.get("answered_questions"),
        }

    except Exception as e:
        print("REPORT ERROR:", str(e))
        raise HTTPException(status_code=400, detail=str(e))