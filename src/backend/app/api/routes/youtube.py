from fastapi import APIRouter, Depends, HTTPException, status
from supabase import create_client

from app.core.config import settings
from app.core.security import get_current_user
from app.models.youtube_model import YouTubeIngestRequest
from app.services.embedding_service import embed_texts
from app.services.flashcard_persistence_service import generate_and_store_flashcards_for_material
from app.services.transcript_chunking_service import split_transcript_into_chunks
from app.services.youtube_service import extract_video_id, fetch_transcript

router = APIRouter(tags=["youtube"])

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


@router.post("/classes/{class_id}/youtube", status_code=201)
def ingest_youtube_lecture(
    class_id: str,
    payload: YouTubeIngestRequest,
    current_user: dict = Depends(get_current_user),
):
    ensure_user_owns_class(class_id, current_user["id"])

    try:
        video_id = extract_video_id(str(payload.url))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid YouTube URL",
        )

    try:
        transcript_snippets = fetch_transcript(video_id, languages=["en"])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not fetch transcript: {str(e)}",
        )

    if not transcript_snippets:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transcript is empty",
        )

    source_label = payload.title.strip() if payload.title else f"Lecture {video_id}"

    material_result = (
        supabase.table("materials")
        .insert(
            {
                "class_id": class_id,
                "type": "notes",
                "source_type": "youtube",
                "name": source_label,
                "external_url": str(payload.url),
                "source_label": source_label,
                "status": "completed",
            }
        )
        .execute()
    )

    if not material_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create lecture material record",
        )

    material = material_result.data[0]
    material_id = material["id"]

    transcript_chunks = split_transcript_into_chunks(transcript_snippets)

    if not transcript_chunks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transcript could not be chunked",
        )

    chunk_texts = [chunk["content"] for chunk in transcript_chunks]
    embeddings = embed_texts(chunk_texts)

    rows = []
    for idx, chunk in enumerate(transcript_chunks):
        rows.append(
            {
                "class_id": class_id,
                "material_id": material_id,
                "content": chunk["content"],
                "embedding": embeddings[idx],
                "timestamp_seconds": chunk["timestamp_seconds"],
                "chunk_index": idx,
                "page_number": None,
            }
        )

    insert_result = supabase.table("chunks").insert(rows).execute()
    stored_chunks = insert_result.data or []

    normalized_chunks = []
    for chunk in stored_chunks:
        normalized_chunks.append(
            {
                "id": chunk.get("id"),
                "content": chunk.get("content"),
                "page_number": chunk.get("page_number"),
                "timestamp_seconds": chunk.get("timestamp_seconds"),
                "material_name": source_label,
            }
        )

    generate_and_store_flashcards_for_material(
        class_id=class_id,
        material_id=material_id,
        chunks=normalized_chunks,
    )

    return {
        "material": material,
        "chunks_created": len(rows),
        "video_id": video_id,
    }