# Impendios

A full-stack bank statement analyzer built at **UGA Hacks 11**. Upload a PDF bank statement and instantly get a categorized spending breakdown powered by machine learning.

<br>

## Team

| Member | Role |
|---|---|
| **Igor Goncalves** | Machine Learning |
| **Jordan Delp** | Backend Engineer |
| **Ryan Meyer** | Frontend Engineer |

<br>

## How It Works

1. **Upload** a bank statement PDF through the React frontend.
2. The FastAPI backend extracts text with `pdfplumber` and parses each line into a transaction (date, description, amount).
3. A **Naive Bayes classifier** (trained on TF-IDF features) categorizes every transaction into one of 10 spending categories.
4. The API returns total income, total spent, left-over amount, daily spending, category most/least spent, and the full classified transaction list as JSON.
5. The **Budget** page renders stat cards, category bars, a daily spending chart, and a transaction table.

<br>

## Categories

| | | |
|---|---|---|
| 🍔 Food | 🏠 Rent | ⚡ Utilities |
| 🚗 Transportation | 🎬 Entertainment | 🛍️ Shopping |
| 🏥 Healthcare | 💰 Income | 🔄 Subscriptions |
| 📦 Other | | |

<br>

## Project Structure

```
├── main.py              # FastAPI server — POST /api/analyze-statement
├── pipeline.py          # Data pipeline — extraction, cleaning, classification, metrics
├── train_model.py       # Trains the Naive Bayes model, saves .pkl files
├── requirements.txt     # Python dependencies
├── models/
│   ├── naive_bayes_model.pkl
│   └── vectorizer.pkl
├── uploads/             # Temp PDF storage (auto-cleaned after processing)
└── frontend/
    ├── index.html
    ├── vite.config.js   # Dev server + API proxy to :8000
    ├── tailwind.config.js
    └── src/
        ├── App.jsx              # Router + shared analysis state
        ├── main.jsx             # Entry point
        ├── index.css            # Tailwind imports
        ├── components/
        │   └── Navbar.jsx       # Sticky nav — Upload / Budget / About links
        └── pages/
            ├── Home.jsx         # Drag-and-drop PDF upload
            ├── Budget.jsx       # Income, spent, left-over, daily spending, category breakdown
            └── About.jsx        # Project info and team members
```

<br>

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend

```bash
# Create a virtual environment & install dependencies
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Train the classifier (generates models/*.pkl)
python train_model.py

# Start the API server
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` and proxies `/api/*` requests to the backend automatically.

<br>

## API Reference

### `POST /api/analyze-statement`

Upload a PDF bank statement for analysis.

**Request** — `multipart/form-data` with a `file` field (PDF only).

**Response** — `200 OK`

```json
{
  "transactions": [
    {
      "date": "01/15",
      "description": "Starbucks Coffee",
      "amount": -5.75,
      "category": "Food"
    }
  ],
  "metrics": {
    "total_income": 3200.00,
    "total_spent": 1847.53,
    "left_over": 1352.47,
    "category_spending": {
      "Food": 423.10,
      "Rent": 1200.00,
      "Utilities": 224.43
    },
    "daily_spending": {
      "01/15": 45.75,
      "01/16": 120.00
    },
    "category_most_spent": "Rent",
    "category_least_spent": "Utilities"
  }
}
```

<br>

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | FastAPI, Uvicorn |
| ML Pipeline | scikit-learn (Multinomial Naive Bayes, TF-IDF), pandas, numpy |
| PDF Parsing | pdfplumber |

<br>

## License

See [LICENSE](LICENSE) for details.
