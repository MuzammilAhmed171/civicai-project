"""Priority prediction model wrapper."""
import pickle
import os
import numpy as np
from typing import Dict
from app.ml.preprocessing import preprocess_text

MODELS_PATH = os.getenv("AI_MODELS_PATH", "./models")

URGENCY_KEYWORDS = {
    'Critical': ['accident', 'fire', 'burst', 'dangerous', 'critical', 'emergency', 'death', 'injured', 'hospital', 'surgery', 'outage', 'completely', 'blocked', 'overflowing', 'entering', 'robbery', 'fight', 'violence', 'theft', 'missing', 'fallen', 'died', 'no water', 'no electricity'],
    'High': ['high', 'urgent', 'damaged', 'broken', 'leaking', 'pollution', 'unsafe', 'attacking', 'overcrowded', 'irregular', 'frequent', 'major', 'serious', 'health', 'bad', 'poor', 'not working', 'not coming'],
    'Medium': ['medium', 'needs', 'repair', 'cleaning', 'incomplete', 'pending'],
    'Low': ['low', 'small', 'minor', 'needed', 'suggestion', 'request', 'install', 'would be nice']
}

class PriorityPredictor:
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self._load_models()

    def _load_models(self):
        with open(f"{MODELS_PATH}/priority_model.pkl", "rb") as f:
            self.model = pickle.load(f)
        with open(f"{MODELS_PATH}/tfidf_vectorizer.pkl", "rb") as f:
            self.vectorizer = pickle.load(f)

    def _extract_keyword_features(self, text: str) -> np.ndarray:
        text_lower = text.lower()
        features = []
        for priority, keywords in URGENCY_KEYWORDS.items():
            count = sum(1 for kw in keywords if kw in text_lower)
            features.append(count)
        features.append(len(text))
        features.append(len(text.split()))
        features.append(text.count('!'))
        features.append(text.count('?'))
        features.append(sum(1 for c in text if c.isupper()) / max(len(text), 1))
        return np.array(features)

    def predict(self, text: str) -> Dict:
        clean_text = preprocess_text(text)
        if not clean_text:
            return {"priority": "Medium", "confidence": 0.0}
        tfidf_vec = self.vectorizer.transform([clean_text]).toarray()
        kw_features = self._extract_keyword_features(clean_text).reshape(1, -1)
        X_combined = np.hstack([tfidf_vec, kw_features])
        priority = self.model.predict(X_combined)[0]
        try:
            probs = self.model.predict_proba(X_combined)[0]
            confidence = max(probs)
        except:
            confidence = 0.60
        critical_count = sum(1 for kw in URGENCY_KEYWORDS['Critical'] if kw in clean_text)
        if critical_count >= 2 and priority != 'Critical':
            priority = 'Critical'
            confidence = max(confidence, 0.70)
        return {"priority": priority, "confidence": round(float(confidence), 4)}
