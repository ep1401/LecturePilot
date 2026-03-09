from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile, status
from supabase import create_client

from app.core.config import settings
from app.core.security import get_current_user
from app.tasks.material_tasks import process_material

router = APIRouter(tags=["materials"])

supabase = create_client(
    settings.supabase_url,
    settings.supabase_secret_key,
)


def ensure_user_owns_class(class_id: str, user_id: str):
    class_result = (
        supabase.table("classes")
        .select("id")
        .eq("id", class_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )

    if not class_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )


@router.get("/classes/{class_id}/materials")
def get_materials(class_id: str, current_user: dict = Depends(get_current_user)):
    ensure_user_owns_class(class_id, current_user["id"])

    result = (
        supabase.table("materials")
        .select("*")
        .eq("class_id", class_id)
        .order("created_at", desc=True)
        .execute()
    )

    return result.data


@router.post("/classes/{class_id}/materials/upload", status_code=202)
async def upload_material(
    class_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    ensure_user_owns_class(class_id, current_user["id"])

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File name is missing",
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF uploads are supported right now",
        )

    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    extension = Path(file.filename).suffix or ".pdf"
    object_name = f"{class_id}/{uuid4()}{extension}"

    try:
        supabase.storage.from_(settings.supabase_storage_bucket).upload(
            path=object_name,
            file=file_bytes,
            file_options={"content-type": "application/pdf"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file to storage: {str(e)}",
        )

    material_result = (
        supabase.table("materials")
        .insert(
            {
                "class_id": class_id,
                "type": "pdf",
                "name": file.filename,
                "storage_path": object_name,
                "status": "queued",
            }
        )
        .execute()
    )

    if not material_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create material record",
        )

    material = material_result.data[0]

    process_material.delay(material["id"], class_id, object_name)

    return {
        "material": material,
        "message": "Upload received and indexing started",
    }


@router.delete("/classes/{class_id}/materials/{material_id}", status_code=204)
def delete_material(
    class_id: str,
    material_id: str,
    current_user: dict = Depends(get_current_user),
):
    ensure_user_owns_class(class_id, current_user["id"])

    result = (
        supabase.table("materials")
        .select("id, storage_path, class_id")
        .eq("id", material_id)
        .eq("class_id", class_id)
        .limit(1)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found",
        )

    material = result.data[0]
    storage_path = material.get("storage_path")

    if storage_path:
        try:
            supabase.storage.from_(settings.supabase_storage_bucket).remove([storage_path])
        except Exception:
            pass

    supabase.table("materials").delete().eq("id", material_id).eq("class_id", class_id).execute()

    return Response(status_code=204)
