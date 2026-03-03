from pydantic import BaseModel

class InterviewCreateRequest(BaseModel):
    role: str
    job_description: str
    jobType: str
    experience: int
    interview_type: str

class QuestionRequest(BaseModel):
    session_id: str
