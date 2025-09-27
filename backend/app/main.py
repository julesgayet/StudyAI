import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .pdf import extract_text_from_pdf
from .llm import summarize_and_quiz
from .schemas import GenerateResponse

# Load environment variables
load_dotenv()

app = FastAPI(
    title="StudyAI Backend",
    description="PDF to revision notes and MCQs generator",
    version="0.1.0"
)

# Configure CORS
default_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
env_origins = os.getenv("FRONTEND_ORIGINS")

if env_origins:
    allowed_origins = [origin.strip() for origin in env_origins.split(",") if origin.strip()]
    # Fallback to defaults if the environment variable only contained empty values
    if not allowed_origins:
        allowed_origins = default_origins
else:
    allowed_origins = default_origins

allow_all_origins = len(allowed_origins) == 1 and allowed_origins[0] == "*"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all_origins else allowed_origins,
    allow_credentials=not allow_all_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "StudyAI Backend API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/generate", response_model=GenerateResponse)
async def generate_revision_notes(file: UploadFile = File(...)):
    """
    Generate revision notes and MCQs from uploaded PDF.
    """
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Check if OpenAI API key is configured
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(
            status_code=500, 
            detail="OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."
        )
    
    try:
        # Read file content
        file_content = await file.read()
        
        if len(file_content) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
        # Extract text from PDF
        try:
            text = extract_text_from_pdf(file_content)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        # Generate revision notes and quiz using LLM
        try:
            response_dict, input_tokens, output_tokens = summarize_and_quiz(text)
        except ValueError as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate content: {str(e)}")
        
        # Validate response using Pydantic
        try:
            response = GenerateResponse(**response_dict)
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Generated content validation failed: {str(e)}"
            )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
