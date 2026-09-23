"""
HydroGuard-XAI - Real Data Pipeline: Full Runner
Chains extract -> map -> clean -> label -> merge in one command.

Usage:
    python run_pipeline.py --raw_pdf_dir ml/data/raw_pdfs --holdout_year 2023
"""

import argparse
import logging
import os

import extract_pdf_tables
import schema_mapper
import clean_and_validate
import label_from_wqi
import merge_datasets

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("run_pipeline")


def run(raw_pdf_dir: str, real_dir: str, processed_dir: str, synthetic_path: str, holdout_year: int):
    os.makedirs(real_dir, exist_ok=True)

    logger.info("STEP 1/5: Extracting tables from PDFs...")
    raw_path = os.path.join(real_dir, "extracted_raw.csv")
    extract_pdf_tables.extract_directory(raw_pdf_dir, raw_path)

    logger.info("STEP 2/5: Mapping columns to FEATURE_COLUMNS...")
    import pandas as pd
    df = pd.read_csv(raw_path)
    mapped = schema_mapper.map_dataframe(df)
    mapped_path = os.path.join(real_dir, "mapped.csv")
    mapped.to_csv(mapped_path, index=False)

    logger.info("STEP 3/5: Cleaning & validating...")
    df = pd.read_csv(mapped_path)
    cleaned, stats = clean_and_validate.clean(df)
    cleaned_path = os.path.join(real_dir, "cleaned.csv")
    cleaned.to_csv(cleaned_path, index=False)
    logger.info(f"  Cleaning stats: {stats}")

    logger.info("STEP 4/5: Labeling via WQI...")
    df = pd.read_csv(cleaned_path)
    labeled = label_from_wqi.label_dataframe(df)
    labeled_path = os.path.join(real_dir, "labeled.csv")
    labeled.to_csv(labeled_path, index=False)

    logger.info("STEP 5/5: Merging real + synthetic, building train/test splits...")
    merge_stats = merge_datasets.build_datasets(labeled_path, synthetic_path, processed_dir, holdout_year)

    logger.info("=" * 60)
    logger.info("Pipeline complete. Next steps:")
    logger.info("  python ml/train_model.py --source real")
    logger.info("  python ml/train_model.py --source hybrid")
    logger.info("  python evaluation/cross_validation.py --data ml/data/processed/train_real.csv")
    logger.info("=" * 60)
    return merge_stats


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the full real-data pipeline end to end")
    parser.add_argument("--raw_pdf_dir", default="ml/data/raw_pdfs")
    parser.add_argument("--real_dir", default="ml/data/real")
    parser.add_argument("--processed_dir", default="ml/data/processed")
    parser.add_argument("--synthetic_path", default="ml/data/river_water_quality_demo.csv")
    parser.add_argument("--holdout_year", type=int, default=2023)
    args = parser.parse_args()

    run(args.raw_pdf_dir, args.real_dir, args.processed_dir, args.synthetic_path, args.holdout_year)
