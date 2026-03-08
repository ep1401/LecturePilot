from fastapi import APIRouter, Depends, HTTPException, status
from supabase import create_client

from app.core.config import settings
from app.core.security import get_current_user
from app.models.class_model import CreateClassRequest

router = APIRouter(tags=["classes"])

supabase = create_client(
    settings.supabase_url,
    settings.supabase_secret_key,
)


@router.post("/classes", status_code=201)
def create_class(
    payload: CreateClassRequest,
    current_user: dict = Depends(get_current_user),
):
    class_name = payload.name.strip()

    if not class_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Class name is required",
        )

    result = (
        supabase.table("classes")
        .insert(
            {
                "user_id": current_user["id"],
                "name": class_name,
            }
        )
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create class",
        )

    return result.data[0]


@router.get("/classes")
def get_classes(current_user: dict = Depends(get_current_user)):
    result = (
        supabase.table("classes")
        .select("*")
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
        .execute()
    )

    return result.data


@router.get("/classes/{class_id}")
def get_class(class_id: str, current_user: dict = Depends(get_current_user)):
    result = (
        supabase.table("classes")
        .select("*")
        .eq("id", class_id)
        .eq("user_id", current_user["id"])
        .limit(1)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )

    return result.data[0]


@router.delete("/classes/{class_id}", status_code=204)
def delete_class(class_id: str, current_user: dict = Depends(get_current_user)):
    existing = (
        supabase.table("classes")
        .select("id")
        .eq("id", class_id)
        .eq("user_id", current_user["id"])
        .limit(1)
        .execute()
    )

    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )

    supabase.table("classes").delete().eq("id", class_id).eq(
        "user_id", current_user["id"]
    ).execute()