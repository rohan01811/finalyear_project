from fastapi import APIRouter
from ..services.bert_service import get_bert_embedding
from ..services.resume_service import (
    detect_educational_domain,
    is_fresher,
    extract_skills_from_resume
)

router = APIRouter(prefix="/test", tags=["Testing"])


@router.get("/bert")
async def test_bert():
    test_text = "Mechanical engineer with AutoCAD and SolidWorks experience"
    embedding = get_bert_embedding(test_text)

    return {
        "status": "success",
        "embedding_shape": str(embedding.shape),
        "sample": embedding[0][:5].tolist()
    }


@router.get("/resume")
async def test_resume_logic():
    sample_resume = """
    B.Tech Mechanical Engineering graduate with AutoCAD and SolidWorks.
    Seeking fresher opportunities.
    """

    education = detect_educational_domain(sample_resume.lower())
    fresher = is_fresher(sample_resume.lower())
    skills, categories = extract_skills_from_resume(sample_resume.lower())

    return {
        "education": education,
        "is_fresher": fresher,
        "skills": skills,
        "categories": categories
    }
