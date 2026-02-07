import os
import uuid
from dotenv import load_dotenv

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import google.generativeai as genai
from elevenlabs.client import ElevenLabs
from pipeline import (
    load_model,
    extract_text_from_pdf,
    parse_transactions,
    classify_transactions,
    compute_metrics
)

# 1. Load environment variables from .env
load_dotenv()

app = FastAPI()

# Allow the frontend origin — set FRONTEND_URL env var in production
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173").rstrip("/")
origins = [frontend_url]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Initialize Gemini Client
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("⚠️ WARNING: GOOGLE_API_KEY not found in .env file!")

genai.configure(api_key=api_key)

# Initialize ElevenLabs Client
elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")
elevenlabs_client = ElevenLabs(api_key=elevenlabs_api_key) if elevenlabs_api_key else None

if not elevenlabs_api_key:
    print("⚠️ WARNING: ELEVENLABS_API_KEY not found in .env file! Audio generation disabled.")

# 4. Setup Directories and Models
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

model, vectorizer = load_model()

# Simple in-memory cache to avoid duplicate Gemini calls
_advisor_cache = {}


class ChatRequest(BaseModel):
    message: str
    spending_data: dict = None
    transaction_count: int = 0


@app.get("/")
async def root():
    return {"message": "fuck ice"}


@app.post("/api/analyze-statement")
async def analyze_statement(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    # Generate unique filename to avoid collisions
    filename = f"{uuid.uuid4().hex}.pdf"
    filepath = os.path.join(UPLOAD_DIR, filename)

    try:
        # Save uploaded file
        contents = await file.read()
        with open(filepath, "wb") as f:
            f.write(contents)

        # Extraction and Parsing
        raw_text = extract_text_from_pdf(filepath)
        if not raw_text:
            raise HTTPException(status_code=422, detail="Could not extract text from PDF.")

        df = parse_transactions(raw_text)
        if df.empty:
            raise HTTPException(status_code=422, detail="No transactions found in PDF.")

        # Classification via Naive Bayes
        df = classify_transactions(df, model, vectorizer)
        metrics = compute_metrics(df)

        # --- Gemini Financial Advisor Logic ---
        advisor_text = "The owls are resting. Summary unavailable."

        # Cache key based on spending profile to avoid duplicate API calls
        cache_key = f"{metrics['total_spent']:.0f}-{metrics['category_most_spent']}-{metrics['left_over']:.0f}"

        if cache_key in _advisor_cache:
            advisor_text = _advisor_cache[cache_key]
        else:
            try:
                top_cat = metrics['category_most_spent'].replace('_', ' ')

                prompt = (
                    f"You are a Gringotts Bank Manager. Analyze this spending: "
                    f"Spent {metrics['total_spent']} Galleons, mostly on {top_cat}. "
                    f"Remaining in Vault: {metrics['left_over']} Galleons. "
                    f"Give a witty 2 sentence summary and 1 wizarding saving tip. "
                    f"End with an encouraging wizard slogan that is fun and memorable. "
                    f"Do not use markup!"
                )

                response = genai.GenerativeModel("gemini-2.5-flash").generate_content(prompt)

                if response and response.text:
                    advisor_text = response.text
                    _advisor_cache[cache_key] = advisor_text

            except Exception as ai_err:
                print(f"Gemini AI Error: {ai_err}")

        # Return combined results
        return JSONResponse(content={
            "transactions": df.to_dict(orient="records"),
            "metrics": metrics,
            "advisor_summary": advisor_text
        })

    except Exception as e:
        print(f"Server Logic Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Cleanup temp file
        if os.path.exists(filepath):
            os.remove(filepath)


@app.get("/api/test-audio")
async def test_audio():
    """
    Test endpoint for ElevenLabs audio generation (no Gemini API call)
    """
    test_text = "Hello! This is a test of the ElevenLabs text-to-speech audio feature. Your financial advisor can now speak to you directly!"
    
    print(f"Testing ElevenLabs audio generation...")
    
    audio_url = None
    if elevenlabs_client:
        print("ElevenLabs client available, generating audio...")
        try:
            audio = elevenlabs_client.text_to_speech.convert(
                text=test_text,
                voice_id="EXAVITQu4vr4xnSDxMaL",  # Sarah voice
                model_id="eleven_turbo_v2_5"
            )
            # Convert audio bytes to base64 for frontend
            import base64
            audio_data = b"".join(audio)
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            audio_url = f"data:audio/mpeg;base64,{audio_base64}"
            print(f"✅ Audio generated successfully! Size: {len(audio_base64)} bytes")
            
            return JSONResponse(content={
                "response": test_text,
                "audio_url": audio_url,
                "status": "success"
            })
        except Exception as audio_err:
            print(f"❌ ElevenLabs Error: {audio_err}")
            return JSONResponse(
                status_code=500,
                content={"error": str(audio_err)}
            )
    else:
        print("❌ ElevenLabs client not available (missing API key)")
        return JSONResponse(
            status_code=400,
            content={"error": "ElevenLabs API key not configured"}
        )


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Chat endpoint for AI Financial Advisor powered by Gemini with ElevenLabs audio
    """
    print(f"Received chat request: {request.message}")
    
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        # Build context from spending data if available
        context = ""
        if request.spending_data:
            context = f"""
The user's spending analysis:
- Total spent: ${request.spending_data.get('total_spent', 0):.2f}
- Remaining: ${request.spending_data.get('left_over', 0):.2f}
- Total income: ${request.spending_data.get('total_income', 0):.2f}
- Daily average: ${request.spending_data.get('daily_avg_spending', 0):.2f}
- Most spent category: {request.spending_data.get('category_most_spent', 'N/A').replace('_', ' ')}
- Least spent category: {request.spending_data.get('category_least_spent', 'N/A').replace('_', ' ')}
- Transaction count: {request.transaction_count}

Provide personalized, encouraging financial advice based on their spending patterns.
"""

        prompt = f"""You are a professional yet approachable Financial Advisor. Your goal is to provide practical, actionable financial guidance.
Your tone should be friendly and encouraging, but focus on real financial insights and strategies.
Keep responses concise (2-3 sentences) unless the user asks for more detail.
Provide specific, measurable recommendations when possible.
Use minimal emojis - only 1-2 if relevant.

User Context:{context}

User's Question: {request.message}

Based on their spending habits and question, provide personalized, practical financial advice with specific actionable steps they can take."""

        # Call Gemini API
        response = genai.GenerativeModel("gemini-2.5-flash").generate_content(prompt)

        text_response = response.text if response and response.text else "The spell misfired! Please try again. 🔮"
        
        print(f"Gemini response received: {text_response[:100]}...")
        
        # Generate audio with ElevenLabs if available
        audio_url = None
        if elevenlabs_client:
            print("ElevenLabs client available, generating audio...")
            try:
                audio = elevenlabs_client.text_to_speech.convert(
                    text=text_response,
                    voice_id="EXAVITQu4vr4xnSDxMaL",  # Sarah voice
                    model_id="eleven_turbo_v2_5"
                )
                # Convert audio bytes to base64 for frontend
                import base64
                audio_data = b"".join(audio)
                audio_base64 = base64.b64encode(audio_data).decode('utf-8')
                audio_url = f"data:audio/mpeg;base64,{audio_base64}"
                print(f"Audio generated successfully, size: {len(audio_base64)} bytes")
            except Exception as audio_err:
                print(f"ElevenLabs Error: {audio_err}")
                # Continue without audio if it fails
        else:
            print("ElevenLabs client not available (missing API key)")

        return JSONResponse(content={
            "response": text_response,
            "audio_url": audio_url
        })

    except Exception as e:
        print(f"Chat Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    # Start the server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)