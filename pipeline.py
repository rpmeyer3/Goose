import re
import os
import pickle
import pdfplumber
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODELS_DIR, "naive_bayes_model.pkl")
VECTORIZER_PATH = os.path.join(MODELS_DIR, "vectorizer.pkl")

CATEGORIES = ["Food", "Rent", "Utilities", "Transportation", "Entertainment",
               "Shopping", "Healthcare", "Income", "Subscriptions", "Other"]

TRAINING_DATA = [
    ("mcdonalds burger meal", "Food"), ("starbucks coffee", "Food"),
    ("chick fil a sandwich", "Food"), ("uber eats delivery", "Food"),
    ("pizza hut order", "Food"), ("subway sandwich", "Food"),
    ("chipotle burrito bowl", "Food"), ("grubhub order", "Food"),
    ("doordash delivery fee", "Food"), ("taco bell drive thru", "Food"),
    ("kroger grocery", "Food"), ("walmart grocery pickup", "Food"),
    ("whole foods market", "Food"), ("trader joes", "Food"),
    ("publix supermarket", "Food"), ("aldi grocery store", "Food"),
    ("restaurant dinner", "Food"), ("bakery purchase", "Food"),
    ("monthly rent payment", "Rent"), ("apartment lease", "Rent"),
    ("rent deposit check", "Rent"), ("property management rent", "Rent"),
    ("landlord rent transfer", "Rent"), ("housing payment", "Rent"),
    ("lease renewal fee", "Rent"), ("rent autopay", "Rent"),
    ("electric bill payment", "Utilities"), ("water bill", "Utilities"),
    ("gas utility payment", "Utilities"), ("internet service provider", "Utilities"),
    ("comcast xfinity bill", "Utilities"), ("att phone bill", "Utilities"),
    ("verizon wireless payment", "Utilities"), ("tmobile monthly", "Utilities"),
    ("power company payment", "Utilities"), ("sewage bill", "Utilities"),
    ("uber ride", "Transportation"), ("lyft ride fare", "Transportation"),
    ("shell gas station", "Transportation"), ("bp fuel purchase", "Transportation"),
    ("exxon gasoline", "Transportation"), ("parking garage fee", "Transportation"),
    ("toll road charge", "Transportation"), ("bus pass monthly", "Transportation"),
    ("metro transit fare", "Transportation"), ("car wash service", "Transportation"),
    ("netflix subscription", "Entertainment"), ("spotify premium", "Entertainment"),
    ("hulu streaming", "Entertainment"), ("movie theater ticket", "Entertainment"),
    ("concert ticket purchase", "Entertainment"), ("amc theaters", "Entertainment"),
    ("disney plus monthly", "Entertainment"), ("hbo max subscription", "Entertainment"),
    ("amazon purchase", "Shopping"), ("target store", "Shopping"),
    ("walmart store purchase", "Shopping"), ("best buy electronics", "Shopping"),
    ("costco wholesale", "Shopping"), ("home depot supplies", "Shopping"),
    ("nike store", "Shopping"), ("macys department store", "Shopping"),
    ("nordstrom purchase", "Shopping"), ("etsy handmade", "Shopping"),
    ("cvs pharmacy prescription", "Healthcare"), ("walgreens pharmacy", "Healthcare"),
    ("doctor office visit copay", "Healthcare"), ("dental cleaning", "Healthcare"),
    ("urgent care visit", "Healthcare"), ("hospital bill payment", "Healthcare"),
    ("health insurance premium", "Healthcare"), ("eye exam optometrist", "Healthcare"),
    ("vision care glasses", "Healthcare"), ("therapy session copay", "Healthcare"),
    ("payroll direct deposit", "Income"), ("salary payment", "Income"),
    ("freelance payment received", "Income"), ("venmo transfer received", "Income"),
    ("zelle payment received", "Income"), ("tax refund deposit", "Income"),
    ("bonus payment", "Income"), ("dividend income", "Income"),
    ("interest earned savings", "Income"), ("cashback reward deposit", "Income"),
    ("apple icloud storage", "Subscriptions"), ("adobe creative cloud", "Subscriptions"),
    ("gym membership monthly", "Subscriptions"), ("youtube premium", "Subscriptions"),
    ("amazon prime membership", "Subscriptions"), ("dropbox plus plan", "Subscriptions"),
    ("microsoft office 365", "Subscriptions"), ("audible monthly", "Subscriptions"),
    ("atm withdrawal", "Other"), ("bank service fee", "Other"),
    ("overdraft fee charge", "Other"), ("wire transfer fee", "Other"),
    ("check deposit", "Other"), ("cash deposit atm", "Other"),
    ("venmo payment sent", "Other"), ("zelle sent", "Other"),
]


def clean_text(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z\s]", "", text)
    return re.sub(r"\s+", " ", text).strip()


def extract_text_from_pdf(path: str) -> str:
    pages = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            content = page.extract_text()
            if content:
                pages.append(content)
    return "\n".join(pages).strip()


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


def train_model():
    os.makedirs(MODELS_DIR, exist_ok=True)
    descriptions = [clean_text(d) for d, _ in TRAINING_DATA]
    labels = [l for _, l in TRAINING_DATA]
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=5000)
    X = vectorizer.fit_transform(descriptions)
    model = MultinomialNB(alpha=0.1)
    model.fit(X, labels)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(VECTORIZER_PATH, "wb") as f:
        pickle.dump(vectorizer, f)
    return model, vectorizer


def load_model():
    if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
        return train_model()
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(VECTORIZER_PATH, "rb") as f:
        vectorizer = pickle.load(f)
    return model, vectorizer


def classify_transactions(df: pd.DataFrame, model, vectorizer) -> pd.DataFrame:
    if df.empty:
        df["category"] = []
        return df
    cleaned = df["description"].apply(clean_text)
    features = vectorizer.transform(cleaned)
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


def analyze_pdf(path: str) -> dict:
    model, vectorizer = load_model()
    raw_text = extract_text_from_pdf(path)
    if not raw_text:
        return {"error": "Could not extract text from PDF."}
    df = parse_transactions(raw_text)
    if df.empty:
        return {"error": "No transactions found in PDF."}
    df = classify_transactions(df, model, vectorizer)
    metrics = compute_metrics(df)
    return {
        "transactions": df.to_dict(orient="records"),
        "metrics": metrics,
    }
