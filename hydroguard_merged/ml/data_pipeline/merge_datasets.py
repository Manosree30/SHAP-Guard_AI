"""
HydroGuard-XAI - Real Data Pipeline: Dataset Merging
Combines the real labeled dataset with the existing synthetic dataset, keeping a
`data_source` column (real | synthetic) so downstream training/evaluation can:
  - train/evaluate on real-only data
  - train/evaluate on hybrid (real + synthetic augmentation) data
  - report both, as required by the evaluation plan (see docs/limitations.md)

Also performs a temporal train/holdout split for real data (train on early years,
holdout on the most recent year) for a stronger generalization test than a random split.

Usage:
    python merge_datasets.py \
        --real ml/data/real/labeled.csv \
        --synthetic ml/data/river_water_quality_demo.csv \
        --output_dir ml/data/processed \
        --holdout_year 2023
"""

import os
import argparse
import logging

import pandas as pd

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from preprocessing import FEATURE_COLUMNS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("merge_datasets")

COMMON_COLUMNS = FEATURE_COLUMNS + ["risk_score", "pollution_risk", "data_source"]


def load_real(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df["data_source"] = "real"
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        df["year"] = df["date"].dt.year
    else:
        df["year"] = None
    return df


def load_synthetic(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df["data_source"] = "synthetic"
    if "timestamp" in df.columns:
        df["date"] = pd.to_datetime(df["timestamp"], errors="coerce")
        df["year"] = df["date"].dt.year
    else:
        df["year"] = None
    return df


def build_datasets(real_path: str, synthetic_path: str, output_dir: str, holdout_year: int):
    os.makedirs(output_dir, exist_ok=True)

    real_df = load_real(real_path)
    synth_df = load_synthetic(synthetic_path)

    logger.info(f"Real rows: {len(real_df)} | Synthetic rows: {len(synth_df)}")

    # --- Real-only temporal split ---
    train_real = real_df[real_df["year"] < holdout_year]
    test_real = real_df[real_df["year"] >= holdout_year]

    if len(test_real) == 0:
        logger.warning(
            f"No real rows found for holdout_year >= {holdout_year}. "
            f"Falling back to an 80/20 random split of real data instead — "
            f"note this in the paper as a deviation from the temporal-holdout plan."
        )
        train_real = real_df.sample(frac=0.8, random_state=42)
        test_real = real_df.drop(train_real.index)

    keep_cols = [c for c in COMMON_COLUMNS if c in real_df.columns] + ["station", "river", "date"]
    keep_cols = [c for c in keep_cols if c in real_df.columns]

    train_real[keep_cols].to_csv(os.path.join(output_dir, "train_real.csv"), index=False)
    test_real[keep_cols].to_csv(os.path.join(output_dir, "test_real_holdout.csv"), index=False)

    # --- Hybrid (real train + full synthetic set) ---
    synth_keep_cols = [c for c in COMMON_COLUMNS if c in synth_df.columns]
    hybrid = pd.concat(
        [train_real[keep_cols], synth_df[synth_keep_cols]],
        ignore_index=True,
        sort=False
    )
    hybrid.to_csv(os.path.join(output_dir, "hybrid_real_plus_synthetic.csv"), index=False)

    logger.info(f"train_real.csv: {len(train_real)} rows")
    logger.info(f"test_real_holdout.csv: {len(test_real)} rows (year >= {holdout_year})")
    logger.info(f"hybrid_real_plus_synthetic.csv: {len(hybrid)} rows "
                f"({len(train_real)} real + {len(synth_df)} synthetic)")

    return {
        "train_real": len(train_real),
        "test_real_holdout": len(test_real),
        "hybrid_total": len(hybrid),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Merge real and synthetic datasets for training/evaluation")
    parser.add_argument("--real", default="ml/data/real/labeled.csv")
    parser.add_argument("--synthetic", default="ml/data/river_water_quality_demo.csv")
    parser.add_argument("--output_dir", default="ml/data/processed")
    parser.add_argument("--holdout_year", type=int, default=2023)
    args = parser.parse_args()

    build_datasets(args.real, args.synthetic, args.output_dir, args.holdout_year)
