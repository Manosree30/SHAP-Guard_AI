"""
HydroGuard-XAI - Evaluation: Full Evaluation Runner
Runs cross-validation, baseline comparison, and SHAP analysis across all available
data sources (synthetic / real / hybrid) and writes a single comparison summary
suitable for a paper's results table.

Usage:
    python run_full_evaluation.py
"""

import os
import json
import logging

import pandas as pd

import cross_validation
import baseline_models
import shap_analysis

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("run_full_evaluation")

DATASETS = {
    "synthetic": "ml/data/river_water_quality_demo.csv",
    "real": "ml/data/processed/train_real.csv",
    "hybrid": "ml/data/processed/hybrid_real_plus_synthetic.csv",
}


def main(output_dir="evaluation/figures"):
    os.makedirs(output_dir, exist_ok=True)
    summary = {}

    for label, path in DATASETS.items():
        if not os.path.exists(path):
            logger.warning(f"Skipping '{label}': {path} not found (run the data pipeline first)")
            continue

        df = pd.read_csv(path)
        if len(df) == 0:
            logger.warning(f"Skipping '{label}': {path} has 0 rows")
            continue

        logger.info(f"\n{'='*20} {label.upper()} (n={len(df)}) {'='*20}")
        entry = {"n_samples": len(df)}

        try:
            cv_results = cross_validation.run_cv(df, k=5)
            entry["cross_validation"] = cv_results
        except Exception as e:
            logger.error(f"CV failed for {label}: {e}")

        try:
            baseline_results = baseline_models.evaluate_models(df)
            entry["baseline_comparison"] = baseline_results
        except Exception as e:
            logger.error(f"Baseline comparison failed for {label}: {e}")

        try:
            shap_results, _, _, _ = shap_analysis.run_shap_analysis(df, sample_size=min(200, len(df)))
            entry["shap_global_importance"] = shap_results["global_feature_importance"]
        except Exception as e:
            logger.error(f"SHAP analysis failed for {label}: {e}")

        summary[label] = entry

    out_path = os.path.join(output_dir, "full_evaluation_summary.json")
    with open(out_path, "w") as f:
        json.dump(summary, f, indent=2)
    logger.info(f"\nFull evaluation summary saved to {out_path}")

    # Print a compact comparison table for quick reference
    logger.info("\n--- Quick comparison (Random Forest accuracy, mean ± std across folds) ---")
    for label, entry in summary.items():
        if "cross_validation" in entry:
            acc = entry["cross_validation"]["accuracy"]
            logger.info(f"  {label:12s} n={entry['n_samples']:5d}  acc={acc['mean']:.4f} ± {acc['std']:.4f}")

    return summary


if __name__ == "__main__":
    main()
