from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
from pathlib import Path
import os


from pdf_parser import BankStatementParser
from training_data import CATEGORY_INFO, get_all_categories, WIZARDING_TRAINING_DATA, get_category_display_name
from classifier import get_classifier
from analytics import TransactionAnalytics

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# File validation constants
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf"}


@app.get("/")
def read_root():
    return {"message": "Hello World"}


@app.post("/upload")
async def upload_bank_statement(file: UploadFile = File(...)):
    """
    Upload a bank statement PDF for analysis
    """
    # Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Only PDF files are allowed."
        )

    # Validate file size
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024 * 1024)}MB"
        )

    if file_size == 0:
        raise HTTPException(
            status_code=400,
            detail="File is empty"
        )

    # Save the file
    file_path = None
    try:
        file_path = UPLOAD_DIR / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Parse the PDF
        parser = BankStatementParser(str(file_path))
        transactions = parser.parse_transactions()
        summary = parser.get_summary(transactions)

        # Categorize transactions with ML
        classifier = get_classifier()
        categorized_transactions = classifier.categorize_transactions(transactions)

        # Generate analytics
        analytics = TransactionAnalytics(categorized_transactions)
        analysis = analytics.get_complete_analysis()

        return {
            "message": "File uploaded, parsed, and analyzed successfully",
            "filename": file.filename,
            "file_size": file_size,
            "summary": summary,
            "analysis": analysis,
            "preview_transactions": categorized_transactions[:10],
            "total_transactions": len(categorized_transactions)
        }

    except Exception as e:
        # Clean up file if parsing fails
        if file_path and file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=500,
            detail=f"Error processing file: {str(e)}"
        )

    finally:
        file.file.close()



@app.get("/categories")
async def get_categories():
    """
    Get all available expense categories with their descriptions
    """
    return {
        "categories": CATEGORY_INFO,
        "total_categories": len(CATEGORY_INFO)
    }

@app.get("/training-data")
async def get_training_data():
    """
    Get sample training data for inspection
    """
    return {
        "total_samples": len(WIZARDING_TRAINING_DATA),
        "categories": get_all_categories(),
        "sample_data": WIZARDING_TRAINING_DATA[:20]  # First 20 samples
    }


@app.get("/analyze/{filename}")
async def analyze_transactions(filename: str):
    """
    Get complete analytics for a previously uploaded file
    """
    file_path = UPLOAD_DIR / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="File not found. Please upload the file first."
        )

    try:
        # Parse the PDF
        parser = BankStatementParser(str(file_path))
        transactions = parser.parse_transactions()
        summary = parser.get_summary(transactions)

        # Categorize transactions
        classifier = get_classifier()
        categorized_transactions = classifier.categorize_transactions(transactions)

        # Generate analytics
        analytics = TransactionAnalytics(categorized_transactions)
        analysis = analytics.get_complete_analysis()

        return {
            "filename": filename,
            "summary": summary,
            "analysis": analysis,
            "all_transactions": categorized_transactions
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing file: {str(e)}"
        )

@app.post("/test-classify")
async def test_classify(description: str):
    """
    Test the classifier with a custom transaction description
    """
    classifier = get_classifier()
    category, confidence = classifier.predict_with_probability(description)

    return {
        "description": description,
        "predicted_category": category,
        "category_name": get_category_display_name(category),
        "confidence": round(confidence, 3)
    }