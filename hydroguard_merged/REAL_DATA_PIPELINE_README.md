# HydroGuard-XAI — Real Data Pipeline Add-On

This adds a real-data pipeline and honest evaluation suite on top of the existing
HydroGuard-XAI project, addressing the gaps identified in review: synthetic-only
training data, mislabeled "TreeSHAP," no cross-validation, and no baseline comparisons.

**Nothing in your existing `backend/` or `frontend/` needs to change.** Drop these files
into your project at the matching paths; `ml/train_model.py` is a drop-in replacement
(fully backward compatible — `--source synthetic` reproduces your original results
exactly, verified: 94.58% accuracy, R²=0.9966).

## Install

```bash
pip install -r requirements.txt
# adds: pdfplumber (PDF table extraction), shap (real Shapley values), xgboost (baseline model)
```

## 1. Get real data in

Download TNPCB annual reports (2018–2023) from `tnpcb.gov.in/water-quality.php` and
place them in `ml/data/raw_pdfs/`.

## 2. Run the pipeline

```bash
cd ml/data_pipeline
python run_pipeline.py --raw_pdf_dir ../data/raw_pdfs --holdout_year 2023
```

This chains: PDF extraction → column mapping → cleaning/validation → WQI labeling →
merge with synthetic data → temporal train/holdout split. Every step can also be run
individually (see each script's `--help`).

**Important:** the PDF extractor's fallback text parser is a best-effort heuristic for
reports without proper table borders — always spot-check `ml/data/real/extracted_raw.csv`
against the source PDFs before trusting downstream numbers. Extend `COLUMN_ALIASES` in
`schema_mapper.py` as you encounter new header variants across different years.

## 3. Train

```bash
python ml/train_model.py --source real       # once you have enough real rows before the holdout year
python ml/train_model.py --source hybrid     # real (train split) + synthetic augmentation
python ml/train_model.py --source synthetic  # original behavior, unchanged
```

## 4. Evaluate properly

```bash
cd evaluation
python run_full_evaluation.py
```

Runs cross-validation (with 95% CIs), baseline model comparison (Logistic Regression /
Random Forest / XGBoost), and true SHAP attribution across every available data source,
writing `evaluation/figures/full_evaluation_summary.json` — this is what feeds your
paper's results table.

## 5. Fix the XAI claim

`evaluation/shap_analysis.py` computes genuine Shapley values via `shap.TreeExplainer`
and verifies the additivity property (`sum(SHAP) + base_value == prediction`) — the
guarantee your original Saabas-based `backend/xai/explainer.py` implementation does not
provide in the same principled way, despite being labeled "exact Tree SHAP" in the
original docs. Either swap the backend to use `shap.TreeExplainer` directly (slower but
correct), or keep the fast path for the live app and cite the distinction honestly in
the paper — both are legitimate choices, just don't call the Saabas method SHAP.

## Files added

```
ml/
├── train_model.py              (replaces existing — backward compatible)
├── data_pipeline/
│   ├── extract_pdf_tables.py
│   ├── schema_mapper.py
│   ├── clean_and_validate.py
│   ├── label_from_wqi.py
│   ├── merge_datasets.py
│   └── run_pipeline.py
└── data/
    ├── raw_pdfs/   (put TNPCB PDFs here)
    ├── real/       (pipeline output)
    └── processed/  (train/test splits)

evaluation/
├── cross_validation.py
├── baseline_models.py
├── shap_analysis.py
├── run_full_evaluation.py
└── figures/        (JSON results land here)

docs/
├── data_provenance.md   (fill in as you process each report)
└── limitations.md       (what to disclose honestly in the paper)
```

## What every script was tested against

All scripts were validated end-to-end with a synthetic test PDF built to mimic a TNPCB
table layout (4 stations across Cauvery, Noyyal, Palar) before delivery:
- `extract_pdf_tables.py` correctly pulled all 4 rows with provenance columns.
- `schema_mapper.py` correctly mapped known columns and flagged missing
  `temperature`/`rainfall`/`water_flow` rather than silently defaulting them.
- `clean_and_validate.py` and `label_from_wqi.py` ran cleanly; the WQI labeler correctly
  flagged the Noyyal textile-belt station as HIGH risk.
- `train_model.py --source synthetic` reproduced the original metrics exactly.
- `cross_validation.py` and `baseline_models.py` reproduced consistent accuracy figures
  against the existing synthetic dataset.
- `shap_analysis.py` passed its additivity check with ~1e-13 reconstruction error.

Real TNPCB data will surface issues this synthetic smoke test can't (inconsistent report
formats across years, unexpected column names) — treat the first real run as a debugging
pass, not a one-shot success.
