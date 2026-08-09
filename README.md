# 🚀 CivicAI — Stage 2: AI Model Development

Complete AI pipeline for Smart Civic Complaint System.

## 📁 Stage 2 Output

```
civicai-stage2/
├── data/
│   ├── civic_complaints.csv      # Final dataset (130 samples)
│   ├── X_train.csv               # Training features
│   ├── X_test.csv                # Testing features
│   ├── y_cat_train.csv           # Training categories
│   ├── y_cat_test.csv            # Testing categories
│   ├── y_pri_train.csv           # Training priorities
│   ├── y_pri_test.csv            # Testing priorities
│   └── test_dataset.csv          # Unseen test cases (15 samples)
├── models/
│   ├── complaint_classifier.pkl  # Trained category model
│   ├── priority_model.pkl        # Trained priority model
│   ├── tfidf_vectorizer.pkl      # Text vectorizer
│   └── priority_features.pkl     # Keyword feature config
├── tests/
│   └── test_ai.py                # AI testing script
├── ai_service.py                 # Unified AI service
├── evaluation_report.json        # Model evaluation metrics
├── AI_LIMITATIONS.md             # Known limitations
├── requirements.txt              # Python dependencies
└── README.md                     # This file
```

## 🛠️ Setup

```bash
pip install -r requirements.txt
```

## 🤖 AI Service Usage

```python
from ai_service import analyze_complaint

result = analyze_complaint("Street light is not working near my house")
print(result)
# Output: {"category": "Electricity", "priority": "Medium", "confidence": 0.82}
```

### Individual Functions

```python
from ai_service import classify_complaint, predict_priority

# Category only
cat = classify_complaint("Garbage is overflowing")
# {"category": "Waste", "confidence": 0.91}

# Priority only
pri = predict_priority("Main road par accident ho gaya hai")
# {"priority": "Critical", "confidence": 0.75}
```

## 🧪 Run Tests

```bash
python tests/test_ai.py
```

Tests 15 unseen complaints and shows accuracy.

## 📊 Evaluation Results

### Complaint Classification
| Metric | Value |
|--------|-------|
| Model | LinearSVC |
| Accuracy | 76.9% |
| Precision | 81.9% |
| Recall | 76.9% |
| F1 Score | 75.0% |

### Priority Prediction
| Metric | Value |
|--------|-------|
| Model | LogisticRegression + Keywords |
| Accuracy | 38.5% |
| Precision | 32.9% |
| Recall | 38.5% |
| F1 Score | 34.0% |

> ⚠️ Priority prediction is inherently subjective. Same text can have different priorities based on context. More data needed for improvement.

## 📋 Dataset Details

- **Total Samples**: 130
- **Train/Test Split**: 80/20 (104 train / 26 test)
- **Categories**: Road, Water, Waste, Electricity, Drainage, Safety, Other
- **Priorities**: Critical, High, Medium, Low
- **Stratified Split**: Maintains category distribution

## 🔮 Next Stage

**Stage 3**: FastAPI Backend Integration

```
React Frontend
    ↓
FastAPI Backend
    ↓
AI Service (this module)
    ↓
Database
```

## ⚠️ Known Limitations

See [AI_LIMITATIONS.md](AI_LIMITATIONS.md) for detailed analysis.

Key points:
- Small dataset (130 samples)
- Priority is subjective
- English only
- Ambiguous/multi-issue complaints may confuse model
- Confidence < 50% → human review recommended
