"""Complaint classification model wrapper."""
import pickle
import os
from typing import Dict
from app.ml.preprocessing import preprocess_text

MODELS_PATH = os.getenv("AI_MODELS_PATH", "./models")

class ComplaintClassifier:
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self._load_models()

    def _load_models(self):
        with open(f"{MODELS_PATH}/complaint_classifier.pkl", "rb") as f:
            self.model = pickle.load(f)
        with open(f"{MODELS_PATH}/tfidf_vectorizer.pkl", "rb") as f:
            self.vectorizer = pickle.load(f)

    def classify(self, text: str) -> Dict:
        clean_text = preprocess_text(text)
        if not clean_text:
            return {"category": "Other", "confidence": 0.0}
        X = self.vectorizer.transform([clean_text])
        category = self.model.predict(X)[0]
        try:
            scores = self.model.decision_function(X)[0]
            confidence = max(abs(scores)) / (sum(abs(s) for s in scores) / len(scores))
            confidence = min(abs(confidence), 1.0)
        except:
            confidence = 0.75
        return {"category": category, "confidence": round(float(confidence), 4)}
