"""AIService - Unified AI analysis service for complaints."""
from typing import Dict
from app.ml.classifier import ComplaintClassifier
from app.ml.priority import PriorityPredictor

class AIService:
    def __init__(self):
        self._classifier = None
        self._priority = None
        self._load_models()

    def _load_models(self):
        if self._classifier is None:
            self._classifier = ComplaintClassifier()
        if self._priority is None:
            self._priority = PriorityPredictor()

    def classify(self, text: str) -> Dict:
        return self._classifier.classify(text)

    def predict_priority(self, text: str) -> Dict:
        return self._priority.predict(text)

    def analyze(self, text: str) -> Dict:
        cat_result = self.classify(text)
        pri_result = self.predict_priority(text)
        combined_conf = round((cat_result['confidence'] + pri_result['confidence']) / 2, 4)
        return {
            "category": cat_result['category'],
            "priority": pri_result['priority'],
            "confidence": combined_conf
        }

_ai_service = None

def get_ai_service() -> AIService:
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service
