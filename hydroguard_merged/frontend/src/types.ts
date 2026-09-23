export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface WaterQualityParams {
  ph: number;
  turbidity: number;
  dissolved_oxygen: number;
  temperature: number;
  conductivity: number;
  tds: number;
  bod: number;
  cod: number;
  rainfall: number;
  water_flow: number;
}

export interface FeatureDriver {
  key: string;
  name: string;
  unit: string;
  value: number;
  value_formatted: string;
  impact: number;
  direction: 'INCREASES_RISK' | 'DECREASES_RISK';
  magnitude: number;
}

export interface ParameterStatus {
  key: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'below_normal' | 'above_normal' | 'critical_low' | 'critical_high';
  badge_label: string;
  status_color: 'emerald' | 'amber' | 'rose' | 'cyan';
  safe_range: string;
  narrative: string;
}

export interface DynamicExplanation {
  summary: string;
  detailed_text: string;
  key_points: string[];
}

export interface ActionRecommendation {
  id: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  title: string;
  action: string;
  rationale: string;
  disclaimer: string;
}

export interface ModelMetadata {
  model_name: string;
  accuracy: number;
  disclaimer: string;
}

export interface PredictionResponse {
  risk_score: number;
  risk_level: RiskLevel;
  confidence: number;
  confidence_pct: number;
  wqi: number;
  location: string;
  sanitized_params: WaterQualityParams;
  validation_warnings: string[];
  top_drivers: FeatureDriver[];
  mitigating_drivers: FeatureDriver[];
  chart_drivers: FeatureDriver[];
  parameter_statuses: ParameterStatus[];
  explanation: DynamicExplanation;
  recommendations: ActionRecommendation[];
  base_value: number;
  model_metadata: ModelMetadata;
}

export interface StationItem {
  id: string;
  name: string;
  station_name: string;
  state: string;
  lat: number;
  lng: number;
  current_risk_score: number;
  current_risk_level: RiskLevel;
  wqi: number;
  previous_risk_score: number;
  spike_alert: boolean;
  last_updated: string;
  status_summary: string;
  parameters: WaterQualityParams;
}

export interface TrendDataPoint {
  timestamp: string;
  display_date: string;
  risk_score: number;
  risk_level: RiskLevel;
  ph: number;
  turbidity: number;
  dissolved_oxygen: number;
  bod: number;
  cod: number;
  rainfall: number;
  water_flow: number;
}

export interface TimelineItem extends TrendDataPoint {
  delta: number;
  is_surge: boolean;
}

export interface EarlyWarningDetails {
  date: string;
  current_risk: number;
  previous_risk: number;
  delta: number;
  message: string;
}

export interface TrendsResponse {
  location: string;
  time_range: '7d' | '30d' | '90d';
  data_points: TrendDataPoint[];
  timeline: TimelineItem[];
  early_warning: {
    has_early_warning: boolean;
    details: EarlyWarningDetails | null;
  };
}

export interface AlertItem {
  id: string;
  station_id: string;
  station_name: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  primary_reason: string;
  timestamp: string;
  status: string;
  recommended_action: string;
}

export interface DemoScenario {
  id: string;
  name: string;
  category: string;
  description: string;
  expected_risk: RiskLevel;
  parameters: WaterQualityParams;
}
