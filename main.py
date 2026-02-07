import os
import uuid
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pipeline import load_model, extract_text_from_pdf, parse_transactions, classify_transactions, compute_metrics

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173/"], # React Vite Native Route
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the API"}




UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

model, vectorizer = load_model()


@app.post("/api/analyze-statement")
async def analyze_statement(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    filename = f"{uuid.uuid4().hex}.pdf"
    filepath = os.path.join(UPLOAD_DIR, filename)

    try:
        contents = await file.read()
        with open(filepath, "wb") as f:
            f.write(contents)

        raw_text = extract_text_from_pdf(filepath)
        if not raw_text:
            raise HTTPException(status_code=422, detail="Could not extract text from PDF.")

        df = parse_transactions(raw_text)
        if df.empty:
            raise HTTPException(status_code=422, detail="No transactions found in PDF.")

        df = classify_transactions(df, model, vectorizer)
        metrics = compute_metrics(df)

        return JSONResponse(content={
            "transactions": df.to_dict(orient="records"),
            "metrics": metrics,
        })
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)
