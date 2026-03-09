import fitz
from openai import OpenAI
from supabase import create_client

from app.core.celery_app import celery_app
from app.core.config import settings

supabase = create_client(settings.supabase_url, settings.supabase_secret_key)
openai_client = OpenAI(api_key=settings.openai_api_key)


def split_text_into_chunks(text: str, chunk_size: int = 500, overlap: int = 100) -> list[str]:
    words = text.split()
    if not words:
        return []

    chunks = []
    start = 0

    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end]).strip()
        if chunk:
            chunks.append(chunk)
        if end == len(words):
            break
        start = max(end - overlap, 0)

    return chunks


@celery_app.task
def process_material(material_id: str, class_id: str, storage_path: str):
    try:
        supabase.table("materials").update(
            {"status": "processing"}
        ).eq("id", material_id).execute()

        pdf_bytes = supabase.storage.from_(settings.supabase_storage_bucket).download(storage_path)

        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        chunk_rows = []
        chunk_texts = []

        for page_idx, page in enumerate(doc):
            page_text = page.get_text("text").strip()
            if not page_text:
                continue

            page_chunks = split_text_into_chunks(page_text)

            for chunk_index, chunk_text in enumerate(page_chunks):
                chunk_rows.append(
                    {
                        "class_id": class_id,
                        "material_id": material_id,
                        "content": chunk_text,
                        "page_number": page_idx + 1,
                        "chunk_index": chunk_index,
                    }
                )
                chunk_texts.append(chunk_text)

        doc.close()

        if chunk_texts:
            embedding_res = openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=chunk_texts,
            )

            embeddings = [item.embedding for item in embedding_res.data]

            for i, embedding in enumerate(embeddings):
                chunk_rows[i]["embedding"] = embedding

            supabase.table("chunks").insert(chunk_rows).execute()

        supabase.table("materials").update(
            {"status": "completed", "error_message": None}
        ).eq("id", material_id).execute()

    except Exception as e:
        supabase.table("materials").update(
            {"status": "failed", "error_message": str(e)}
        ).eq("id", material_id).execute()
        raise