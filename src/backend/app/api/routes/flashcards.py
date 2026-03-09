import random

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import create_client

from app.core.config import settings
from app.core.security import get_current_user
from app.models.flashcard_model import GenerateFlashcardsRequest, ToggleStarRequest
from app.services.flashcard_service import generate_flashcards_from_chunks

router = APIRouter(tags=["flashcards"])

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


def normalize_chunks(raw_chunks: list[dict]) -> list[dict]:
    normalized = []

    for chunk in raw_chunks:
        material = chunk.get("materials") or {}
        normalized.append(
            {
                "id": chunk.get("id"),
                "content": chunk.get("content"),
                "page_number": chunk.get("page_number"),
                "timestamp_seconds": chunk.get("timestamp_seconds"),
                "material_id": chunk.get("material_id"),
                "material_name": material.get("source_label") or material.get("name") or "Course material",
            }
        )

    return normalized


@router.post("/classes/{class_id}/flashcards/generate")
def generate_flashcards(
    class_id: str,
    payload: GenerateFlashcardsRequest,
    current_user: dict = Depends(get_current_user),
):
    ensure_user_owns_class(class_id, current_user["id"])

    query = (
        supabase.table("chunks")
        .select("id, content, page_number, timestamp_seconds, material_id, materials(name, source_label)")
        .eq("class_id", class_id)
        .not_.is_("embedding", "null")
        .limit(200)
    )

    if payload.material_id:
        query = query.eq("material_id", payload.material_id)

    result = query.execute()
    raw_chunks = result.data or []

    if not raw_chunks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No indexed material found for this scope yet",
        )

    normalized_chunks = normalize_chunks(raw_chunks)
    random.shuffle(normalized_chunks)
    selected_chunks = normalized_chunks[:12]

    cards = generate_flashcards_from_chunks(selected_chunks, count=payload.count)

    if not cards:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate flashcards",
        )

    inserted_cards = []
    for card in cards:
        flashcard_result = (
            supabase.table("flashcards")
            .insert(
                {
                    "class_id": class_id,
                    "material_id": payload.material_id,
                    "front": card["front"],
                    "back": card["back"],
                }
            )
            .execute()
        )

        if not flashcard_result.data:
            continue

        flashcard = flashcard_result.data[0]
        inserted_cards.append(flashcard)

        if card["sources"]:
            source_rows = []
            for source in card["sources"]:
                source_rows.append(
                    {
                        "flashcard_id": flashcard["id"],
                        "chunk_id": source.get("chunk_id"),
                        "material_name": source.get("material_name", "Course material"),
                        "page_number": source.get("page_number"),
                        "timestamp_seconds": source.get("timestamp_seconds"),
                    }
                )

            supabase.table("flashcard_sources").insert(source_rows).execute()

    return {
        "created": len(inserted_cards),
        "flashcards": inserted_cards,
    }


@router.get("/classes/{class_id}/flashcards")
def get_flashcards(
    class_id: str,
    scope: str = "global",
    material_id: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    ensure_user_owns_class(class_id, current_user["id"])

    if scope == "starred":
        star_result = (
            supabase.table("flashcard_stars")
            .select("flashcard_id")
            .eq("user_id", current_user["id"])
            .execute()
        )

        starred_ids = [row["flashcard_id"] for row in (star_result.data or [])]

        if not starred_ids:
            return []

        flashcards_result = (
            supabase.table("flashcards")
            .select("*")
            .in_("id", starred_ids)
            .eq("class_id", class_id)
            .order("created_at", desc=True)
            .execute()
        )
    else:
        query = (
            supabase.table("flashcards")
            .select("*")
            .eq("class_id", class_id)
            .order("created_at", desc=True)
        )

        if scope == "material" and material_id:
            query = query.eq("material_id", material_id)

        flashcards_result = query.execute()

    flashcards = flashcards_result.data or []

    if not flashcards:
        return []

    flashcard_ids = [card["id"] for card in flashcards]

    sources_result = (
        supabase.table("flashcard_sources")
        .select("*")
        .in_("flashcard_id", flashcard_ids)
        .execute()
    )
    all_sources = sources_result.data or []

    stars_result = (
        supabase.table("flashcard_stars")
        .select("flashcard_id")
        .eq("user_id", current_user["id"])
        .in_("flashcard_id", flashcard_ids)
        .execute()
    )
    starred_ids = {row["flashcard_id"] for row in (stars_result.data or [])}

    source_map = {}
    for source in all_sources:
        source_map.setdefault(source["flashcard_id"], []).append(source)

    result = []
    for card in flashcards:
        result.append(
            {
                "id": card["id"],
                "class_id": card["class_id"],
                "material_id": card["material_id"],
                "front": card["front"],
                "back": card["back"],
                "starred": card["id"] in starred_ids,
                "sources": source_map.get(card["id"], []),
            }
        )

    return result


@router.post("/flashcards/{flashcard_id}/star")
def toggle_flashcard_star(
    flashcard_id: str,
    payload: ToggleStarRequest,
    current_user: dict = Depends(get_current_user),
):
    flashcard_result = (
        supabase.table("flashcards")
        .select("id")
        .eq("id", flashcard_id)
        .limit(1)
        .execute()
    )

    if not flashcard_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found",
        )

    if payload.starred:
        supabase.table("flashcard_stars").upsert(
            {
                "flashcard_id": flashcard_id,
                "user_id": current_user["id"],
            }
        ).execute()
    else:
        supabase.table("flashcard_stars").delete().eq(
            "flashcard_id", flashcard_id
        ).eq("user_id", current_user["id"]).execute()

    return {"starred": payload.starred}