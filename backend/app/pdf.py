import fitz  # PyMuPDF
from typing import Optional


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract text from PDF bytes using PyMuPDF.
    Truncates to ~60k characters for LLM processing.
    """
    try:
        # Open PDF from bytes
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        
        text = ""
        for page_num in range(doc.page_count):
            page = doc[page_num]
            text += page.get_text()
            
            # Truncate to ~60k characters to stay within LLM limits
            if len(text) > 60000:
                text = text[:60000]
                break
        
        doc.close()
        
        # Clean up the text
        text = text.strip()
        
        if not text:
            raise ValueError("No text could be extracted from the PDF")
            
        return text
        
    except Exception as e:
        raise ValueError(f"Error extracting text from PDF: {str(e)}")
