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
        grammar_scores = []
        confidence_scores = []
        behavior_scores = []

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
            
                        
            confidence = answer_data[0].get("confidence_score")
            if confidence is not None:
                confidence_scores.append(confidence)

            behavior = answer_data[0].get("video_analysis")
            if behavior is not None:
                behavior_scores.append(behavior)

            # 🧠 Evaluate
            res = DeepEvaluationService.evaluate_question(
                q["question"],
                q["ideal_answer"],
                answer
            )

            
            grammar = DeepEvaluationService.grammar_score(answer)

            # 💾 Store per-question scores
            supabase.table("answers").update({
                "technical_score": res["technical"],
                "communication_score": res["communication"],
                "final_score": res["final"],
                "grammar_score": grammar

            }).eq("id", answer_data[0]["id"]).execute()

            results.append(res)
            grammar_scores.append(grammar)

        if not results:
            return {"message": "No answers found"}
        
        

        total_violations = 0

        behavior_avg = (
                sum(behavior_scores) / len(behavior_scores)
                if behavior_scores else 100   # assume good behavior if no data
            )

        # 📊 Aggregate scores
        tech, comm, overall = DeepEvaluationService.aggregate(results)

        penalty = 0
        if behavior_avg < 80:
            penalty = (80 - behavior_avg) * 0.3

        adjusted_overall = max(0, overall - penalty)    

        strengths, improvements, recommendation = \
            DeepEvaluationService.generate_feedback(tech, comm, adjusted_overall)
        
        confidence_avg = (
             sum(confidence_scores) / len(confidence_scores)
             if confidence_scores else 0
            )

        interview_data = supabase.table("interviews") \
             .select("*") \
             .eq("id", interview_id) \
             .single() \
             .execute().data
        
        candidate_id = interview_data.get("candidate_id")
        application_id = interview_data.get("application_id")
        job_id = interview_data.get("job_id")
        
        grammar_avg = sum(grammar_scores) / len(grammar_scores)
        # 📄 Insert report
        supabase.table("reports").insert({
                "interview_id": interview_id,
                "candidate_id": candidate_id,
                "application_id": application_id,
                "job_id": job_id,

                "technical_score": tech,
                "communication_score": comm,
                "overall_score": adjusted_overall,

               "grammar_score": grammar_avg,
                "confidence_avg": confidence_avg,
                "behavior_score": behavior_avg,

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
    "candidate_id": candidate_id,   # ✅ CRITICAL FIX
    "read": False
}).execute()

        return {
            "technical": tech,
            "communication": comm,
            "overall": adjusted_overall,
            "recommendation": recommendation
        }

    except Exception as e:
        print("Evaluation Error:", e)
        return {"error": str(e)}