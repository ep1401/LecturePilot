from collections import defaultdict, deque
import random

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import create_client

from app.core.config import settings
from app.core.security import get_current_user
from app.models.quiz_model import GradeQuizRequest
from app.services.quiz_service import generate_quiz_question, grade_quiz_answer

router = APIRouter(tags=["quiz"])

supabase = create_client(
    settings.supabase_url,
    settings.supabase_secret_key,
)

# Simple in-memory recent history per class.
# Good enough for local MVP. If you deploy multiple instances later,
# move this to Redis or the database.
recent_material_history: dict[str, deque[str]] = {}


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


def get_recent_history(class_id: str, maxlen: int = 4) -> deque[str]:
    if class_id not in recent_material_history:
        recent_material_history[class_id] = deque(maxlen=maxlen)
    return recent_material_history[class_id]


def normalize_chunks(raw_chunks: list[dict]) -> list[dict]:
    normalized = []

    for chunk in raw_chunks:
        material = chunk.get("materials") or {}
        material_name = material.get("source_label") or material.get("name") or "Course material"

        normalized.append(
            {
                "id": chunk.get("id"),
                "content": chunk.get("content"),
                "page_number": chunk.get("page_number"),
                "timestamp_seconds": chunk.get("timestamp_seconds"),
                "material_name": material_name,
            }
        )

    return normalized


def select_diverse_quiz_chunks(
    chunks: list[dict],
    recent_materials: list[str],
    target_count: int = 5,
) -> list[dict]:
    """
    Strategy:
    1. Group chunks by material
    2. Prefer materials NOT used recently
    3. Take one random chunk per material first
    4. Fill remaining slots from leftovers
    """
    if not chunks:
        return []

    by_material: dict[str, list[dict]] = defaultdict(list)
    for chunk in chunks:
        by_material[chunk["material_name"]].append(chunk)

    all_materials = list(by_material.keys())
    random.shuffle(all_materials)

    preferred_materials = [m for m in all_materials if m not in recent_materials]
    fallback_materials = [m for m in all_materials if m in recent_materials]

    ordered_materials = preferred_materials + fallback_materials

    selected: list[dict] = []

    # First pass: one chunk per material
    for material_name in ordered_materials:
        material_chunks = by_material[material_name]
        if material_chunks:
            selected.append(random.choice(material_chunks))
        if len(selected) >= target_count:
            return selected

    # Second pass: fill from remaining chunks
    remaining_pool = []
    selected_ids = {chunk["id"] for chunk in selected}

    for chunk in chunks:
        if chunk["id"] not in selected_ids:
            remaining_pool.append(chunk)

    random.shuffle(remaining_pool)

    for chunk in remaining_pool:
        selected.append(chunk)
        if len(selected) >= target_count:
            break

    return selected


@router.post("/classes/{class_id}/quiz/question")
def generate_question(
    class_id: str,
    current_user: dict = Depends(get_current_user),
):
    ensure_user_owns_class(class_id, current_user["id"])

    # Pull a much larger pool so each new question can truly vary.
    # If your class is still small, this just returns all available rows.
    result = (
        supabase.table("chunks")
        .select("id, content, page_number, timestamp_seconds, material_id, materials(name, source_label)")
        .eq("class_id", class_id)
        .not_.is_("embedding", "null")
        .limit(1000)
        .execute()
    )

    raw_chunks = result.data or []

    if not raw_chunks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No indexed material found for this class yet",
        )

    normalized_chunks = normalize_chunks(raw_chunks)

    # Shuffle the whole pool every time to avoid repeated ordering bias
    random.shuffle(normalized_chunks)

    history = get_recent_history(class_id)
    selected_chunks = select_diverse_quiz_chunks(
        normalized_chunks,
        recent_materials=list(history),
        target_count=5,
    )

    if not selected_chunks:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not select quiz chunks",
        )

    # Track which materials were used this time
    used_materials = []
    for chunk in selected_chunks:
        material_name = chunk["material_name"]
        if material_name not in used_materials:
            used_materials.append(material_name)

    for material_name in used_materials:
        history.append(material_name)

    question = generate_quiz_question(selected_chunks)

    return {"question": question}


@router.post("/classes/{class_id}/quiz/grade")
def grade_question(
    class_id: str,
    payload: GradeQuizRequest,
    current_user: dict = Depends(get_current_user),
):
    ensure_user_owns_class(class_id, current_user["id"])

    user_answer = payload.user_answer.strip()
    if not user_answer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Answer is required",
        )

    result = grade_quiz_answer(payload.question.model_dump(), user_answer)
    return result