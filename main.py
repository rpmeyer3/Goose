import os
import uuid
import pickle
import pdfplumber
import pandas as pd
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "naive_bayes_model.pkl")
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), "models", "vectorizer.pkl")

os.makedirs(UPLOAD_DIR, exist_ok=True)

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(VECTORIZER_PATH, "rb") as f:
    vectorizer = pickle.load(f)


def extract_text_from_pdf(path: str) -> str:
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


def parse_transactions(raw_text: str) -> pd.DataFrame:
    rows = []
    for line in raw_text.split("\n"):
        parts = line.split()
        if len(parts) < 3:
            continue
        date = parts[0]
        try:
            amount = float(parts[-1].replace(",", "").replace("$", ""))
        except ValueError:
            continue
        description = " ".join(parts[1:-1])
        rows.append({"date": date, "description": description, "amount": amount})
    return pd.DataFrame(rows)


def classify_transactions(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        df["category"] = []
        return df
    features = vectorizer.transform(df["description"])
    df["category"] = model.predict(features)
    return df


def compute_metrics(df: pd.DataFrame) -> dict:
    income = df.loc[df["amount"] > 0, "amount"].sum()
    spent = df.loc[df["amount"] < 0, "amount"].sum()
    category_spending = (
        df.loc[df["amount"] < 0]
        .groupby("category")["amount"]
        .sum()
        .abs()
        .to_dict()
    )
    return {
        "total_income": round(float(income), 2),
        "total_spent": round(float(abs(spent)), 2),
        "category_spending": {k: round(v, 2) for k, v in category_spending.items()},
    }


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

        df = classify_transactions(df)
        metrics = compute_metrics(df)

        return JSONResponse(content={
            "transactions": df.to_dict(orient="records"),
            "metrics": metrics,
        })
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)
