# backend/app/routers/auth_routes.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase.lib.client_options import ClientOptions
from config.supabase_client import supabase
from fastapi import Depends

router = APIRouter(prefix="/auth", tags=["Authentication"])

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/signup")
async def signup(data: SignupRequest):
    try:
        if not data.role:
            raise HTTPException(status_code=400, detail="Role is required")

        auth_response = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password
        })

        # 🔥 Handle rate limit error properly
        if hasattr(auth_response, "error") and auth_response.error:
            raise HTTPException(status_code=400, detail=auth_response.error.message)

        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Signup failed")

        user_id = auth_response.user.id

        supabase.table("users").insert({
            "id": user_id,
            "name": data.name,
            "email": data.email,
            "role": data.role
        }).execute()

        return {
            "message": "Signup successful",
            "user_id": user_id
        }

    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(status_code=400, detail=str(e))  # 👈 change 500 → 400

# ------------------ LOGIN ------------------

@router.post("/login")
async def login(data: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })

        if not response.user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        return {
            "message": "Login successful",
            "access_token": response.session.access_token,
            "user": response.user
        }

    except Exception:
        raise HTTPException(status_code=401, detail="Login failed")
    

@router.get("/me/{user_id}")
async def get_user(user_id: str):
    try:
        response = supabase.table("users").select("*").eq("id", user_id).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")

        return response.data[0]

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))    