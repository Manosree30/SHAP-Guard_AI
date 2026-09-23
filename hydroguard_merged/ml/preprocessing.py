"""
HydroGuard-XAI - Data Preprocessing & Validation Pipeline
Handles feature scaling, missing value imputation, out-of-bounds boundary validation,
and feature structure consistency for ML inference and XAI explanations.
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
import joblib
import os

FEATURE_COLUMNS = [
    "ph",
    "turbidity",
    "dissolved_oxygen",
    "temperature",
    "conductivity",
    "tds",
    "bod",
    "cod",
    "rainfall",
    "water_flow"
]

FEATURE_LABELS = {
    "ph": "pH Level",
    "turbidity": "Turbidity",
    "dissolved_oxygen": "Dissolved Oxygen",
    "temperature": "Water Temperature",
    "conductivity": "Electrical Conductivity",
    "tds": "Total Dissolved Solids (TDS)",
    "bod": "Biochemical Oxygen Demand (BOD)",
    "cod": "Chemical Oxygen Demand (COD)",
    "rainfall": "Rainfall Intensity",
    "water_flow": "Water Flow Rate"
}

FEATURE_UNITS = {
    "ph": "",
    "turbidity": "NTU",
    "dissolved_oxygen": "mg/L",
    "temperature": "°C",
    "conductivity": "µS/cm",
    "tds": "mg/L",
    "bod": "mg/L",
    "cod": "mg/L",
    "rainfall": "mm",
    "water_flow": "m³/s"
}

# Normal baseline standard ranges for surface river waters
BENCHMARK_RANGES = {
    "ph": {"min": 6.5, "max": 8.5, "ideal_min": 7.0, "ideal_max": 7.8, "unit": ""},
    "turbidity": {"min": 0.0, "max": 10.0, "ideal_min": 0.5, "ideal_max": 5.0, "unit": "NTU"},
    "dissolved_oxygen": {"min": 6.0, "max": 12.0, "ideal_min": 6.5, "ideal_max": 9.5, "unit": "mg/L"},
    "temperature": {"min": 18.0, "max": 30.0, "ideal_min": 22.0, "ideal_max": 28.0, "unit": "°C"},
    "conductivity": {"min": 100.0, "max": 500.0, "ideal_min": 150.0, "ideal_max": 400.0, "unit": "µS/cm"},
    "tds": {"min": 50.0, "max": 300.0, "ideal_min": 100.0, "ideal_max": 250.0, "unit": "mg/L"},
    "bod": {"min": 0.0, "max": 3.0, "ideal_min": 0.5, "ideal_max": 2.0, "unit": "mg/L"},
    "cod": {"min": 0.0, "max": 15.0, "ideal_min": 2.0, "ideal_max": 10.0, "unit": "mg/L"},
    "rainfall": {"min": 0.0, "max": 50.0, "ideal_min": 0.0, "ideal_max": 20.0, "unit": "mm"},
    "water_flow": {"min": 30.0, "max": 400.0, "ideal_min": 80.0, "ideal_max": 250.0, "unit": "m³/s"}
}

def validate_input_parameters(params: dict) -> tuple[dict, list[str]]:
    """
    Validates input parameters, checks for physically plausible bounds,
    and returns sanitized parameters along with advisory warnings.
    """
    sanitized = {}
    warnings = []
    
    physical_limits = {
        "ph": (0.0, 14.0, "pH must be between 0 and 14"),
        "turbidity": (0.0, 1000.0, "Turbidity cannot be negative or exceed 1000 NTU"),
        "dissolved_oxygen": (0.0, 25.0, "Dissolved oxygen cannot be negative or exceed 25 mg/L"),
        "temperature": (0.0, 60.0, "Water temperature is outside typical liquid surface water range (0-60°C)"),
        "conductivity": (0.0, 10000.0, "Conductivity is unusually extreme (>10,000 µS/cm)"),
        "tds": (0.0, 8000.0, "TDS is unusually extreme (>8,000 mg/L)"),
        "bod": (0.0, 200.0, "BOD cannot be negative or exceed 200 mg/L"),
        "cod": (0.0, 500.0, "COD cannot be negative or exceed 500 mg/L"),
        "rainfall": (0.0, 600.0, "Rainfall cannot be negative or exceed 600 mm"),
        "water_flow": (0.0, 2000.0, "Water flow cannot be negative or exceed 2000 m³/s")
    }
    
    for feat in FEATURE_COLUMNS:
        val = params.get(feat)
        if val is None:
            # Provide sensible fallback default
            bench = BENCHMARK_RANGES[feat]
            val = (bench["ideal_min"] + bench["ideal_max"]) / 2.0
            warnings.append(f"Missing '{feat}', defaulted to {val} {FEATURE_UNITS[feat]}")
        else:
            try:
                val = float(val)
            except (ValueError, TypeError):
                bench = BENCHMARK_RANGES[feat]
                val = (bench["ideal_min"] + bench["ideal_max"]) / 2.0
                warnings.append(f"Invalid non-numeric '{feat}', defaulted to {val}")

        min_lim, max_lim, warn_msg = physical_limits[feat]
        if val < min_lim or val > max_lim:
            warnings.append(f"Advisory Warning: {warn_msg} (got {val}). Values clipped to plausible domain.")
            val = float(np.clip(val, min_lim, max_lim))

        sanitized[feat] = round(val, 2)
        
    return sanitized, warnings

class WaterQualityPreprocessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.imputer = SimpleImputer(strategy="median")
        self.feature_names = FEATURE_COLUMNS
        self.is_fitted = False

    def fit(self, df: pd.DataFrame):
        X = df[self.feature_names].values
        X_imp = self.imputer.fit_transform(X)
        self.scaler.fit(X_imp)
        self.is_fitted = True
        return self

    def transform(self, df_or_dict) -> np.ndarray:
        if isinstance(df_or_dict, dict):
            row = [df_or_dict.get(feat, 0.0) for feat in self.feature_names]
            X = np.array([row])
        elif isinstance(df_or_dict, pd.DataFrame):
            X = df_or_dict[self.feature_names].values
        else:
            X = np.array(df_or_dict)
            if len(X.shape) == 1:
                X = X.reshape(1, -1)

        X_imp = self.imputer.transform(X)
        return self.scaler.transform(X_imp)

    def save(self, filepath: str):
        joblib.dump({
            "scaler": self.scaler,
            "imputer": self.imputer,
            "feature_names": self.feature_names,
            "is_fitted": self.is_fitted
        }, filepath)

    @classmethod
    def load(cls, filepath: str):
        data = joblib.load(filepath)
        instance = cls()
        instance.scaler = data["scaler"]
        instance.imputer = data["imputer"]
        instance.feature_names = data["feature_names"]
        instance.is_fitted = data["is_fitted"]
        return instance
