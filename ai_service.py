"""
CivicAI - AI Service Module
============================
Unified AI service for complaint analysis.

Functions:
- preprocess(): Clean and prepare text
- classify_complaint(): Predict category
- predict_priority(): Predict priority
- analyze_complaint(): Full analysis (category + priority)
"""

import os
import pickle
import re
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')

# Load models
with open(os.path.join(MODELS_DIR, 'complaint_classifier.pkl'), 'rb') as f:
    classifier = pickle.load(f)

with open(os.path.join(MODELS_DIR, 'priority_model.pkl'), 'rb') as f:
    priority_model = pickle.load(f)

with open(os.path.join(MODELS_DIR, 'tfidf_vectorizer.pkl'), 'rb') as f:
    tfidf = pickle.load(f)

with open(os.path.join(MODELS_DIR, 'priority_features.pkl'), 'rb') as f:
    pri_features = pickle.load(f)

# Priority keyword rules (fallback for low confidence)
URGENCY_KEYWORDS = pri_features['urgency_keywords']
PRIORITY_ORDER = ['Low', 'Medium', 'High', 'Critical']


def preprocess(text):
    """Clean and normalize complaint text."""
    if not text or not isinstance(text, str):
        return ""
    # Lowercase
    text = text.lower()
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    # Remove special characters except basic punctuation
    text = re.sub(r'[^a-zA-Z0-9\s.,!?]', '', text)
    return text


def classify_complaint(text):
    """Predict complaint category."""
    clean_text = preprocess(text)
    if not clean_text:
        return {"category": "Other", "confidence": 0.0}

    X = tfidf.transform([clean_text])
    category = classifier.predict(X)[0]

    # Get confidence score
    try:
        scores = classifier.decision_function(X)[0]
        confidence = max(scores) / (sum(abs(s) for s in scores) / len(scores))
        confidence = min(abs(confidence), 1.0)
    except:
        confidence = 0.75

    return {"category": category, "confidence": round(float(confidence), 4)}


def extract_priority_features(text):
    """Extract keyword-based features for priority prediction."""
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


def predict_priority(text):
    """Predict complaint priority using ML + keyword rules."""
    clean_text = preprocess(text)
    if not clean_text:
        return {"priority": "Medium", "confidence": 0.0}

    # TF-IDF features
    tfidf_vec = tfidf.transform([clean_text]).toarray()

    # Keyword features
    kw_features = extract_priority_features(clean_text).reshape(1, -1)

    # Combine
    X_combined = np.hstack([tfidf_vec, kw_features])

    priority = priority_model.predict(X_combined)[0]

    # Get confidence
    try:
        probs = priority_model.predict_proba(X_combined)[0]
        confidence = max(probs)
    except:
        confidence = 0.60

    # Keyword-based fallback correction for critical cases
    text_lower = clean_text
    critical_count = sum(1 for kw in URGENCY_KEYWORDS['Critical'] if kw in text_lower)
    if critical_count >= 2 and priority != 'Critical':
        priority = 'Critical'
        confidence = max(confidence, 0.70)

    return {"priority": priority, "confidence": round(float(confidence), 4)}


def analyze_complaint(text):
    """
    Full AI analysis of a complaint.

    Returns:
        {
            "category": str,
            "priority": str,
            "confidence": float
        }
    """
    cat_result = classify_complaint(text)
    pri_result = predict_priority(text)

    # Combined confidence
    combined_conf = round((cat_result['confidence'] + pri_result['confidence']) / 2, 4)

    return {
        "category": cat_result['category'],
        "priority": pri_result['priority'],
        "confidence": combined_conf
    }


if __name__ == "__main__":
    # Quick test
    test_complaints = [
        "There is a huge pothole on the main road causing accidents",
        "No water supply for the last 3 days",
        "Garbage is overflowing from the dustbin",
        "Power outage for the entire area since morning",
        "Drain is completely blocked and overflowing",
        "Street fight is happening right now"
    ]

    print("=" * 60)
    print("CivicAI - AI Service Test")
    print("=" * 60)

    for complaint in test_complaints:
        result = analyze_complaint(complaint)
        print(f"\nComplaint: {complaint}")
        print(f"  Category: {result['category']}")
        print(f"  Priority: {result['priority']}")
        print(f"  Confidence: {result['confidence']:.2%}")

    print("\n" + "=" * 60)
