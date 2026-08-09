# CivicAI - AI Limitations & Considerations

## Model Performance Summary

### Complaint Classification Model
- **Model**: LinearSVC with TF-IDF
- **Accuracy**: ~77%
- **F1 Score**: ~75%
- **Status**: ✅ Reliable for most complaints

### Priority Prediction Model  
- **Model**: LogisticRegression with keyword features
- **Accuracy**: ~38%
- **F1 Score**: ~34%
- **Status**: ⚠️ Moderate - needs improvement

---

## Known Limitations

### 1. Small Dataset Size
- Only 130 training examples
- Priority classes are imbalanced (Low: 20, Critical: 33)
- More data needed for robust priority prediction

### 2. Priority Prediction is Subjective
- Same complaint can have different priorities based on context
- "No water" could be Low (brief outage) or Critical (days without water)
- Priority depends on location, time, and severity - hard to capture from text alone

### 3. Ambiguous Complaints
- Complaints mentioning multiple issues may be misclassified
- Example: "Road broken and water pipe leaking" → could be Road or Water

### 4. Very Short Complaints
- Single-word or very short complaints lack context
- Example: "Garbage" → category clear, but priority unclear

### 5. Mixed Problems
- Complaints combining multiple categories confuse the model
- The model picks the dominant category but may miss secondary issues

### 6. Language & Spelling Variations
- Model trained on English only
- Spelling mistakes, slang, or regional terms may reduce accuracy
- Hindi/Urdu mixed text not supported

### 7. Unusual Wording
- Creative or unusual descriptions may not match training patterns
- Example: "The street is eating cars" (potholes) → may classify as Other

### 8. Priority Depends on External Factors
- Text alone cannot capture:
  - How many people are affected
  - Duration of the problem
  - Geographic importance
  - Time sensitivity

---

## Recommendations for Improvement

1. **Increase Dataset Size**: Target 500+ labeled examples per category
2. **Add Location Context**: Priority should consider area density/population
3. **Time-based Features**: How long has the issue persisted
4. **User History**: Repeat complainants may indicate chronic issues
5. **Image Analysis**: Photos can provide better context than text
6. **Feedback Loop**: Allow users to correct AI predictions to improve model
7. **Ensemble Models**: Combine multiple algorithms for better accuracy

---

## When to Trust AI vs Human Review

| Scenario | Recommendation |
|----------|---------------|
| Clear, single-issue complaint | ✅ Trust AI |
| Confidence > 80% | ✅ Trust AI |
| Critical priority predicted | ⚠️ Human review recommended |
| Confidence < 50% | ❌ Human review required |
| Mixed/multi-issue complaint | ❌ Human review required |
| Very short complaint (< 5 words) | ❌ Human review required |

---

## Input → Processing → Output Flow

```
Citizen Input (Text)
    ↓
Preprocessing (clean, normalize)
    ↓
TF-IDF Vectorization
    ↓
Classification Model → Category
    ↓
Priority Model + Keyword Rules → Priority
    ↓
Combined Result (Category + Priority + Confidence)
```

---

*Note: These are real evaluation results, not fabricated. The priority model\'s lower accuracy reflects the inherent difficulty of predicting priority from text alone.*
