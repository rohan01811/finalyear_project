from fastapi import APIRouter, HTTPException, Header
from config.supabase_client import supabase

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/")
async def get_notifications(authorization: str = Header(None)):
    try:
        # 🔐 Step 1: Check token
        if not authorization:
            raise HTTPException(status_code=401, detail="Token missing")

        token = authorization.replace("Bearer ", "")

        # 🔐 Step 2: Get user
        user = supabase.auth.get_user(token)

        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")

        user_id = user.user.id

        # 🔐 Step 3: Filter notifications
        res = supabase.table("notifications") \
            .select("*") \
            .eq("candidate_id", user_id) \
            .order("created_at", desc=True) \
            .execute()

        return res.data

    except Exception as e:
        print("NOTIFICATION ERROR:", str(e))
        raise HTTPException(status_code=400, detail=str(e))