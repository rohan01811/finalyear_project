def build_question_prompt(
    role: str,
    jd: str,
    experience: int,
    interview_type: str,
    difficulty: str = "low to medium",
    count: int = 5
):
    return f"""
You are a professional interviewer.

Generate {count} {interview_type} interview questions.

Constraints:
- Role: {role}
- Difficulty: {difficulty}
- Experience: {experience} years
- Questions must be technical and practical
- Do NOT include answers
- Do NOT include explanations
- No numbering outside JSON

Job Description:
\"\"\"
{jd}
\"\"\"

Return ONLY valid JSON in this format:
{{
  "questions": [
    {{
      "id": 1,
      "difficulty": "low",
      "question": "..."
    }}
  ]
}}
"""
