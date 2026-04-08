# app/routers/evaluation_routes.py

from fastapi import APIRouter
from app.services.deep_evaluation_service import DeepEvaluationService
from config.supabase_client import supabase

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])


@router.post("/run/{interview_id}")
async def run_evaluation(interview_id: str):

    try:
        questions = supabase.table("questions") \
            .select("*") \
            .eq("interview_id", interview_id) \
            .execute().data

        results = []

        for q in questions:
            answer_data = supabase.table("answers") \
                .select("*") \
                .eq("question_id", q["id"]) \
                .execute().data

            if not answer_data:
                continue

            answer = answer_data[0]["candidate_answer"]

            if not answer or answer.strip() == "":
                continue

            # 🧠 Evaluate
            res = DeepEvaluationService.evaluate_question(
                q["question"],
                q["ideal_answer"],
                answer
            )

            # 💾 Store per-question scores
            supabase.table("answers").update({
                "technical_score": res["technical"],
                "communication_score": res["communication"],
                "final_score": res["final"],
                "grammar_score": DeepEvaluationService.grammar_score(answer)
            }).eq("id", answer_data[0]["id"]).execute()

            results.append(res)

        if not results:
            return {"message": "No answers found"}

        # 📊 Aggregate scores
        tech, comm, overall = DeepEvaluationService.aggregate(results)

        strengths, improvements, recommendation = \
            DeepEvaluationService.generate_feedback(tech, comm, overall)

        # 📄 Insert report
        supabase.table("reports").insert({
            "interview_id": interview_id,
            "technical_score": tech,
            "communication_score": comm,
            "overall_score": overall,
            "strengths": ", ".join(strengths),
            "improvements": ", ".join(improvements),
            "recommendation": recommendation,
            "total_questions": len(questions),
            "answered_questions": len(results)
        }).execute()

        # 🔔 Notification
        supabase.table("notifications").insert({
            "title": "Interview Evaluation Completed 🎉",
            "message": "Click to view your report",
            "type": "success",
            "interview_id": interview_id,
            "read": False
        }).execute()

        return {
            "technical": tech,
            "communication": comm,
            "overall": overall,
            "recommendation": recommendation
        }

    except Exception as e:
        print("Evaluation Error:", e)
        return {"error": str(e)}