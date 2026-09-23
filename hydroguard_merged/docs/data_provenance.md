# Data Provenance

Every row in `ml/data/real/labeled.csv` traces back to a specific source PDF and page
via the `source_file` and `source_page` columns added at extraction time
(`ml/data_pipeline/extract_pdf_tables.py`).

## Pipeline stages and where provenance is preserved

| Stage | Script | Output | Provenance kept? |
|---|---|---|---|
| Acquisition | manual download | `ml/data/raw_pdfs/*.pdf` | filename = source |
| Extraction | `extract_pdf_tables.py` | `ml/data/real/extracted_raw.csv` | ✅ `source_file`, `source_page` |
| Schema mapping | `schema_mapper.py` | `ml/data/real/mapped.csv` | ✅ carried through |
| Cleaning | `clean_and_validate.py` | `ml/data/real/cleaned.csv` | ✅ carried through |
| Labeling | `label_from_wqi.py` | `ml/data/real/labeled.csv` | ✅ carried through |
| Merge | `merge_datasets.py` | `ml/data/processed/*.csv` | ✅ + `data_source` flag (real/synthetic) |

## Fill this in as you process real TNPCB reports

| Source file | Report period | Rivers covered | Rows extracted | Rows kept after cleaning |
|---|---|---|---|---|
| _(e.g. nwmp_2023.pdf)_ | Jan–Dec 2023 | Cauvery, Vaigai, Palar | — | — |
| ... | | | | |

This table is what a reviewer will want to see to trust the "real data" claim — keep it
updated as you add each year's report.
