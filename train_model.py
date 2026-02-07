from pipeline import train_model

if __name__ == "__main__":
    model, vectorizer = train_model()
    print(f"Model classes: {list(model.classes_)}")
    print("Saved naive_bayes_model.pkl and vectorizer.pkl to models/")
