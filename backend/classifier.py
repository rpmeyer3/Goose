from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import pickle
from pathlib import Path
from typing import List, Tuple


from training_data import get_training_features_and_labels, get_category_display_name
from training_data import CATEGORY_INFO, get_all_categories, WIZARDING_TRAINING_DATA, get_category_display_name


class TransactionClassifier:
    """
    Classifier for categorizing transaction descriptions
    """

    def __init__(self):
        self.model = None
        self.pipeline = None
        self.is_trained = False

    def train(self):
        """
        Train the Naive Bayes classifier on wizarding transaction data
        """
        # Get training data
        features, labels = get_training_features_and_labels()

        # Create pipeline with TF-IDF vectorizer and Naive Bayes
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(
                lowercase=True,
                max_features=1000,
                ngram_range=(1, 2),  # Use unigrams and bigrams
                stop_words='english'
            )),
            ('classifier', MultinomialNB(alpha=0.1))
        ])

        # Train the model
        self.pipeline.fit(features, labels)
        self.is_trained = True

        print(f"✨ Classifier trained on {len(features)} wizarding transactions!")
        return self

    def predict(self, description: str) -> str:
        """
        Predict the category for a single transaction description
        """
        if not self.is_trained:
            raise ValueError("Classifier must be trained before making predictions")

        prediction = self.pipeline.predict([description])[0]
        return prediction

    def predict_batch(self, descriptions: List[str]) -> List[str]:
        """
        Predict categories for multiple transaction descriptions
        """
        if not self.is_trained:
            raise ValueError("Classifier must be trained before making predictions")

        predictions = self.pipeline.predict(descriptions)
        return predictions.tolist()

    def predict_with_probability(self, description: str) -> Tuple[str, float]:
        """
        Predict category with confidence probability
        """
        if not self.is_trained:
            raise ValueError("Classifier must be trained before making predictions")

        prediction = self.pipeline.predict([description])[0]
        probabilities = self.pipeline.predict_proba([description])[0]
        confidence = max(probabilities)

        return prediction, confidence

    def save_model(self, filepath: str = "models/classifier.pkl"):
        """
        Save the trained model to disk
        """
        if not self.is_trained:
            raise ValueError("Cannot save untrained model")

        # Create models directory if it doesn't exist
        Path(filepath).parent.mkdir(exist_ok=True)

        with open(filepath, 'wb') as f:
            pickle.dump(self.pipeline, f)

        print(f"💾 Model saved to {filepath}")

    def load_model(self, filepath: str = "models/classifier.pkl"):
        """
        Load a trained model from disk
        """
        if not Path(filepath).exists():
            raise FileNotFoundError(f"Model file not found: {filepath}")

        with open(filepath, 'rb') as f:
            self.pipeline = pickle.load(f)

        self.is_trained = True
        print(f"📂 Model loaded from {filepath}")
        return self

    def categorize_transaction(self, transaction: dict) -> dict:
        """
        Add category to a transaction dictionary
        """
        if 'description' not in transaction:
            raise ValueError("Transaction must have a 'description' field")

        category, confidence = self.predict_with_probability(transaction['description'])

        transaction['category'] = category
        transaction['category_name'] = get_category_display_name(category)
        transaction['confidence'] = round(confidence, 3)

        return transaction

    def categorize_transactions(self, transactions: List[dict]) -> List[dict]:
        """
        Add categories to a list of transactions
        """
        categorized = []

        for transaction in transactions:
            categorized.append(self.categorize_transaction(transaction.copy()))

        return categorized


# Global classifier instance
_classifier = None


def get_classifier():
    """
    Get or create the global classifier instance
    """
    global _classifier

    if _classifier is None:
        _classifier = TransactionClassifier()

        # Try to load existing model, otherwise train a new one
        try:
            _classifier.load_model()
        except FileNotFoundError:
            print("🎓 Training new classifier...")
            _classifier.train()
            _classifier.save_model()

    return _classifier
