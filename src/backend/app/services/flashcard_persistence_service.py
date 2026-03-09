from supabase import create_client

from app.core.config import settings
from app.services.flashcard_service import generate_flashcards_from_chunks

supabase = create_client(settings.supabase_url, settings.supabase_secret_key)


def generate_and_store_flashcards_for_material(
    class_id: str,
    material_id: str,
    chunks: list[dict],
):
    if not chunks:
        return 0

    # Clear existing cards for this material before regenerating
    existing_cards_result = (
        supabase.table("flashcards")
        .select("id")
        .eq("class_id", class_id)
        .eq("material_id", material_id)
        .execute()
    )

    existing_cards = existing_cards_result.data or []
    existing_ids = [card["id"] for card in existing_cards]

    if existing_ids:
        supabase.table("flashcards").delete().in_("id", existing_ids).execute()

    cards = generate_flashcards_from_chunks(chunks)

    created = 0

    for card in cards:
        flashcard_result = (
            supabase.table("flashcards")
            .insert(
                {
                    "class_id": class_id,
                    "material_id": material_id,
                    "front": card["front"],
                    "back": card["back"],
                }
            )
            .execute()
        )

        if not flashcard_result.data:
            continue

        flashcard = flashcard_result.data[0]
        created += 1

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

    return created