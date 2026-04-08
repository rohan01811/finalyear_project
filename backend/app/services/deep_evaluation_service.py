# app/services/deep_evaluation_service.py

import language_tool_python
import textstat
from app.services.nlp_utils import semantic_similarity, keyword_coverage, coherence_score

grammar_tool = language_tool_python.LanguageTool('en-US')


class DeepEvaluationService:

    @staticmethod
    def technical_score(ans, ideal):
        semantic = semantic_similarity(ans, ideal)
        keyword = keyword_coverage(ans, ideal)
        return (0.7 * semantic + 0.3 * keyword) * 100

    @staticmethod
    def grammar_score(ans):
        matches = grammar_tool.check(ans)
        return max(0, 100 - len(matches) * 2)

    @staticmethod
    def readability_score(ans):
        score = textstat.flesch_reading_ease(ans)
        return max(0, min(score, 100))

    @staticmethod
    def communication_score(ans):
        grammar = DeepEvaluationService.grammar_score(ans)
        readability = DeepEvaluationService.readability_score(ans)
        coherence = coherence_score(ans)

        return (
            0.4 * grammar +
            0.3 * readability +
            0.3 * coherence
        )

    @staticmethod
    def intent_score(question, ans):
        return semantic_similarity(question, ans) * 100

    @staticmethod
    def evaluate_question(question, ideal, answer):

        technical = DeepEvaluationService.technical_score(answer, ideal)
        communication = DeepEvaluationService.communication_score(answer)
        intent = DeepEvaluationService.intent_score(question, answer)

        final_score = (
            0.5 * technical +
            0.3 * communication +
            0.2 * intent
        )

        return {
            "technical": technical,
            "communication": communication,
            "intent": intent,
            "final": final_score
        }

    @staticmethod
    def aggregate(scores):

        technical_avg = sum(s["technical"] for s in scores) / len(scores)
        communication_avg = sum(s["communication"] for s in scores) / len(scores)
        overall = sum(s["final"] for s in scores) / len(scores)

        return technical_avg, communication_avg, overall

    @staticmethod
    def generate_feedback(technical, communication, overall):

        strengths = []
        improvements = []

        if technical > 60:
            strengths.append("Strong technical knowledge")
        else:
            improvements.append("Revise fundamental concepts and practice problem-solving")

        if communication > 60:
            strengths.append("Good communication skills")
        else:
            improvements.append("Improve sentence structure and clarity in explanations")

        if overall > 70:
            recommendation = "Highly Recommended"
        elif overall > 50:
            recommendation = "Consider"
        else:
            recommendation = "Not Recommended"

        return strengths, improvements, recommendation