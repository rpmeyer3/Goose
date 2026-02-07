from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date


class Transaction(BaseModel):
    """
    Model for a single bank transaction
    """
    date: str
    description: str
    amount: float
    type: str  # "debit" or "credit"
    category: Optional[str] = None  # Will be added by ML classifier later

    class Config:
        json_schema_extra = {
            "example": {
                "date": "2024-01-15",
                "description": "GROCERY STORE",
                "amount": -45.67,
                "type": "debit",
                "category": "groceries"
            }
        }


class TransactionSummary(BaseModel):
    """
    Summary statistics for transactions
    """
    total_transactions: int
    total_debits: float
    total_credits: float
    net_amount: float
    date_range: Optional[dict] = None

    class Config:
        json_schema_extra = {
            "example": {
                "total_transactions": 45,
                "total_debits": 2340.50,
                "total_credits": 3500.00,
                "net_amount": 1159.50,
                "date_range": {
                    "start": "2024-01-01",
                    "end": "2024-01-31"
                }
            }
        }


class UploadResponse(BaseModel):
    """
    Response model for file upload
    """
    message: str
    filename: str
    file_size: int
    summary: TransactionSummary
    transactions: List[Transaction]
    total_transactions_parsed: int


class CategoryBreakdown(BaseModel):
    """
    Breakdown of spending by category
    """
    category: str
    total_amount: float
    transaction_count: int
    percentage: float


class AnalysisResponse(BaseModel):
    """
    Complete analysis response
    """
    summary: TransactionSummary
    transactions: List[Transaction]
    category_breakdown: List[CategoryBreakdown]
    top_expenses: List[Transaction]