import sys
import json
import pickle
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def predict(text):
    cat_model_path = os.path.join(BASE_DIR, 'category_model.pkl')
    pri_model_path = os.path.join(BASE_DIR, 'priority_model.pkl')
    with open(cat_model_path, 'rb') as f:
        category_model = pickle.load(f)
    with open(pri_model_path, 'rb') as f:
        priority_model = pickle.load(f)

    category = category_model.predict([text])[0]
    priority = priority_model.predict([text])[0]

    # Get confidence scores
    try:
        cat_scores = category_model.decision_function([text])[0]
        category_conf = max(cat_scores)
    except:
        category_conf = 0.85

    try:
        pri_scores = priority_model.predict_proba([text])[0]
        priority_conf = max(pri_scores)
    except:
        priority_conf = 0.80

    return {
        "category": category,
        "priority": priority,
        "confidence": round((abs(category_conf) + priority_conf) / 2, 2)
    }

if __name__ == "__main__":
    text = sys.argv[1] if len(sys.argv) > 1 else ""
    result = predict(text)
    print(json.dumps(result))
