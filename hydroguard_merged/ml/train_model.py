"""
HydroGuard-XAI - Machine Learning Model Training & Evaluation Script (v2, real-data-aware)
Trains Random Forest Classifier (Risk Classification) and Random Forest Regressor (Continuous Risk Score),
evaluates performance metrics, and saves model bundle for backend inference and XAI feature attribution.

CHANGE FROM v1: supports --source {synthetic,real,hybrid} so the model bundle and reported
metrics are explicit about what data trained them. Default remains 'synthetic' for
backward compatibility with the existing deployment, but 'real' / 'hybrid' are the
recommended sources once ml/data/real/labeled.csv exists (see ml/data_pipeline/).

Usage:
    python train_model.py --source synthetic   # original behavior
    python train_model.py --source real        # requires ml/data/processed/train_real.csv + test_real_holdout.csv
    python train_model.py --source hybrid       # requires ml/data/processed/hybrid_real_plus_synthetic.csv
"""

import os
import sys
import json
import argparse
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, mean_absolute_error, mean_squared_error, r2_score
)

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.dataset_generator import generate_sample_dataset
from ml.preprocessing import WaterQualityPreprocessor, FEATURE_COLUMNS


def load_data(source: str, base_dir: str):
    """
    Loads train/test data according to --source.
      - synthetic: original behavior, generates/loads the synthetic CSV and does an
        80/20 random split (unchanged from v1).
      - real: uses the temporal train/holdout split produced by
        ml/data_pipeline/merge_datasets.py (train_real.csv / test_real_holdout.csv).
      - hybrid: trains on hybrid_real_plus_synthetic.csv, evaluates on test_real_holdout.csv
        so the reported metrics still reflect real-world generalization, not just how well
        the model fits synthetic data it was partly trained on.
    """
    if source == "synthetic":
        data_dir = os.path.join(base_dir, "data")
        dataset_path = os.path.join(data_dir, "river_water_quality_demo.csv")
        if not os.path.exists(dataset_path):
            print("Generating realistic dataset (2,400 observations)...")
            df = generate_sample_dataset(2400, seed=42)
            df.to_csv(dataset_path, index=False)
        else:
            df = pd.read_csv(dataset_path)
        return train_test_split(df, test_size=0.20, random_state=42, stratify=df["pollution_risk"])

    elif source == "real":
        processed_dir = os.path.join(base_dir, "data", "processed")
        train_path = os.path.join(processed_dir, "train_real.csv")
        test_path = os.path.join(processed_dir, "test_real_holdout.csv")
        if not (os.path.exists(train_path) and os.path.exists(test_path)):
            raise FileNotFoundError(
                f"Real data not found at {train_path} / {test_path}. "
                f"Run the data_pipeline/ scripts first (extract -> map -> clean -> label -> merge)."
            )
        train_df = pd.read_csv(train_path)
        test_df = pd.read_csv(test_path)
        return train_df, test_df

    elif source == "hybrid":
        processed_dir = os.path.join(base_dir, "data", "processed")
        hybrid_path = os.path.join(processed_dir, "hybrid_real_plus_synthetic.csv")
        test_path = os.path.join(processed_dir, "test_real_holdout.csv")
        if not (os.path.exists(hybrid_path) and os.path.exists(test_path)):
            raise FileNotFoundError(
                f"Hybrid data not found. Run ml/data_pipeline/merge_datasets.py first."
            )
        train_df = pd.read_csv(hybrid_path)
        test_df = pd.read_csv(test_path)
        return train_df, test_df

    else:
        raise ValueError(f"Unknown --source '{source}'. Choose synthetic|real|hybrid.")


def train_and_evaluate(source: str = "synthetic"):
    print("=" * 65)
    print(f"  HydroGuard-XAI: Model Training Pipeline (source={source})")
    print("=" * 65)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    train_df, test_df = load_data(source, base_dir)

    train_df = train_df.dropna(subset=["pollution_risk", "risk_score"]).reset_index(drop=True)
    test_df = test_df.dropna(subset=["pollution_risk", "risk_score"]).reset_index(drop=True)

    if len(train_df) == 0:
        raise ValueError(
            f"Training set is empty for source='{source}'. This usually means the real "
            f"dataset doesn't yet have enough rows before the holdout_year cutoff. "
            f"Collect more historical TNPCB PDFs, or lower --holdout_year in merge_datasets.py, "
            f"or use --source synthetic / hybrid in the meantime."
        )

    print(f"Training set size: {len(train_df)} | Test set size: {len(test_df)}")
    print("\nPollution Risk class distribution (train):")
    print(train_df["pollution_risk"].value_counts())

    if len(test_df) < 10:
        print(f"\n⚠ WARNING: test set has only {len(test_df)} samples. Reported metrics will "
              f"have wide confidence intervals and should NOT be treated as reliable until "
              f"more real data is collected. Report this limitation explicitly in the paper.")

    preprocessor = WaterQualityPreprocessor()
    preprocessor.fit(train_df)

    X_train = preprocessor.transform(train_df)
    X_test = preprocessor.transform(test_df)
    y_cls_train, y_cls_test = train_df["pollution_risk"].values, test_df["pollution_risk"].values
    y_reg_train, y_reg_test = train_df["risk_score"].values, test_df["risk_score"].values

    print("\nTraining Random Forest Classifier (Risk Levels: LOW, MODERATE, HIGH, CRITICAL)...")
    clf = RandomForestClassifier(
        n_estimators=100, max_depth=10, min_samples_split=4,
        min_samples_leaf=2, random_state=42, n_jobs=1
    )
    clf.fit(X_train, y_cls_train)

    y_cls_pred = clf.predict(X_test)
    acc = accuracy_score(y_cls_test, y_cls_pred)
    prec = precision_score(y_cls_test, y_cls_pred, average="weighted", zero_division=0)
    rec = recall_score(y_cls_test, y_cls_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_cls_test, y_cls_pred, average="weighted", zero_division=0)

    print(f"\n--- Classification Metrics (source={source}) ---")
    print(f"  Accuracy:  {acc * 100:.2f}%")
    print(f"  Precision: {prec * 100:.2f}%")
    print(f"  Recall:    {rec * 100:.2f}%")
    print(f"  F1-Score:  {f1 * 100:.2f}%")
    print("\nClassification Report:\n", classification_report(y_cls_test, y_cls_pred, zero_division=0))

    print("Training Random Forest Regressor (Continuous Risk Score 0-100)...")
    reg = RandomForestRegressor(
        n_estimators=100, max_depth=10, min_samples_split=4,
        min_samples_leaf=2, random_state=42, n_jobs=1
    )
    reg.fit(X_train, y_reg_train)

    y_reg_pred = reg.predict(X_test)
    mae = mean_absolute_error(y_reg_test, y_reg_pred)
    rmse = np.sqrt(mean_squared_error(y_reg_test, y_reg_pred))
    r2 = r2_score(y_reg_test, y_reg_pred) if len(y_reg_test) > 1 else float("nan")

    print(f"\n--- Regression Metrics (source={source}) ---")
    print(f"  MAE:  {mae:.2f} points")
    print(f"  RMSE: {rmse:.2f} points")
    print(f"  R²:   {r2:.4f}")

    baseline_stats = {}
    for col in FEATURE_COLUMNS:
        if col in train_df.columns:
            baseline_stats[col] = {
                "mean": float(train_df[col].mean()),
                "std": float(train_df[col].std()),
                "median": float(train_df[col].median()),
            }

    target_dir = os.path.join(base_dir, "..", "backend", "models")
    os.makedirs(target_dir, exist_ok=True)

    bundle = {
        "classifier": clf,
        "regressor": reg,
        "preprocessor": preprocessor,
        "feature_names": FEATURE_COLUMNS,
        "classes": list(clf.classes_),
        "baseline_stats": baseline_stats,
        "trained_on_source": source,
    }

    suffix = "" if source == "synthetic" else f"_{source}"
    bundle_path = os.path.join(target_dir, f"model_bundle{suffix}.joblib")
    joblib.dump(bundle, bundle_path)
    print(f"\nModel bundle saved to: {bundle_path}")

    metrics_data = {
        "model_type": "Random Forest Ensemble (Dual Classifier & Regressor)",
        "trained_on_source": source,
        "training_samples": len(train_df),
        "test_samples": len(test_df),
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "mae": round(float(mae), 4),
        "rmse": round(float(rmse), 4),
        "r2_score": round(float(r2), 4) if not np.isnan(r2) else None,
        "evaluation_disclaimer": (
            "Metrics calculated on prototype simulated river telemetry."
            if source == "synthetic" else
            "Metrics calculated against real TNPCB-sourced holdout data. "
            "Small test-set size may produce wide confidence intervals — see evaluation/cross_validation.py "
            "for CV-based estimates with confidence intervals."
        ),
    }

    metrics_path = os.path.join(target_dir, f"metrics{suffix}.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics_data, f, indent=2)
    print(f"Metrics saved to: {metrics_path}")

    return metrics_data


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train HydroGuard-XAI models")
    parser.add_argument("--source", choices=["synthetic", "real", "hybrid"], default="synthetic",
                         help="Which dataset to train on (default: synthetic, for backward compatibility)")
    args = parser.parse_args()
    train_and_evaluate(source=args.source)
