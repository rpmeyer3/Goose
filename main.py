import os
import uuid
from dotenv import load_dotenv

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from google import genai
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
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("⚠️ WARNING: GEMINI_API_KEY not found in .env file!")

client = genai.Client(api_key=api_key)

# 4. Setup Directories and Models
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

model, vectorizer = load_model()

# Simple in-memory cache to avoid duplicate Gemini calls
_advisor_cache = {}


@app.get("/")
async def root():
    return {"message": "Ronaldo is waaaaay better than Pessi"}


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

                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )

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


if __name__ == "__main__":
    import uvicorn

    # Start the server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)