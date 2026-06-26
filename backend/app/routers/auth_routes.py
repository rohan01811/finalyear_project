# backend/app/routers/auth_routes.py

from urllib import response

from urllib import response

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase.lib.client_options import ClientOptions
from supabase import create_client
from config.supabase_client import supabase
from config.supabase_client import SUPABASE_KEY, SUPABASE_URL, supabase
from fastapi import Depends

from pydantic import BaseModel



router = APIRouter(prefix="/auth", tags=["Authentication"])

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str


class LoginRequest(BaseModel):
    email: str
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

def get_supabase():
    return create_client(SUPABASE_URL, SUPABASE_KEY)    

@router.post("/refresh")
async def refresh_token(data: RefreshRequest):
    try:
        response = supabase.auth.refresh_session({
                    "refresh_token": data.refresh_token
                })

        if not response.session:
            raise HTTPException(status_code=401, detail="Refresh failed")

        return {
            "session": response.session
        }

    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


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
    "session": auth_response.session,
    "user": auth_response.user
            }

    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(status_code=400, detail=str(e))  # 👈 change 500 → 400

# ------------------ LOGIN ------------------

@router.post("/login")
async def login(data: LoginRequest):
    try:
        supabase = get_supabase()   # 🔥 new instance per request

        response = supabase.auth.sign_in_with_password({
                    "email": data.email,
                    "password": data.password
                })

        if not response.user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        return {
            "message": "Login successful",
            # "access_token": response.session.access_token,
             "session": response.session,
            "user": response.user
        }

    except Exception as e:
        print("LOGIN ERROR:", str(e))
        raise HTTPException(status_code=401, detail=str(e))
    

@router.get("/me/{user_id}")
async def get_user(user_id: str):
    try:
        supabase = get_supabase()
        response = supabase.table("users").select("*").eq("id", user_id).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")

        return response.data[0]

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))    