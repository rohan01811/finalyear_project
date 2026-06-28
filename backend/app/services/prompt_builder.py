# backend/app/services/prompt_builder.py
def build_question_prompt(
    role: str,
    jd: str,
    experience: int,
    interview_type: str,
    count: int = 4
):
    return f"""
You are a professional AI interviewer.

Your task is to generate interview questions WITH ideal answers.

STRICT RULES:
- Output MUST be valid JSON only
- Do NOT include any explanation, notes, or extra text
- Do NOT include markdown (no ```json)
- Do NOT include text before or after JSON
- Follow JSON format strictly
- Ensure commas and brackets are correct

REQUIREMENTS:
- Role: {role}
- Experience: {experience} years
- Interview Type: {interview_type}
- Generate EXACTLY {count} questions (no less, no more)
- Include mix of easy, medium, and hard difficulty
- Questions must be practical and based on job description
- Ideal answers must be concise and technically correct

JOB DESCRIPTION:
{jd}

OUTPUT FORMAT (STRICT):

{{
  "questions": [
    {{
      "difficulty": "easy",
      "question": "Write the question here",
      "ideal_answer": "Write the ideal answer here"
    }},
    {{
      "difficulty": "medium",
      "question": "Write the question here",
      "ideal_answer": "Write the ideal answer here"
    }},
    {{
      "difficulty": "hard",
      "question": "Write the question here",
      "ideal_answer": "Write the ideal answer here"
    }}
  ]
}}
"""