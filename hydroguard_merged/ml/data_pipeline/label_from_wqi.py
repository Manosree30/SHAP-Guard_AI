"""
HydroGuard-XAI - Real Data Pipeline: WQI-Based Risk Labeling
Derives `risk_score` (0-100) and `pollution_risk` class (LOW/MODERATE/HIGH/CRITICAL) for
real TNPCB readings using the SAME Water Quality Index formula already used by the live
backend (backend/xai/explainer.py::calculate_wqi), so labels are consistent between
training data and the app's own reasoning.

IMPORTANT (state this in the paper): these labels are WQI-consistent, not independently
verified against an agency's own risk classification. They are a standard, defensible
proxy — but they are a proxy, not ground truth from TNPCB itself.

Usage:
    python label_from_wqi.py --input ml/data/real/cleaned.csv --output ml/data/real/labeled.csv
"""

import argparse
import logging

import numpy as np
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("label_from_wqi")


def calculate_wqi(row: pd.Series) -> float:
    """Mirrors backend/xai/explainer.py::calculate_wqi exactly, operating on a DataFrame row.
    Falls back to the same defaults used in the backend when a feature is missing/NaN,
    which matters here since real reports often lack some parameters."""
    sub_indices = []

    ph = row["ph"] if pd.notna(row.get("ph")) else 7.0
    ph_score = max(0, 100 - abs(ph - 7.2) * 28)
    sub_indices.append(ph_score * 0.15)

    do = row["dissolved_oxygen"] if pd.notna(row.get("dissolved_oxygen")) else 7.0
    do_score = min(100, max(0, (do / 8.0) * 100))
    sub_indices.append(do_score * 0.25)

    bod = row["bod"] if pd.notna(row.get("bod")) else 1.5
    bod_score = max(0, 100 - (bod * 16.0))
    sub_indices.append(bod_score * 0.20)

    turb = row["turbidity"] if pd.notna(row.get("turbidity")) else 3.0
    turb_score = max(0, 100 - (turb * 2.5))
    sub_indices.append(turb_score * 0.15)

    tds = row["tds"] if pd.notna(row.get("tds")) else 150.0
    tds_score = max(0, 100 - ((tds - 100) * 0.12))
    sub_indices.append(tds_score * 0.10)

    cod = row["cod"] if pd.notna(row.get("cod")) else 5.0
    cod_score = max(0, 100 - (cod * 1.5))
    sub_indices.append(cod_score * 0.15)

    wqi = float(np.clip(sum(sub_indices), 5.0, 99.0))
    return round(wqi, 1)


def wqi_to_risk_score(wqi: float) -> float:
    """Inverts WQI (100 = pristine) to a risk score (100 = worst), matching the
    existing risk_score convention used by dataset_generator.py / the regressor target."""
    return round(100.0 - wqi, 1)


def classify_risk_score(score: float) -> str:
    """Identical thresholds to ml/dataset_generator.py::classify_risk_score, kept in
    sync deliberately so real and synthetic labels use the same class boundaries."""
    if score <= 25.0:
        return "LOW"
    elif score <= 50.0:
        return "MODERATE"
    elif score <= 75.0:
        return "HIGH"
    else:
        return "CRITICAL"


def label_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["wqi"] = df.apply(calculate_wqi, axis=1)
    df["risk_score"] = df["wqi"].apply(wqi_to_risk_score)
    df["pollution_risk"] = df["risk_score"].apply(classify_risk_score)
    return df


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Derive WQI-based risk labels for cleaned real data")
    parser.add_argument("--input", default="ml/data/real/cleaned.csv")
    parser.add_argument("--output", default="ml/data/real/labeled.csv")
    args = parser.parse_args()

    df_in = pd.read_csv(args.input)
    df_out = label_dataframe(df_in)
    df_out.to_csv(args.output, index=False)

    logger.info(f"Labeled {len(df_out)} rows")
    logger.info(f"Class distribution:\n{df_out['pollution_risk'].value_counts()}")
