import fitz  # PyMuPDF


def extract_pdf_pages(file_bytes: bytes) -> list[dict]:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages: list[dict] = []

    for i, page in enumerate(doc):
        text = page.get_text("text").strip()
        if text:
            pages.append(
                {
                    "page_number": i + 1,
                    "text": text,
                }
            )

    doc.close()
    return pages