"""
HydroGuard-XAI - Real Data Pipeline: Cleaning & Validation
Applies physically-plausible bounds (reusing the same limits as the live API's input
validation) to mapped real-world rows, flags/clips outliers, drops unusable rows,
and reports data-quality statistics for the paper's data-quality section.

Usage:
    python clean_and_validate.py --input ml/data/real/mapped.csv --output ml/data/real/cleaned.csv
"""

import argparse
import logging

import numpy as np
import pandas as pd

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from preprocessing import FEATURE_COLUMNS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("clean_and_validate")

# Same physical plausibility bounds used by the live API (ml/preprocessing.py's
# validate_input_parameters) - kept in sync deliberately so training-time and
# inference-time validation agree.
PHYSICAL_LIMITS = {
    "ph": (0.0, 14.0),
    "turbidity": (0.0, 1000.0),
    "dissolved_oxygen": (0.0, 25.0),
    "temperature": (0.0, 60.0),
    "conductivity": (0.0, 10000.0),
    "tds": (0.0, 8000.0),
    "bod": (0.0, 200.0),
    "cod": (0.0, 500.0),
    "rainfall": (0.0, 600.0),
    "water_flow": (0.0, 2000.0),
}

# Minimum number of non-null core pollution features required to keep a row.
# (rainfall/water_flow are often absent from water-quality-only reports, so they're
# excluded from this "core" check.)
CORE_FEATURES = ["ph", "dissolved_oxygen", "bod", "cod", "turbidity"]
MIN_CORE_FEATURES_PRESENT = 3


def clean(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    stats = {
        "input_rows": len(df),
        "dropped_insufficient_core_features": 0,
        "out_of_bounds_clipped": {feat: 0 for feat in FEATURE_COLUMNS},
        "duplicates_dropped": 0,
    }

    # 1. Drop exact duplicates (same station/date/values re-extracted from overlapping pages)
    before = len(df)
    df = df.drop_duplicates()
    stats["duplicates_dropped"] = before - len(df)

    # 2. Drop rows with too few usable core readings
    core_present = df[CORE_FEATURES].notna().sum(axis=1)
    keep_mask = core_present >= MIN_CORE_FEATURES_PRESENT
    stats["dropped_insufficient_core_features"] = int((~keep_mask).sum())
    df = df[keep_mask].copy()

    # 3. Clip out-of-bound values to physical plausibility range (don't silently drop —
    #    flag them, since a wildly out-of-range reading in a govt report is often a
    #    transcription/unit error worth a manual audit, not necessarily bad data)
    for feat, (lo, hi) in PHYSICAL_LIMITS.items():
        if feat not in df.columns:
            continue
        mask = df[feat].notna() & ((df[feat] < lo) | (df[feat] > hi))
        stats["out_of_bounds_clipped"][feat] = int(mask.sum())
        df.loc[mask, feat] = df.loc[mask, feat].clip(lower=lo, upper=hi)

    # 4. Per-feature missingness report (important to disclose in the paper)
    missingness = {}
    for feat in FEATURE_COLUMNS:
        if feat in df.columns:
            missingness[feat] = round(float(df[feat].isna().mean()) * 100, 1)
    stats["missingness_pct"] = missingness
    stats["output_rows"] = len(df)

    return df.reset_index(drop=True), stats


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean and validate mapped real water quality data")
    parser.add_argument("--input", default="ml/data/real/mapped.csv")
    parser.add_argument("--output", default="ml/data/real/cleaned.csv")
    args = parser.parse_args()

    df_in = pd.read_csv(args.input)
    df_out, stats = clean(df_in)
    df_out.to_csv(args.output, index=False)

    logger.info(f"Rows: {stats['input_rows']} -> {stats['output_rows']}")
    logger.info(f"Duplicates dropped: {stats['duplicates_dropped']}")
    logger.info(f"Dropped (insufficient core features): {stats['dropped_insufficient_core_features']}")
    logger.info(f"Missingness by feature (%): {stats['missingness_pct']}")
    for feat, count in stats["out_of_bounds_clipped"].items():
        if count > 0:
            logger.warning(f"  {feat}: {count} values clipped to physical bounds")
