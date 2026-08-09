"""
CivicAI - Unified Model Trainer
===============================
Trains all models (category and priority) on data/civic_complaints.csv
and saves synchronized model artifacts to models/ and ai/.
"""

import os
import re
import pickle
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'civic_complaints.csv')
MODELS_DIR = os.path.join(BASE_DIR, 'models')
AI_DIR = os.path.join(BASE_DIR, 'ai')

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(AI_DIR, exist_ok=True)

URGENCY_KEYWORDS = {
    'Critical': ['accident', 'fire', 'burst', 'dangerous', 'critical', 'emergency', 'death', 'injured', 'hospital', 'surgery', 'outage', 'completely', 'blocked', 'overflowing', 'entering', 'robbery', 'fight', 'violence', 'theft', 'missing', 'fallen', 'died', 'no water', 'no electricity'],
    'High': ['high', 'urgent', 'damaged', 'broken', 'leaking', 'pollution', 'unsafe', 'attacking', 'overcrowded', 'irregular', 'frequent', 'major', 'serious', 'health', 'bad', 'poor', 'not working', 'not coming'],
    'Medium': ['medium', 'needs', 'repair', 'cleaning', 'incomplete', 'pending'],
    'Low': ['low', 'small', 'minor', 'needed', 'suggestion', 'request', 'install', 'would be nice']
}

def preprocess(text):
    if not text or not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'\s+', ' ', text).strip()
    text = re.sub(r'[^a-zA-Z0-9\s.,!?]', '', text)
    return text

def extract_priority_features(text):
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

def train():
    print("Loading dataset from:", DATA_PATH)
    df = pd.read_csv(DATA_PATH)
    df['clean_complaint'] = df['complaint'].apply(preprocess)

    # 1. Fit TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    X_tfidf = vectorizer.fit_transform(df['clean_complaint'])

    # 2. Category Classifier (LinearSVC)
    clf_category = LinearSVC(random_state=42)
    clf_category.fit(X_tfidf, df['category'])

    # 3. Priority Classifier (RandomForestClassifier with TF-IDF + Keyword features)
    kw_features_list = [extract_priority_features(t) for t in df['clean_complaint']]
    X_kw = np.array(kw_features_list)
    X_combined = np.hstack([X_tfidf.toarray(), X_kw])

    clf_priority = RandomForestClassifier(n_estimators=100, random_state=42)
    clf_priority.fit(X_combined, df['priority'])

    # 4. Save artifacts in models/
    with open(os.path.join(MODELS_DIR, 'tfidf_vectorizer.pkl'), 'wb') as f:
        pickle.dump(vectorizer, f)

    with open(os.path.join(MODELS_DIR, 'complaint_classifier.pkl'), 'wb') as f:
        pickle.dump(clf_category, f)

    with open(os.path.join(MODELS_DIR, 'priority_model.pkl'), 'wb') as f:
        pickle.dump(clf_priority, f)

    with open(os.path.join(MODELS_DIR, 'priority_features.pkl'), 'wb') as f:
        pickle.dump({'urgency_keywords': URGENCY_KEYWORDS}, f)

    # 5. Save Pipelines in ai/ for predict.py
    cat_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english', ngram_range=(1, 2))),
        ('clf', LinearSVC(random_state=42))
    ])
    cat_pipeline.fit(df['complaint'], df['category'])
    with open(os.path.join(AI_DIR, 'category_model.pkl'), 'wb') as f:
        pickle.dump(cat_pipeline, f)

    pri_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english', ngram_range=(1, 2))),
        ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    pri_pipeline.fit(df['complaint'], df['priority'])
    with open(os.path.join(AI_DIR, 'priority_model.pkl'), 'wb') as f:
        pickle.dump(pri_pipeline, f)

    print("[SUCCESS] All model artifacts saved successfully in models/ and ai/!")

if __name__ == "__main__":
    train()
