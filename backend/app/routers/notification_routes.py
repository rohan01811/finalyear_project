# app/routers/notification_routes.py

from fastapi import APIRouter
from config.supabase_client import supabase

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/")
async def get_notifications():
    res = supabase.table("notifications") \
        .select("*") \
        .order("created_at", desc=True) \
        .execute()

    return res.data