"""
CivicAI - AI Testing Script
============================
Test AI models on unseen complaints.
"""

import sys
import os
import csv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from ai_service import analyze_complaint

def run_tests():
    print("=" * 70)
    print("CivicAI - AI Model Testing on Unseen Complaints")
    print("=" * 70)

    dataset_path = os.path.join(BASE_DIR, 'data', 'test_dataset.csv')
    with open(dataset_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        tests = list(reader)

    cat_correct = 0
    pri_correct = 0
    total = len(tests)

    print(f"\nTotal test cases: {total}\n")
    print(f"{'#':<3} {'Complaint':<50} {'Exp Cat':<10} {'Pred Cat':<10} {'Exp Pri':<10} {'Pred Pri':<10} {'Status'}")
    print("-" * 120)

    for i, test in enumerate(tests, 1):
        complaint = test['complaint']
        exp_cat = test['expected_category']
        exp_pri = test['expected_priority']

        result = analyze_complaint(complaint)
        pred_cat = result['category']
        pred_pri = result['priority']

        cat_match = pred_cat == exp_cat
        pri_match = pred_pri == exp_pri

        if cat_match:
            cat_correct += 1
        if pri_match:
            pri_correct += 1

        status = "[PASS]" if (cat_match and pri_match) else ("[WARN]" if (cat_match or pri_match) else "[FAIL]")

        short_complaint = complaint[:47] + "..." if len(complaint) > 50 else complaint
        print(f"{i:<3} {short_complaint:<50} {exp_cat:<10} {pred_cat:<10} {exp_pri:<10} {pred_pri:<10} {status}")

    print("-" * 120)
    print(f"\nCategory Accuracy: {cat_correct}/{total} = {cat_correct/total*100:.1f}%")
    print(f"Priority Accuracy: {pri_correct}/{total} = {pri_correct/total*100:.1f}%")
    print(f"Overall (both correct): {(cat_correct + pri_correct)/(total*2)*100:.1f}%")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
