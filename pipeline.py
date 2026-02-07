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

# Updated categories for wizarding world
CATEGORIES = [
    "potions_ingredients",
    "magical_supplies",
    "books_education",
    "food_dining",
    "clothing_robes",
    "transportation",
    "entertainment",
    "healthcare",
    "pets_familiars",
    "utilities_services",
    "defense_equipment"
]

# Wizarding world training data
TRAINING_DATA = [
    # Potions & Ingredients
    ("Apothecary Dragon Scale purchase", "potions_ingredients"),
    ("Slug & Jiggers Apothecary", "potions_ingredients"),
    ("Unicorn hair from Diagon Alley", "potions_ingredients"),
    ("Powdered moonstone order", "potions_ingredients"),
    ("Bezoar stone emergency purchase", "potions_ingredients"),
    ("Flobberworm mucus bulk order", "potions_ingredients"),
    ("Armadillo bile potion supply", "potions_ingredients"),
    ("Essence of Dittany bottle", "potions_ingredients"),
    ("Lacewing flies jar", "potions_ingredients"),
    ("Boomslang skin precious", "potions_ingredients"),
    ("Fluxweed harvested midnight", "potions_ingredients"),
    ("Valerian root fresh supply", "potions_ingredients"),
    ("Phoenix tears vial", "potions_ingredients"),
    ("Ashwinder eggs dozen", "potions_ingredients"),
    ("Gillyweed for underwater breathing", "potions_ingredients"),

    # Magical Supplies & Equipment
    ("Ollivanders Wand Shop", "magical_supplies"),
    ("Quality Quidditch Supplies", "magical_supplies"),
    ("Wiseacre's Wizarding Equipment", "magical_supplies"),
    ("Cauldron thick copper purchase", "magical_supplies"),
    ("Crystal phials set of twelve", "magical_supplies"),
    ("Telescope brass astronomical", "magical_supplies"),
    ("Scales brass standard", "magical_supplies"),
    ("Quill self-inking enchanted", "magical_supplies"),
    ("Parchment premium dragon skin", "magical_supplies"),
    ("Broomstick maintenance kit", "magical_supplies"),
    ("Wand holster dragon hide", "magical_supplies"),
    ("Protective gloves dragon hide", "magical_supplies"),
    ("Magical trunk with compartments", "magical_supplies"),
    ("Owl cage enchanted", "magical_supplies"),
    ("Remembrall glass sphere", "magical_supplies"),

    # Books & Education
    ("Flourish and Blotts", "books_education"),
    ("Standard Book of Spells Grade", "books_education"),
    ("Hogwarts tuition payment", "books_education"),
    ("Advanced Potion Making textbook", "books_education"),
    ("Magical Theory by Adalbert", "books_education"),
    ("Defense Against Dark Arts manual", "books_education"),
    ("Transfiguration Today subscription", "books_education"),
    ("Ancient Runes dictionary", "books_education"),
    ("Astronomy charts updated", "books_education"),
    ("Care of Magical Creatures guide", "books_education"),
    ("Herbology illustrated encyclopedia", "books_education"),
    ("Charms comprehensive volume", "books_education"),
    ("Library late fee Hogwarts", "books_education"),
    ("Tutoring sessions arithmancy", "books_education"),
    ("Study materials N.E.W.T. level", "books_education"),
    ("Fantastic Beasts and Where to Find Them", "books_education"),

    # Food & Dining
    ("Honeydukes Sweet Shop", "food_dining"),
    ("Three Broomsticks Inn", "food_dining"),
    ("Leaky Cauldron meal", "food_dining"),
    ("Butterbeer at Hogsmeade", "food_dining"),
    ("Chocolate Frogs box", "food_dining"),
    ("Bertie Botts Every Flavour Beans", "food_dining"),
    ("Pumpkin Pasties dozen", "food_dining"),
    ("Cauldron Cakes pack", "food_dining"),
    ("Fizzing Whizzbees bag", "food_dining"),
    ("Sugar Quills bundle", "food_dining"),
    ("Honeydukes chocolate assortment", "food_dining"),
    ("Magical feast Great Hall", "food_dining"),
    ("Restaurant Madam Puddifoots", "food_dining"),
    ("Tea and crumpets Hogsmeade", "food_dining"),
    ("Treacle tart special order", "food_dining"),

    # Clothing & Robes
    ("Madam Malkins Robes", "clothing_robes"),
    ("Twilfitt and Tatting robes", "clothing_robes"),
    ("School robes black standard", "clothing_robes"),
    ("Dress robes formal occasion", "clothing_robes"),
    ("Winter cloak warming charm", "clothing_robes"),
    ("Pointed hat tall black", "clothing_robes"),
    ("Dragon hide boots protective", "clothing_robes"),
    ("Quidditch robes team colors", "clothing_robes"),
    ("Invisibility cloak repair", "clothing_robes"),
    ("Scarf house colors wool", "clothing_robes"),
    ("Gloves dragon hide lined", "clothing_robes"),
    ("Robe alterations tailoring", "clothing_robes"),
    ("Protective gear dragon handling", "clothing_robes"),
    ("Traveling cloak waterproof", "clothing_robes"),
    ("Uniform cleaning service", "clothing_robes"),

    # Transportation
    ("Hogwarts Express ticket", "transportation"),
    ("Knight Bus emergency fare", "transportation"),
    ("Floo Powder network travel", "transportation"),
    ("Portkey registration fee", "transportation"),
    ("Thestral carriage ride", "transportation"),
    ("Broomstick rental hourly", "transportation"),
    ("Apparition license exam", "transportation"),
    ("Ministry Floo Network pass", "transportation"),
    ("Flying carpet import permit", "transportation"),
    ("Enchanted vehicle maintenance", "transportation"),
    ("Broomstick parking permit", "transportation"),
    ("Diagon Alley carriage service", "transportation"),
    ("Magical taxi service", "transportation"),
    ("Travel trunk shipping", "transportation"),
    ("International Portkey booking", "transportation"),

    # Entertainment & Recreation
    ("Quidditch World Cup tickets", "entertainment"),
    ("Wizard chess set deluxe", "entertainment"),
    ("Exploding Snap card deck", "entertainment"),
    ("Gobstones tournament entry", "entertainment"),
    ("WWN Wireless subscription", "entertainment"),
    ("Daily Prophet subscription", "entertainment"),
    ("Witch Weekly magazine", "entertainment"),
    ("Quibbler special edition", "entertainment"),
    ("Theatre magical performance", "entertainment"),
    ("Concert Weird Sisters", "entertainment"),
    ("Museum of magical history", "entertainment"),
    ("Magical menagerie visit", "entertainment"),
    ("Quidditch match season pass", "entertainment"),
    ("Fireworks Weasleys Wizard Wheezes", "entertainment"),
    ("Magical cinema evening show", "entertainment"),

    # Healthcare & Wellness
    ("St Mungos Hospital treatment", "healthcare"),
    ("Pepper-Up Potion prescription", "healthcare"),
    ("Skele-Gro bone regrowth", "healthcare"),
    ("Madam Pomfrey consultation", "healthcare"),
    ("Blood-Replenishing Potion emergency", "healthcare"),
    ("Healer appointment scheduled", "healthcare"),
    ("Magical injury treatment", "healthcare"),
    ("Calming Draught prescription", "healthcare"),
    ("Dreamless Sleep Potion refill", "healthcare"),
    ("Anti-Venin antidote", "healthcare"),
    ("Magical malady diagnosis", "healthcare"),
    ("Spell damage reversal", "healthcare"),
    ("Curse breaking medical fee", "healthcare"),
    ("Dental wizard appointment", "healthcare"),
    ("Potion antidote emergency", "healthcare"),

    # Pets & Familiars
    ("Eeylops Owl Emporium", "pets_familiars"),
    ("Magical Menagerie", "pets_familiars"),
    ("Owl treats premium quality", "pets_familiars"),
    ("Cat Kneazle food specialty", "pets_familiars"),
    ("Toad food and supplies", "pets_familiars"),
    ("Owl post delivery service", "pets_familiars"),
    ("Pet grooming magical creatures", "pets_familiars"),
    ("Familiar health checkup", "pets_familiars"),
    ("Owl cage cleaning service", "pets_familiars"),
    ("Creature care supplies", "pets_familiars"),
    ("Phoenix feather toy", "pets_familiars"),
    ("Hippogriff grooming tools", "pets_familiars"),
    ("Bowtruckle habitat maintenance", "pets_familiars"),
    ("Niffler treasure safety deposit", "pets_familiars"),
    ("Pet boarding service holidays", "pets_familiars"),

    # Utilities & Services
    ("Gringotts vault rental", "utilities_services"),
    ("Ministry of Magic fees", "utilities_services"),
    ("Magical insurance premium", "utilities_services"),
    ("Owl post service monthly", "utilities_services"),
    ("Wand registration renewal", "utilities_services"),
    ("Property protective charms", "utilities_services"),
    ("House-elf service monthly", "utilities_services"),
    ("Magical repair services", "utilities_services"),
    ("Curse removal specialist", "utilities_services"),
    ("Prophecy consultation fee", "utilities_services"),
    ("Legal wizard services", "utilities_services"),
    ("Accountant goblin services", "utilities_services"),
    ("Security enchantment annual", "utilities_services"),
    ("Magical waste disposal", "utilities_services"),
    ("Enchantment maintenance contract", "utilities_services"),

    # Dark Arts & Defense (expensive/specialty)
    ("Defense equipment basilisk proof", "defense_equipment"),
    ("Anti-Dark Arts protective amulet", "defense_equipment"),
    ("Shielding spell components", "defense_equipment"),
    ("Defensive charm installation", "defense_equipment"),
    ("Patronus training course", "defense_equipment"),
    ("Dark detector Sneakoscope", "defense_equipment"),
    ("Foe-Glass security mirror", "defense_equipment"),
    ("Protective ward installation", "defense_equipment"),
    ("Curse detection service", "defense_equipment"),
    ("Counter-curse emergency kit", "defense_equipment"),
    ("Shield cloak enchanted", "defense_equipment"),
    ("Danger warning device", "defense_equipment"),
    ("Security consultation auror", "defense_equipment"),
    ("Protective runes carving", "defense_equipment"),
    ("Anti-jinx barrier setup", "defense_equipment"),
]

# Category descriptions for better understanding
CATEGORY_INFO = {
    "potions_ingredients": {
        "name": "Potions & Ingredients",
        "description": "Magical ingredients, potion supplies, and apothecary purchases",
        "icon": "🧪"
    },
    "magical_supplies": {
        "name": "Magical Supplies",
        "description": "Wands, cauldrons, and general wizarding equipment",
        "icon": "🪄"
    },
    "books_education": {
        "name": "Books & Education",
        "description": "Textbooks, tuition, and educational materials",
        "icon": "📚"
    },
    "food_dining": {
        "name": "Food & Dining",
        "description": "Meals, snacks, and magical confectionery",
        "icon": "🍰"
    },
    "clothing_robes": {
        "name": "Clothing & Robes",
        "description": "Robes, uniforms, and magical attire",
        "icon": "🧙‍♂️"
    },
    "transportation": {
        "name": "Transportation",
        "description": "Travel expenses, floo powder, and magical transit",
        "icon": "🚂"
    },
    "entertainment": {
        "name": "Entertainment",
        "description": "Quidditch, games, and recreational activities",
        "icon": "🎭"
    },
    "healthcare": {
        "name": "Healthcare",
        "description": "Medical treatments and healing potions",
        "icon": "💊"
    },
    "pets_familiars": {
        "name": "Pets & Familiars",
        "description": "Care and supplies for magical creatures",
        "icon": "🦉"
    },
    "utilities_services": {
        "name": "Utilities & Services",
        "description": "Vault fees, insurance, and magical services",
        "icon": "⚙️"
    },
    "defense_equipment": {
        "name": "Defense Equipment",
        "description": "Protective gear and dark arts defense items",
        "icon": "🛡️"
    }
}


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
    daily_spending = (
        df.loc[df["amount"] < 0]
        .groupby("date")["amount"]
        .sum()
        .abs()
        .to_dict()
    )
    most_spent = max(category_spending, key=category_spending.get) if category_spending else None
    least_spent = min(category_spending, key=category_spending.get) if category_spending else None
    return {
        "total_income": round(float(income), 2),
        "total_spent": round(float(abs(spent)), 2),
        "left_over": round(float(income) - float(abs(spent)), 2),
        "category_spending": {k: round(v, 2) for k, v in category_spending.items()},
        "daily_spending": {k: round(v, 2) for k, v in daily_spending.items()},
        "category_most_spent": most_spent,
        "category_least_spent": least_spent,
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
