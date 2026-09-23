"""
HydroGuard-XAI - Real Data Pipeline: Schema Mapping
Maps raw column headers extracted from TNPCB PDFs (which vary year to year) onto the
canonical FEATURE_COLUMNS used by the model (ml/preprocessing.py).

Usage:
    python schema_mapper.py --input ml/data/real/extracted_raw.csv --output ml/data/real/mapped.csv
"""

import re
import argparse
import logging

import pandas as pd

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from preprocessing import FEATURE_COLUMNS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("schema_mapper")

# Alias map: canonical FEATURE_COLUMNS name -> list of regex patterns seen in TNPCB reports.
# Extend this as you encounter new header variants across different years' PDFs.
COLUMN_ALIASES = {
    "ph": [r"^ph$"],
    "turbidity": [r"turbid"],
    "dissolved_oxygen": [r"^do$", r"dissolved\s*oxygen", r"d\.?o\.?"],
    "temperature": [r"temp"],
    "conductivity": [r"^ec$", r"conductiv", r"electrical\s*conductivity"],
    "tds": [r"^tds$", r"total\s*dissolved\s*solids"],
    "bod": [r"^bod$", r"bio.?chemical\s*oxygen"],
    "cod": [r"^cod$", r"chemical\s*oxygen"],
    "rainfall": [r"rainfall", r"precip"],
    "water_flow": [r"flow", r"discharge"],
}

# Non-feature metadata columns worth preserving for provenance/analysis.
METADATA_ALIASES = {
    "station": [r"station", r"location", r"site"],
    "river": [r"river", r"basin"],
    "date": [r"^date$", r"month", r"year", r"sampling\s*date"],
}

ALL_ALIASES = {**COLUMN_ALIASES, **METADATA_ALIASES}


def build_column_map(raw_columns: list[str]) -> dict:
    """
    Given the raw column headers found in the extracted CSV, returns a dict
    {raw_column_name: canonical_name} for every column that matches a known alias.
    Unmatched columns are left out (and logged) so nothing silently disappears.
    """
    col_map = {}
    unmatched = []

    for raw_col in raw_columns:
        raw_clean = str(raw_col).strip().lower()
        matched = None
        for canonical, patterns in ALL_ALIASES.items():
            if any(re.search(p, raw_clean) for p in patterns):
                matched = canonical
                break
        if matched:
            col_map[raw_col] = matched
        else:
            unmatched.append(raw_col)

    if unmatched:
        logger.warning(f"Unmapped columns (kept as-is, review manually): {unmatched}")

    return col_map


def _to_float(val):
    """Coerce a raw string value (possibly with units, commas, or stray text) to float."""
    if val is None:
        return None
    s = str(val).strip()
    if s == "" or s.lower() in ("na", "n/a", "-", "nil", "bdl"):  # BDL = below detection limit
        return None
    s = re.sub(r"[^\d.\-]", "", s)  # strip units like "mg/l", "%", commas
    try:
        return float(s)
    except ValueError:
        return None


def map_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    col_map = build_column_map(list(df.columns))
    df_mapped = df.rename(columns=col_map)

    # Coerce numeric feature columns
    for feat in FEATURE_COLUMNS:
        if feat in df_mapped.columns:
            df_mapped[feat] = df_mapped[feat].apply(_to_float)
        else:
            logger.warning(f"Feature '{feat}' not found in this batch — will be NaN (imputed downstream)")
            df_mapped[feat] = None

    keep_cols = FEATURE_COLUMNS + ["station", "river", "date", "source_file", "source_page"]
    keep_cols = [c for c in keep_cols if c in df_mapped.columns]
    return df_mapped[keep_cols]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Map raw extracted TNPCB columns to FEATURE_COLUMNS")
    parser.add_argument("--input", default="ml/data/real/extracted_raw.csv")
    parser.add_argument("--output", default="ml/data/real/mapped.csv")
    args = parser.parse_args()

    df = pd.read_csv(args.input)
    mapped = map_dataframe(df)
    mapped.to_csv(args.output, index=False)
    logger.info(f"Saved {len(mapped)} mapped rows to {args.output}")
    logger.info(f"Columns present: {list(mapped.columns)}")
