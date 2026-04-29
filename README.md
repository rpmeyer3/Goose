# Byte's Bank

A full-stack, wizarding-themed bank statement analyzer built at **UGA Hacks 11**. Upload a PDF bank statement and instantly get a categorized spending breakdown powered by machine learning, AI-generated financial advice from the Gringotts Advisor, and a personal financial dashboard — all wrapped in a magical UI.

**Live Demo:** [byte-bank-mauve.vercel.app](https://byte-bank-mauve.vercel.app)

<br>

## Highlights

- **Built** a wizarding-themed bank statement analyzer that parses uploaded PDFs, classifies transactions into 10 spending categories using a Naive Bayes ML classifier (TF-IDF + Multinomial NB), and delivers AI-generated financial advice via Google Gemini with ElevenLabs text-to-speech narration.
- **Integrated** Supabase Auth (PKCE + Row Level Security) with a React 18 frontend featuring drag-and-drop upload, gamified wizard-rank progression (Muggle → Order of Merlin), and a mobile-first responsive design with Framer Motion animations.
- **Deployed** on Vercel (frontend) and Render (backend) with a FastAPI service layer handling PDF extraction via `pdfplumber`, ML inference, and Gemini API orchestration.
- **Stack:** React · FastAPI · scikit-learn · Google Gemini · Supabase · ElevenLabs · Vercel · Render

<br>

## Team

| Member | Role |
|---|---|
| **Igor Goncalves** | Machine Learning |
| **Jordan Delp** | Backend Engineer |
| **Ryan Meyer** | Frontend Engineer |

<br>

## Features

- **PDF Statement Analysis** — Drag-and-drop upload, automatic text extraction, transaction parsing, and ML-powered categorization
- **AI Financial Advisor** — Gemini-powered chat that gives personalized spending advice based on your data
- **Audio Summaries** — ElevenLabs text-to-speech for financial summaries
- **User Authentication** — Supabase Auth with PKCE flow (sign up, sign in, sign out)
- **Profile Management** — Edit name, phone, avatar, currency, budget goals, notification preferences
- **Statement Archive** — Browse, inspect, and delete previously analyzed statements stored in Supabase
- **Financial Dashboard** — Aggregated income/expenses/balance, budget & savings progress bars, top spending categories, wizard rank progression
- **Gamification** — Wizard rank system (Muggle → Order of Merlin) based on analysis count and streak tracking
- **Responsive Design** — Mobile-first with Tailwind CSS, Framer Motion animations, and a custom wand cursor

<br>

## How It Works

1. **Upload** a bank statement PDF through the React frontend.
2. The FastAPI backend extracts text with `pdfplumber` and parses each line into a transaction (date, description, amount).
3. A **Naive Bayes classifier** (trained on TF-IDF features) categorizes every transaction into one of 10 spending categories.
4. **Gemini AI** generates a witty Gringotts-style financial summary and saving tips.
5. Results are returned as JSON and rendered on the **Budget** page with stat cards, category bars, a daily spending chart, and a transaction table.
6. Authenticated users can **save statements** to Supabase, view them in the **Archive**, and track aggregated finances on the **Dashboard**.

<br>

## Categories

| | | |
|---|---|---|
| 🍔 Food | 🏠 Rent | ⚡ Utilities |
| 🚗 Transportation | 🎬 Entertainment | 🛍️ Shopping |
| 🏥 Healthcare | 💰 Income | 🔄 Subscriptions |
| 📦 Other | | |

<br>

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Framer Motion, Lucide React |
| Backend | FastAPI, Uvicorn, Python 3.11 |
| AI / ML | scikit-learn (Multinomial Naive Bayes, TF-IDF), Google Gemini API, ElevenLabs TTS |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| PDF Parsing | pdfplumber |
| Deployment | Vercel (frontend), Render (backend) |

<br>

## Project Structure

```
├── backend/
│   ├── main.py                  # FastAPI server — /api/analyze-statement, /api/chat
│   ├── pipeline.py              # Data pipeline — extraction, cleaning, classification, metrics
│   ├── train_model.py           # Trains the Naive Bayes model, saves .pkl files
│   ├── test_gemini.py           # Gemini API integration tests
│   └── test_eleven_labs.py      # ElevenLabs TTS tests
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js           # Dev server + API proxy to :8000
│   ├── tailwind.config.js       # Custom wizarding color palette
│   ├── vercel.json              # Vercel deployment config
│   └── src/
│       ├── App.jsx              # Router, shared state, page transitions
│       ├── main.jsx             # Entry point with AuthProvider
│       ├── index.css            # Tailwind + custom animations
│       ├── demoData.js          # Sample data for offline demo
│       ├── supabase/
│       │   ├── client.js        # Supabase client (PKCE flow)
│       │   └── AuthContext.jsx  # Auth context — session, profile, sign in/out/up
│       ├── components/
│       │   ├── Navbar.jsx       # Sticky nav with Lucide icons, auth state
│       │   ├── Footer.jsx       # Three-column responsive footer
│       │   ├── ProtectedRoute.jsx # Route guard — redirects to /login
│       │   ├── MagicEffects.jsx # Particles, parallax, typewriter animations
│       │   └── LoadingOverlay.jsx # Full-screen loading during upload
│       └── pages/
│           ├── Home.jsx         # Drag-and-drop PDF upload
│           ├── Budget.jsx       # Spending breakdown, charts, transaction table
│           ├── Chat.jsx         # AI financial advisor chat
│           ├── Dashboard.jsx    # Financial Rundown — aggregated stats
│           ├── Statements.jsx   # Statement archive — list, detail, delete
│           ├── Profile.jsx      # Edit profile + preferences (tabbed)
│           ├── Login.jsx        # Sign in form
│           ├── Signup.jsx       # Sign up form
│           ├── AuthCallback.jsx # PKCE email confirmation handler
│           └── About.jsx        # Project info and team
│
├── data_generators/
│   ├── generate_sample_statement.py
│   └── generate_sample_BAD_statement.py
│
├── supabase_schema.sql          # Full database schema (profiles, bank_statements, RLS, triggers)
├── requirements.txt             # Python dependencies
├── render.yaml                  # Render deployment config
└── LICENSE
```

<br>

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com) API key (for Gemini)
- An [ElevenLabs](https://elevenlabs.io) API key (optional, for TTS)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/UgaHacks11.git
cd UgaHacks11
```

### 2. Database setup

1. Create a new project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** and run the contents of `supabase_schema.sql`.
3. Go to **Authentication → URL Configuration** and set:
   - **Site URL:** `http://localhost:5173`
   - **Redirect URLs:** `http://localhost:5173/auth/callback`

### 3. Backend

```bash
# Create a virtual environment & install dependencies
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Train the classifier (generates models/*.pkl)
python train_model.py

# Create a .env file in the project root
echo "GOOGLE_API_KEY=your-google-api-key" > .env
echo "ELEVENLABS_API_KEY=your-elevenlabs-key" >> .env
echo "FRONTEND_URL=http://localhost:5173" >> .env

# Start the API server
cd backend
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### 4. Frontend

```bash
cd frontend
npm install

# Create .env.local with your Supabase credentials
# (find these in Supabase Dashboard → Settings → API)
echo "VITE_SUPABASE_URL=https://your-project.supabase.co" > .env.local
echo "VITE_SUPABASE_ANON_KEY=your-anon-key" >> .env.local

npm run dev
```

The dev server starts at `http://localhost:5173` and proxies `/api/*` requests to the backend automatically.

<br>

## Environment Variables

### Backend (`.env` or Render dashboard)

| Variable | Description |
|---|---|
| `GOOGLE_API_KEY` | Google AI Studio API key for Gemini |
| `ELEVENLABS_API_KEY` | ElevenLabs API key for TTS (optional) |
| `FRONTEND_URL` | Frontend origin for CORS (e.g. `https://byte-bank-mauve.vercel.app`) |

### Frontend (`frontend/.env.local` or Vercel dashboard)

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |

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
    "category_spending": { "Food": 423.10, "Rent": 1200.00 },
    "daily_spending": { "01/15": 45.75, "01/16": 120.00 },
    "category_most_spent": "Rent",
    "category_least_spent": "Utilities"
  },
  "advisor_summary": "Your vault shows heavy spending on Rent..."
}
```

### `POST /api/chat`

Send a message to the AI financial advisor.

**Request** — JSON

```json
{
  "message": "How can I save more on food?",
  "spending_data": { "total_spent": 1847.53, "category_most_spent": "Food" },
  "transaction_count": 42
}
```

**Response** — `200 OK` — AI-generated financial advice text.

<br>

## Deployment

### Frontend → Vercel

1. Import the repo in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. Deploy.

### Backend → Render

1. Import the repo in [Render](https://render.com).
2. The `render.yaml` configures the service automatically.
3. Add environment variables in the Render dashboard: `GOOGLE_API_KEY`, `ELEVENLABS_API_KEY`, `FRONTEND_URL`.
4. Deploy.

### Supabase (production)

Update **Authentication → URL Configuration**:
- **Site URL:** `https://byte-bank-mauve.vercel.app`
- **Redirect URLs:** `https://byte-bank-mauve.vercel.app/auth/callback`

<br>

## Database Schema

The `supabase_schema.sql` file creates:

- **`profiles`** — User profiles (name, avatar, currency, budget goals, wizard rank, streak, notifications). Auto-created on signup via trigger.
- **`bank_statements`** — Parsed statement data (bank name, transactions JSONB, totals, category spending, AI summary). Wizard rank auto-updates on insert.
- **Row Level Security** — Users can only read/write their own data.
- **Triggers** — `updated_at` auto-refresh, auto-profile creation, wizard rank progression.

<br>

## License

See [LICENSE](LICENSE) for details.
