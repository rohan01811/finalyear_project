from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
async def login(data: LoginRequest):

    if not data.email or not data.password:
        raise HTTPException(status_code=400, detail="Email and password required")

    # Temporary demo logic
    return {
        "token": "demo-jwt-token-123",
        "username": data.email.split("@")[0]
    }
