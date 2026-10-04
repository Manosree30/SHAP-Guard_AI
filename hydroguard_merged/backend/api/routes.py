"""
HydroGuard-XAI - FastAPI Application Router
"""

import numpy as np
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from models.schemas import (
    WaterQualityInput, PredictionResponse, StationItem,
    TrendsResponse, AlertItem, DemoScenario
)
from services.ml_service import MLService
from services.sensor_simulator import (
    RIVER_STATIONS, DEMO_SCENARIOS,
    generate_location_trends, get_live_alerts,
    get_all_monitoring_stations
)

router = APIRouter()

@router.get("/health")
def health_check():
    """Health check endpoint and runtime status."""
    ml_service = MLService.get_instance()
    return {
        "status": "healthy",
        "service": "HydroGuard-XAI API",
        "version": "1.0.0",
        "model_loaded": ml_service.classifier is not None and ml_service.regressor is not None,
        "metrics": ml_service.metrics
    }

@router.post("/predict", response_model=PredictionResponse)
def predict_pollution_risk(input_data: WaterQualityInput):
    """
    Main Prediction & XAI Endpoint:
    1. Validates input parameters.
    2. Runs Random Forest classification & regression models.
    3. Computes exact SHAP/Tree feature attributions.
    4. Generates dynamic human-readable environmental explanations.
    5. Calculates Water Quality Index (WQI) and parameter status matrix.
    6. Synthesizes prioritized, actionable recommendations.
    """
    try:
        ml_service = MLService.get_instance()
        params_dict = input_data.model_dump()
        location_name = params_dict.pop("location", "Sample River")
        params_dict.pop("sampling_time", None)

        result = ml_service.predict(params_dict)
        result["location"] = location_name

        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction pipeline encountered an issue: {str(e)}"
        )

@router.get("/locations", response_model=List[StationItem])
@router.get("/stations", response_model=List[StationItem])
def get_monitoring_stations():
    """Retrieves all active river monitoring stations with dynamically evaluated model risk status."""
    return get_all_monitoring_stations()

@router.get("/trends/{location}", response_model=TrendsResponse)
def get_historical_trends(
    location: str,
    range: Optional[str] = Query("30d", enum=["7d", "30d", "90d"], description="Historical timeframe window")
):
    """Retrieves historical water quality parameter trends, risk timeline, and early warning surge detection."""
    try:
        trends = generate_location_trends(location, range)
        return trends
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate trends for location '{location}': {str(e)}"
        )

@router.get("/alerts", response_model=List[AlertItem])
def get_active_alerts():
    """Retrieves real-time active environmental pollution alerts and early warning notifications."""
    return get_live_alerts()

@router.get("/scenarios", response_model=List[DemoScenario])
def get_demo_scenarios():
    """Retrieves preset realistic demonstration scenarios for instant 1-click evaluation."""
    return DEMO_SCENARIOS

@router.post("/simulate-stream")
def simulate_sensor_stream(station_id: Optional[str] = "cauvery"):
    """
    Simulates incoming IoT river sensor telemetry step with slight dynamic environmental drift,
    demonstrating real-time edge/cloud sensor ingest capability.
    """
    station = next((s for s in RIVER_STATIONS if s["id"] == station_id), RIVER_STATIONS[0])
    base = station["parameters"]

    # Generate slight realistic fluctuation
    simulated_params = {
        "ph": round(float(np.clip(base["ph"] + np.random.normal(0, 0.05), 3.5, 11.5)), 2),
        "turbidity": round(float(np.clip(base["turbidity"] + np.random.normal(0, 1.2), 0.5, 300.0)), 1),
        "dissolved_oxygen": round(float(np.clip(base["dissolved_oxygen"] + np.random.normal(0, 0.1), 0.5, 14.0)), 2),
        "temperature": round(float(np.clip(base["temperature"] + np.random.normal(0, 0.2), 15.0, 42.0)), 1),
        "conductivity": round(float(np.clip(base["conductivity"] + np.random.normal(0, 8.0), 50.0, 2500.0)), 1),
        "tds": round(float(np.clip(base["tds"] + np.random.normal(0, 6.0), 30.0, 2000.0)), 1),
        "bod": round(float(np.clip(base["bod"] + np.random.normal(0, 0.15), 0.2, 50.0)), 2),
        "cod": round(float(np.clip(base["cod"] + np.random.normal(0, 0.8), 1.0, 200.0)), 1),
        "rainfall": round(float(np.clip(base["rainfall"] + np.random.normal(0, 0.5), 0.0, 200.0)), 1),
        "water_flow": round(float(np.clip(base["water_flow"] + np.random.normal(0, 3.0), 10.0, 600.0)), 1),
        "location": station["name"]
    }

    ml_service = MLService.get_instance()
    pred = ml_service.predict({k: v for k, v in simulated_params.items() if k != "location"})
    pred["location"] = station["name"]
    pred["stream_reading"] = simulated_params

    return pred
