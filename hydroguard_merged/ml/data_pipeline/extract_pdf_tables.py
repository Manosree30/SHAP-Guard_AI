"""
HydroGuard-XAI - Real Data Pipeline: PDF Table Extraction
Extracts tabular water quality readings from TNPCB / CPCB NWMP annual report PDFs.

Usage:
    python extract_pdf_tables.py --input_dir ml/data/raw_pdfs --output ml/data/real/extracted_raw.csv

TNPCB report PDFs are not uniformly formatted across years, so this module uses a
two-pass strategy:
  1. Try structured table extraction (pdfplumber's table detector) - works for
     reports that use actual PDF tables/grid lines.
  2. Fall back to text-line parsing with a configurable column pattern - works for
     reports that are text-only / lack table borders.

Every extracted row keeps a `source_file` and `source_page` field for provenance,
which docs/data_provenance.md relies on.
"""

import os
import re
import argparse
import logging
from datetime import datetime

import pandas as pd
import pdfplumber

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("extract_pdf_tables")

# Column header aliases seen across different years/report formats.
# schema_mapper.py does the authoritative mapping to FEATURE_COLUMNS; this is just
# enough to identify which raw columns are worth keeping at extraction time.
HEADER_HINTS = [
    "station", "location", "river", "date", "month", "year",
    "ph", "do", "dissolved oxygen", "bod", "cod", "turbidity",
    "conductivity", "ec", "tds", "temperature", "temp",
    "coliform", "nitrate", "chloride", "hardness"
]


def _looks_like_data_table(table_rows):
    """Heuristic: does this extracted table contain a header row with known WQ params?"""
    if not table_rows or len(table_rows) < 2:
        return False
    header_text = " ".join(str(c).lower() for c in table_rows[0] if c)
    hits = sum(1 for hint in HEADER_HINTS if hint in header_text)
    return hits >= 2


def extract_tables_from_pdf(pdf_path: str) -> list[dict]:
    """
    Extracts all plausible water-quality data tables from a single PDF.
    Returns a list of row dicts with raw (unmapped) column names plus provenance fields.
    """
    records = []
    filename = os.path.basename(pdf_path)

    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            try:
                tables = page.extract_tables()
            except Exception as e:
                logger.warning(f"{filename} page {page_num}: table extraction failed ({e})")
                tables = []

            for table in tables:
                if not _looks_like_data_table(table):
                    continue

                header = [str(c).strip() if c else "" for c in table[0]]
                for row in table[1:]:
                    if not row or all(c is None or str(c).strip() == "" for c in row):
                        continue
                    row_dict = {}
                    for col_name, val in zip(header, row):
                        if col_name:
                            row_dict[col_name] = str(val).strip() if val is not None else None
                    row_dict["source_file"] = filename
                    row_dict["source_page"] = page_num
                    records.append(row_dict)

            if not tables:
                # Fallback: no bordered tables detected on this page, try raw text parse
                text = page.extract_text() or ""
                fallback_rows = _fallback_text_parse(text, filename, page_num)
                records.extend(fallback_rows)

    logger.info(f"{filename}: extracted {len(records)} raw rows")
    return records


def _fallback_text_parse(text: str, filename: str, page_num: int) -> list[dict]:
    """
    Best-effort line-based parser for PDFs without gridded tables.
    Looks for lines containing a station-like name followed by a run of numeric values,
    which is the typical shape of NWMP tabular text dumps.
    """
    records = []
    numeric_pattern = re.compile(r"-?\d+\.?\d*")

    for line in text.split("\n"):
        numbers = numeric_pattern.findall(line)
        # Heuristic: a real data row usually has 4+ numeric readings on one line
        if len(numbers) >= 4:
            words = line.strip().split()
            # Station/location name = leading non-numeric tokens
            name_tokens = []
            for tok in words:
                if numeric_pattern.fullmatch(tok):
                    break
                name_tokens.append(tok)
            station_name = " ".join(name_tokens).strip()
            if not station_name:
                continue

            records.append({
                "raw_station": station_name,
                "raw_numbers": numbers,
                "raw_line": line.strip(),
                "source_file": filename,
                "source_page": page_num,
            })

    return records


def extract_directory(input_dir: str, output_path: str):
    all_records = []
    pdf_files = [f for f in os.listdir(input_dir) if f.lower().endswith(".pdf")]

    if not pdf_files:
        logger.warning(f"No PDF files found in {input_dir}. Nothing to extract.")
        pd.DataFrame(columns=["source_file", "source_page"]).to_csv(output_path, index=False)
        return

    for pdf_file in sorted(pdf_files):
        pdf_path = os.path.join(input_dir, pdf_file)
        try:
            records = extract_tables_from_pdf(pdf_path)
            all_records.extend(records)
        except Exception as e:
            logger.error(f"Failed to process {pdf_file}: {e}")

    df = pd.DataFrame(all_records)
    df["extracted_at"] = datetime.now().isoformat()
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    logger.info(f"Saved {len(df)} total raw extracted rows to {output_path}")
    logger.info("NOTE: this is RAW output. Run schema_mapper.py next to map to FEATURE_COLUMNS.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract water quality tables from TNPCB PDF reports")
    parser.add_argument("--input_dir", default="ml/data/raw_pdfs", help="Directory containing source PDFs")
    parser.add_argument("--output", default="ml/data/real/extracted_raw.csv", help="Output CSV path")
    args = parser.parse_args()

    extract_directory(args.input_dir, args.output)
