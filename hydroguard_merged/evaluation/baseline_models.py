"""
HydroGuard-XAI - Evaluation: Baseline Model Comparison
Compares the current Random Forest classifier against a linear baseline (Logistic
Regression) and a boosted-tree baseline (XGBoost) — addresses the "no baseline
comparison" gap flagged in review.

Usage:
    python baseline_models.py --data ml/data/processed/hybrid_real_plus_synthetic.csv
"""

import argparse
import logging
import json

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

try:
    from xgboost import XGBClassifier
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml.preprocessing import FEATURE_COLUMNS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("baseline_models")

MODELS = {
    "logistic_regression": lambda seed: LogisticRegression(max_iter=1000, random_state=seed),
    "random_forest": lambda seed: RandomForestClassifier(
        n_estimators=100, max_depth=10, min_samples_split=4, min_samples_leaf=2,
        random_state=seed, n_jobs=1
    ),
}
if XGBOOST_AVAILABLE:
    MODELS["xgboost"] = lambda seed: XGBClassifier(
        n_estimators=150, max_depth=6, learning_rate=0.1,
        random_state=seed, eval_metric="mlogloss", n_jobs=1
    )
else:
    logger.warning("xgboost not installed — skipping XGBoost baseline. `pip install xgboost` to enable.")


def evaluate_models(df: pd.DataFrame, test_size: float = 0.2, seed: int = 42) -> dict:
    df = df.dropna(subset=["pollution_risk"]).reset_index(drop=True)
    X_raw = df[FEATURE_COLUMNS].values
    y_raw = df["pollution_risk"].values

    # XGBoost needs integer-encoded labels
    classes = sorted(pd.unique(y_raw))
    class_to_idx = {c: i for i, c in enumerate(classes)}
    y_encoded = np.array([class_to_idx[v] for v in y_raw])

    X_train_raw, X_test_raw, y_train_raw, y_test_raw, y_train_enc, y_test_enc = train_test_split(
        X_raw, y_raw, y_encoded, test_size=test_size, random_state=seed, stratify=y_raw
    )

    imputer = SimpleImputer(strategy="median")
    scaler = StandardScaler()
    X_train = scaler.fit_transform(imputer.fit_transform(X_train_raw))
    X_test = scaler.transform(imputer.transform(X_test_raw))

    results = {}
    for name, model_fn in MODELS.items():
        model = model_fn(seed)
        if name == "xgboost":
            model.fit(X_train, y_train_enc)
            y_pred_enc = model.predict(X_test)
            y_pred = np.array([classes[i] for i in y_pred_enc])
            y_true = y_test_raw
        else:
            model.fit(X_train, y_train_raw)
            y_pred = model.predict(X_test)
            y_true = y_test_raw

        results[name] = {
            "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
            "precision": round(float(precision_score(y_true, y_pred, average="weighted", zero_division=0)), 4),
            "recall": round(float(recall_score(y_true, y_pred, average="weighted", zero_division=0)), 4),
            "f1": round(float(f1_score(y_true, y_pred, average="weighted", zero_division=0)), 4),
        }
        logger.info(f"{name:20s}  acc={results[name]['accuracy']:.4f}  f1={results[name]['f1']:.4f}")

    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Compare RF against baseline models")
    parser.add_argument("--data", required=True)
    parser.add_argument("--output", default="evaluation/figures/baseline_comparison.json")
    args = parser.parse_args()

    df = pd.read_csv(args.data)
    results = evaluate_models(df)

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w") as f:
        json.dump(results, f, indent=2)

    logger.info(f"Saved comparison to {args.output}")
