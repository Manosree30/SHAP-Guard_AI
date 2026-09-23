"""
HydroGuard-XAI - Evaluation: Cross-Validation
Runs stratified k-fold cross-validation on a given dataset (real-only, synthetic-only,
or hybrid) and reports metrics with confidence intervals - addressing the "single
train/test split" weakness flagged in review.

Usage:
    python cross_validation.py --data ml/data/processed/hybrid_real_plus_synthetic.csv --k 5
    python cross_validation.py --data ml/data/river_water_quality_demo.csv --k 5 --label synthetic_only
"""

import argparse
import logging
import json

import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml.preprocessing import FEATURE_COLUMNS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("cross_validation")


def run_cv(df: pd.DataFrame, k: int = 5, random_state: int = 42) -> dict:
    """
    Runs stratified k-fold CV using the same RandomForestClassifier hyperparameters
    as ml/train_model.py, fitting a fresh imputer+scaler per fold (avoids test-fold
    leakage into preprocessing statistics).
    """
    df = df.dropna(subset=["pollution_risk"]).reset_index(drop=True)

    X_raw = df[FEATURE_COLUMNS].values
    y = df["pollution_risk"].values

    class_counts = pd.Series(y).value_counts()
    min_class_count = class_counts.min()
    if min_class_count < k:
        logger.warning(
            f"Smallest class '{class_counts.idxmin()}' has only {min_class_count} samples, "
            f"fewer than k={k}. Reducing k to {max(2, min_class_count)}."
        )
        k = max(2, int(min_class_count))

    skf = StratifiedKFold(n_splits=k, shuffle=True, random_state=random_state)

    fold_metrics = {"accuracy": [], "precision": [], "recall": [], "f1": []}

    for fold_idx, (train_idx, test_idx) in enumerate(skf.split(X_raw, y), start=1):
        X_train_raw, X_test_raw = X_raw[train_idx], X_raw[test_idx]
        y_train, y_test = y[train_idx], y[test_idx]

        imputer = SimpleImputer(strategy="median")
        scaler = StandardScaler()
        X_train = scaler.fit_transform(imputer.fit_transform(X_train_raw))
        X_test = scaler.transform(imputer.transform(X_test_raw))

        clf = RandomForestClassifier(
            n_estimators=100, max_depth=10, min_samples_split=4,
            min_samples_leaf=2, random_state=random_state, n_jobs=1
        )
        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)

        fold_metrics["accuracy"].append(accuracy_score(y_test, y_pred))
        fold_metrics["precision"].append(precision_score(y_test, y_pred, average="weighted", zero_division=0))
        fold_metrics["recall"].append(recall_score(y_test, y_pred, average="weighted", zero_division=0))
        fold_metrics["f1"].append(f1_score(y_test, y_pred, average="weighted", zero_division=0))

        logger.info(f"Fold {fold_idx}/{k}: acc={fold_metrics['accuracy'][-1]:.4f}")

    summary = {}
    for metric, values in fold_metrics.items():
        summary[metric] = {
            "mean": round(float(np.mean(values)), 4),
            "std": round(float(np.std(values)), 4),
            "ci95_low": round(float(np.mean(values) - 1.96 * np.std(values) / np.sqrt(len(values))), 4),
            "ci95_high": round(float(np.mean(values) + 1.96 * np.std(values) / np.sqrt(len(values))), 4),
            "per_fold": [round(v, 4) for v in values],
        }
    summary["k_folds_used"] = k
    summary["n_samples"] = len(df)
    summary["class_distribution"] = class_counts.to_dict()
    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Stratified k-fold CV for HydroGuard-XAI classifier")
    parser.add_argument("--data", required=True, help="Path to CSV with FEATURE_COLUMNS + pollution_risk")
    parser.add_argument("--k", type=int, default=5)
    parser.add_argument("--label", default="run", help="Label for this run, used in output filename")
    parser.add_argument("--output_dir", default="evaluation/figures")
    args = parser.parse_args()

    df = pd.read_csv(args.data)
    results = run_cv(df, k=args.k)

    os.makedirs(args.output_dir, exist_ok=True)
    out_path = os.path.join(args.output_dir, f"cv_results_{args.label}.json")
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)

    logger.info(f"\n=== {args.label} ({results['n_samples']} samples, k={results['k_folds_used']}) ===")
    for metric in ["accuracy", "precision", "recall", "f1"]:
        m = results[metric]
        logger.info(f"  {metric:10s}: {m['mean']:.4f} ± {m['std']:.4f}  (95% CI: [{m['ci95_low']:.4f}, {m['ci95_high']:.4f}])")
    logger.info(f"Saved detailed results to {out_path}")
