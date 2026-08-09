import os
import pandas as pd
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
dataset_path = os.path.join(BASE_DIR, 'dataset.csv')
cat_model_path = os.path.join(BASE_DIR, 'category_model.pkl')
pri_model_path = os.path.join(BASE_DIR, 'priority_model.pkl')

# Load dataset
df = pd.read_csv(dataset_path)

# Category Classification Pipeline
category_pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words='english', ngram_range=(1, 2))),
    ('clf', LinearSVC())
])

X_train, X_test, y_train, y_test = train_test_split(
    df['complaint'], df['category'], test_size=0.2, random_state=42
)

category_pipeline.fit(X_train, y_train)
y_pred = category_pipeline.predict(X_test)

print("=== CATEGORY CLASSIFICATION ===")
print(f"Accuracy: {accuracy_score(y_test, y_pred):.2f}")
print(classification_report(y_test, y_pred))

with open(cat_model_path, 'wb') as f:
    pickle.dump(category_pipeline, f)

# Priority Classification Pipeline
priority_pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words='english', ngram_range=(1, 2))),
    ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
])

X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(
    df['complaint'], df['priority'], test_size=0.2, random_state=42
)

priority_pipeline.fit(X_train_p, y_train_p)
y_pred_p = priority_pipeline.predict(X_test_p)

print("\n=== PRIORITY CLASSIFICATION ===")
print(f"Accuracy: {accuracy_score(y_test_p, y_pred_p):.2f}")
print(classification_report(y_test_p, y_pred_p))

with open(pri_model_path, 'wb') as f:
    pickle.dump(priority_pipeline, f)

print("\n[SUCCESS] Models trained and saved successfully!")
