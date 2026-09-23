"""
HydroGuard-XAI - API Pydantic Request & Response Schemas
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class WaterQualityInput(BaseModel):
    ph: float = Field(default=7.2, description="pH level (0-14)")
    turbidity: float = Field(default=4.5, description="Turbidity in NTU")
    dissolved_oxygen: float = Field(default=7.4, description="Dissolved Oxygen in mg/L")
    temperature: float = Field(default=24.0, description="Temperature in °C")
    conductivity: float = Field(default=280.0, description="Electrical Conductivity in µS/cm")
    tds: float = Field(default=180.0, description="Total Dissolved Solids in mg/L")
    bod: float = Field(default=1.8, description="Biochemical Oxygen Demand in mg/L")
    cod: float = Field(default=6.5, description="Chemical Oxygen Demand in mg/L")
    rainfall: float = Field(default=10.0, description="Rainfall in mm")
    water_flow: float = Field(default=190.0, description="Water Flow in m³/s")
    location: Optional[str] = Field(default="Sample River", description="River or station name")
    sampling_time: Optional[str] = Field(default=None, description="Timestamp of observation")

class FeatureDriver(BaseModel):
    key: str
    name: str
    unit: str
    value: float
    value_formatted: str
    impact: float
    direction: str
    magnitude: float

class ParameterStatus(BaseModel):
    key: str
    name: str
    value: float
    unit: str
    status: str
    badge_label: str
    status_color: str
    safe_range: str
    narrative: str

class DynamicExplanation(BaseModel):
    summary: str
    detailed_text: str
    key_points: List[str]

class ActionRecommendation(BaseModel):
    id: str
    priority: str
    category: str
    title: str
    action: str
    rationale: str
    disclaimer: str

class ModelMetadata(BaseModel):
    model_name: str
    accuracy: float
    disclaimer: str

class PredictionResponse(BaseModel):
    risk_score: float
    risk_level: str
    confidence: float
    confidence_pct: int
    wqi: float
    location: str
    sanitized_params: Dict[str, float]
    validation_warnings: List[str]
    top_drivers: List[FeatureDriver]
    mitigating_drivers: List[FeatureDriver]
    chart_drivers: List[FeatureDriver]
    parameter_statuses: List[ParameterStatus]
    explanation: DynamicExplanation
    recommendations: List[ActionRecommendation]
    base_value: float
    model_metadata: ModelMetadata

class StationItem(BaseModel):
    id: str
    name: str
    station_name: str
    state: str
    lat: float
    lng: float
    current_risk_score: float
    current_risk_level: str
    wqi: float
    previous_risk_score: float
    spike_alert: bool
    last_updated: str
    status_summary: str
    parameters: Dict[str, float]

class TrendDataPoint(BaseModel):
    timestamp: str
    display_date: str
    risk_score: float
    risk_level: str
    ph: float
    turbidity: float
    dissolved_oxygen: float
    bod: float
    cod: float
    rainfall: float
    water_flow: float

class TimelineItem(TrendDataPoint):
    delta: float
    is_surge: bool

class EarlyWarningDetails(BaseModel):
    date: str
    current_risk: float
    previous_risk: float
    delta: float
    message: str

class EarlyWarningObj(BaseModel):
    has_early_warning: bool
    details: Optional[EarlyWarningDetails] = None

class TrendsResponse(BaseModel):
    location: str
    time_range: str
    data_points: List[TrendDataPoint]
    timeline: List[TimelineItem]
    early_warning: EarlyWarningObj

class AlertItem(BaseModel):
    id: str
    station_id: str
    station_name: str
    severity: str
    title: str
    message: str
    primary_reason: str
    timestamp: str
    status: str
    recommended_action: str

class DemoScenario(BaseModel):
    id: str
    name: str
    category: str
    description: str
    expected_risk: str
    parameters: Dict[str, float]
