from fastapi import APIRouter, Depends, HTTPException, status
from supabase import create_client

from app.core.config import settings
from app.core.security import get_current_user
from app.models.ask_model import AskRequest
from app.services.qa_service import embed_question, generate_answer

router = APIRouter(tags=["ask"])

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


@router.post("/classes/{class_id}/ask")
def ask_question(
    class_id: str,
    payload: AskRequest,
    current_user: dict = Depends(get_current_user),
):
    ensure_user_owns_class(class_id, current_user["id"])

    question = payload.question.strip()

    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question is required",
        )

    query_embedding = embed_question(question)

    result = supabase.rpc(
        "match_chunks_by_class",
        {
            "query_embedding": query_embedding,
            "target_class_id": class_id,
            "match_count": 5,
        },
    ).execute()

    chunks = result.data or []

    if not chunks:
        return {
            "answer": "I could not find relevant course material for that question yet.",
            "sources": [],
        }

    answer = generate_answer(question, chunks)

    sources = []
    seen = set()

    for chunk in chunks:
        key = (chunk.get("material_name"), chunk.get("page_number"))
        if key in seen:
            continue
        seen.add(key)

        sources.append(
            {
                "material_name": chunk.get("material_name"),
                "page_number": chunk.get("page_number"),
                "chunk_id": chunk.get("id"),
            }
        )

    return {
        "answer": answer,
        "sources": sources,
    }