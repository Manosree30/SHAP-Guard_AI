# Limitations

State these explicitly in the paper rather than letting a reviewer discover them.

## Data limitations

- **Sample size.** Real TNPCB data volume will likely be much smaller than the 2,400-row
  synthetic set — report the exact real-data `n` used in every table.
- **Uneven sampling frequency.** Continuous stations (Noyyal, Kalingarayan, Thamirabarani)
  report far more frequently than periodic ones (Vaigai: twice/year; Palar: monthly).
  Pooling these without accounting for frequency biases the dataset toward
  over-represented rivers/stations.
- **Missing features.** TNPCB water-quality reports may not include `rainfall` or
  `water_flow` at all — these often come from a separate hydrology agency. Document
  per-feature missingness (see `clean_and_validate.py` output) and how it was handled
  (median imputation via `WaterQualityPreprocessor`).
- **Bhavani river gap.** No dedicated TNPCB station was found in public reports for
  Bhavani, despite it being present in the original synthetic dataset. Either source it
  from academic WQI literature (with citation) or exclude it from real-data claims.
- **Labels are WQI-derived, not TNPCB's own risk classification.** `pollution_risk` is
  computed by applying the same WQI formula used elsewhere in the app
  (`backend/xai/explainer.py::calculate_wqi`) to real readings — it is WQI-consistent,
  not an independently verified ground-truth label from the monitoring agency.
- **PDF extraction noise.** Table extraction from government report PDFs is imperfect;
  `extract_pdf_tables.py`'s fallback text parser in particular should be manually spot-checked
  against the source PDF for any year where reports lack proper table borders.

## Modeling limitations

- **Small real-data test sets** produce wide confidence intervals. Use
  `evaluation/cross_validation.py` and report CI95, not a single point estimate, whenever
  the real-only test set is small.
- **XAI reframing.** The original tree-path attribution (`backend/xai/explainer.py`) is a
  Saabas-style method, not exact Shapley values, despite prior documentation calling it
  "TreeSHAP." `evaluation/shap_analysis.py` provides genuine SHAP values via
  `shap.TreeExplainer` for the paper's XAI section; if the live backend keeps the faster
  Saabas method for latency reasons, say so explicitly and cite the distinction.
- **No independent field validation.** Model outputs have not been compared against
  expert/agency-assigned risk labels for the same events — this is a reasonable and
  disclosed direction for future work, not something to claim as already validated.

## What NOT to claim in the paper

- Do not claim the classifier was "validated on real-world data" without stating sample
  size and the WQI-derived nature of the labels.
- Do not call the attribution method "TreeSHAP" unless `shap.TreeExplainer` is the method
  actually used for the reported numbers.
- Do not present synthetic-data metrics and real-data metrics in the same table without
  a `data_source` column making the distinction unmissable.
