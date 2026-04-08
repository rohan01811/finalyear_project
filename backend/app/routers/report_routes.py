# app/routers/report_routes.py

from fastapi import APIRouter
from config.supabase_client import supabase

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/{interview_id}")
async def get_report(interview_id: str):

    response = supabase.table("reports") \
        .select("*") \
        .eq("interview_id", interview_id) \
        .execute()

    data = response.data

    if not data:
        return {"message": "Report not found"}

    report = data[0]

    return {
        "technical_score": report.get("technical_score"),
        "communication_score": report.get("communication_score"),
        "overall_score": report.get("overall_score"),
        "strengths": report.get("strengths"),
        "improvements": report.get("improvements"),
        "recommendation": report.get("recommendation"),
        "total_questions": report.get("total_questions"),
        "answered_questions": report.get("answered_questions"),
    }