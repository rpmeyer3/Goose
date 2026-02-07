import pdfplumber
from datetime import datetime
from typing import List, Dict, Optional
import re


class BankStatementParser:
    """
    Parse bank statement PDFs and extract transaction data
    """

    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.transactions = []

    def extract_text(self) -> str:
        """
        Extract all text from the PDF
        """
        text = ""
        try:
            with pdfplumber.open(self.pdf_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() + "\n"
            return text
        except Exception as e:
            raise Exception(f"Error reading PDF: {str(e)}")

    def parse_transactions(self) -> List[Dict]:
        """
        Parse transactions from extracted text
        This is a generic parser - you may need to customize for specific bank formats
        """
        text = self.extract_text()
        transactions = []

        # Common date patterns (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
        date_patterns = [
            r'\d{2}/\d{2}/\d{4}',  # MM/DD/YYYY or DD/MM/YYYY
            r'\d{4}-\d{2}-\d{2}',  # YYYY-MM-DD
            r'\d{2}-\d{2}-\d{4}',  # MM-DD-YYYY or DD-MM-YYYY
        ]

        # Pattern to match transactions (date, description, amount)
        # This regex looks for: date, followed by text, followed by amount
        transaction_pattern = r'(' + '|'.join(
            date_patterns) + r')\s+(.+?)\s+([-+]?\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?)'

        lines = text.split('\n')

        for line in lines:
            # Try to match transaction pattern
            match = re.search(transaction_pattern, line)

            if match:
                date_str = match.group(1)
                description = match.group(2).strip()
                amount_str = match.group(3).strip()

                # Clean and parse amount
                amount = self._parse_amount(amount_str)

                # Parse date
                transaction_date = self._parse_date(date_str)

                if amount is not None and transaction_date:
                    transactions.append({
                        "date": transaction_date,
                        "description": description,
                        "amount": amount,
                        "type": "debit" if amount < 0 else "credit"
                    })

        return transactions

    def _parse_amount(self, amount_str: str) -> Optional[float]:
        """
        Parse amount string to float
        Handles formats like: $1,234.56, -$1,234.56, 1234.56, etc.
        """
        try:
            # Remove $, spaces, and commas
            cleaned = amount_str.replace('$', '').replace(',', '').replace(' ', '')

            # Convert to float
            amount = float(cleaned)

            return amount
        except ValueError:
            return None

    def _parse_date(self, date_str: str) -> Optional[str]:
        """
        Parse date string to ISO format (YYYY-MM-DD)
        """
        date_formats = [
            '%m/%d/%Y',
            '%d/%m/%Y',
            '%Y-%m-%d',
            '%m-%d-%Y',
            '%d-%m-%Y',
        ]

        for fmt in date_formats:
            try:
                date_obj = datetime.strptime(date_str, fmt)
                return date_obj.strftime('%Y-%m-%d')
            except ValueError:
                continue

        return None

    def get_summary(self, transactions: List[Dict]) -> Dict:
        """
        Get a summary of the transactions
        """
        if not transactions:
            return {
                "total_transactions": 0,
                "total_debits": 0,
                "total_credits": 0,
                "net_amount": 0
            }

        total_debits = sum(t['amount'] for t in transactions if t['amount'] < 0)
        total_credits = sum(t['amount'] for t in transactions if t['amount'] > 0)

        return {
            "total_transactions": len(transactions),
            "total_debits": abs(total_debits),
            "total_credits": total_credits,
            "net_amount": total_credits + total_debits
        }