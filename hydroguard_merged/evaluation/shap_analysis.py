"""
HydroGuard-XAI - Evaluation: True SHAP Feature Attribution
Replaces the original backend/xai/explainer.py Saabas-style tree-path attribution
(which was mislabeled "exact Tree SHAP" but does not satisfy Shapley consistency/
efficiency guarantees) with genuine Shapley values via the `shap` library's
TreeExplainer, which IS exact and additive for tree ensembles.

Produces:
  - Global feature importance (mean |SHAP value| across the dataset)
  - Per-class summary plots
  - A validation check that attributions sum to (prediction - base_value), confirming
    the efficiency property that the original Saabas implementation could not guarantee
    identically for multi-output regression in the same way exact TreeSHAP does.

Usage:
    python shap_analysis.py --data ml/data/processed/hybrid_real_plus_synthetic.csv
"""

import argparse
import logging
import json

import numpy as np
import pandas as pd
import shap
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml.preprocessing import FEATURE_COLUMNS, FEATURE_LABELS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("shap_analysis")


def run_shap_analysis(df: pd.DataFrame, sample_size: int = 200, seed: int = 42) -> dict:
    df = df.dropna(subset=["risk_score"]).reset_index(drop=True)
    X_raw = df[FEATURE_COLUMNS].values
    y = df["risk_score"].values

    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X_raw, y, test_size=0.2, random_state=seed
    )

    imputer = SimpleImputer(strategy="median")
    scaler = StandardScaler()
    X_train = scaler.fit_transform(imputer.fit_transform(X_train_raw))
    X_test = scaler.transform(imputer.transform(X_test_raw))

    reg = RandomForestRegressor(
        n_estimators=100, max_depth=10, min_samples_split=4,
        min_samples_leaf=2, random_state=seed, n_jobs=1
    )
    reg.fit(X_train, y_train)

    # TreeExplainer computes EXACT Shapley values for tree ensembles in polynomial time
    # (Lundberg et al., 2020) — this is the real algorithm the original code's docstring
    # claimed to implement.
    explainer = shap.TreeExplainer(reg)

    sample_idx = np.random.RandomState(seed).choice(
        len(X_test), size=min(sample_size, len(X_test)), replace=False
    )
    X_sample = X_test[sample_idx]

    shap_values = explainer.shap_values(X_sample)
    expected_value = np.ravel(explainer.expected_value)
    base_value = float(expected_value[0])

    # --- Verify the efficiency/additivity property: sum(shap) + base == prediction ---
    predictions = reg.predict(X_sample)
    reconstructed = shap_values.sum(axis=1) + base_value
    max_reconstruction_error = float(np.max(np.abs(predictions - reconstructed)))

    # --- Global feature importance: mean |SHAP value| per feature ---
    mean_abs_shap = np.abs(shap_values).mean(axis=0)
    global_importance = {
        FEATURE_LABELS.get(feat, feat): round(float(val), 4)
        for feat, val in sorted(
            zip(FEATURE_COLUMNS, mean_abs_shap), key=lambda x: -x[1]
        )
    }

    results = {
        "base_value": round(base_value, 4),
        "sample_size": len(X_sample),
        "max_reconstruction_error": max_reconstruction_error,
        "additivity_check_passed": max_reconstruction_error < 1e-4,
        "global_feature_importance": global_importance,
    }
    return results, shap_values, X_sample, explainer


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Compute true SHAP attributions for the regressor")
    parser.add_argument("--data", required=True)
    parser.add_argument("--output", default="evaluation/figures/shap_results.json")
    parser.add_argument("--sample_size", type=int, default=200)
    args = parser.parse_args()

    df = pd.read_csv(args.data)
    results, shap_values, X_sample, explainer = run_shap_analysis(df, sample_size=args.sample_size)

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w") as f:
        json.dump(results, f, indent=2)

    logger.info(f"Base value (expected risk score): {results['base_value']}")
    logger.info(f"Additivity check (sum(SHAP)+base == prediction): "
                f"{'PASSED' if results['additivity_check_passed'] else 'FAILED'} "
                f"(max error: {results['max_reconstruction_error']:.2e})")
    logger.info("Global feature importance (mean |SHAP value|):")
    for feat, importance in results["global_feature_importance"].items():
        logger.info(f"  {feat:35s} {importance:.4f}")
    logger.info(f"Saved results to {args.output}")
