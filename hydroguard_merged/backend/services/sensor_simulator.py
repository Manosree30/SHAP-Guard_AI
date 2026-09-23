"""
HydroGuard-XAI - Sensor Telemetry Simulator & Location Store
Manages river monitoring stations, historical trend time-series, live anomaly alerts,
and preset demo scenarios for instant judge evaluations.
"""

import numpy as np
from datetime import datetime, timedelta

DEMO_SCENARIOS = [
    {
        "id": "scenario_safe",
        "name": "Pristine / Safe Baseline",
        "category": "Baseline",
        "description": "Healthy river reach with optimal dissolved oxygen, low BOD, clear water, and neutral pH.",
        "expected_risk": "LOW",
        "parameters": {
            "ph": 7.35,
            "turbidity": 2.8,
            "dissolved_oxygen": 8.1,
            "temperature": 23.5,
            "conductivity": 220.0,
            "tds": 140.0,
            "bod": 1.2,
            "cod": 4.5,
            "rainfall": 2.0,
            "water_flow": 210.0
        }
    },
    {
        "id": "scenario_moderate",
        "name": "Agricultural Fertilizer Runoff",
        "category": "Agricultural",
        "description": "Recent moderate rainfall triggered agricultural topsoil erosion and mild fertilizer runoff.",
        "expected_risk": "MODERATE",
        "parameters": {
            "ph": 7.85,
            "turbidity": 26.5,
            "dissolved_oxygen": 5.4,
            "temperature": 26.0,
            "conductivity": 580.0,
            "tds": 420.0,
            "bod": 4.2,
            "cod": 22.0,
            "rainfall": 48.0,
            "water_flow": 260.0
        }
    },
    {
        "id": "scenario_high_sewage",
        "name": "Urban Sewage Inflow & Hypoxia",
        "category": "Urban Sewage",
        "description": "Untreated domestic wastewater inflow during low-flow stagnation, causing severe dissolved oxygen depletion.",
        "expected_risk": "HIGH",
        "parameters": {
            "ph": 6.65,
            "turbidity": 58.0,
            "dissolved_oxygen": 2.9,
            "temperature": 29.5,
            "conductivity": 780.0,
            "tds": 620.0,
            "bod": 9.5,
            "cod": 42.0,
            "rainfall": 6.0,
            "water_flow": 42.0
        }
    },
    {
        "id": "scenario_critical_industrial",
        "name": "Industrial Acid / Effluent Discharge",
        "category": "Industrial Chemical",
        "description": "Acute unneutralized industrial chemical effluent containing heavy synthetic oxidizable organics and acid shock.",
        "expected_risk": "CRITICAL",
        "parameters": {
            "ph": 4.80,
            "turbidity": 85.0,
            "dissolved_oxygen": 2.1,
            "temperature": 33.0,
            "conductivity": 1450.0,
            "tds": 1180.0,
            "bod": 14.5,
            "cod": 98.0,
            "rainfall": 4.0,
            "water_flow": 32.0
        }
    }
]

RIVER_STATIONS = [
    {
        "id": "cauvery",
        "name": "Cauvery River",
        "station_name": "Cauvery - Erode Monitoring Reach",
        "state": "Tamil Nadu",
        "lat": 11.3410,
        "lng": 77.7172,
        "current_risk_score": 78.4,
        "current_risk_level": "HIGH",
        "wqi": 48.2,
        "previous_risk_score": 42.1,
        "spike_alert": True,
        "last_updated": "25 Aug 2026, 04:30 PM",
        "status_summary": "Elevated turbidity and urban drain runoff detected near weir intake.",
        "parameters": {
            "ph": 6.65,
            "turbidity": 58.0,
            "dissolved_oxygen": 2.9,
            "temperature": 29.5,
            "conductivity": 780.0,
            "tds": 620.0,
            "bod": 9.5,
            "cod": 42.0,
            "rainfall": 6.0,
            "water_flow": 42.0
        }
    },
    {
        "id": "bhavani",
        "name": "Bhavani River",
        "station_name": "Bhavani - Sirumugai Catchment",
        "state": "Tamil Nadu",
        "lat": 11.3250,
        "lng": 77.0150,
        "current_risk_score": 38.5,
        "current_risk_level": "MODERATE",
        "wqi": 72.0,
        "previous_risk_score": 32.0,
        "spike_alert": False,
        "last_updated": "25 Aug 2026, 04:15 PM",
        "status_summary": "Moderate agricultural runoff from upstream plantations following light shower.",
        "parameters": {
            "ph": 7.8,
            "turbidity": 22.0,
            "dissolved_oxygen": 5.8,
            "temperature": 25.2,
            "conductivity": 490.0,
            "tds": 340.0,
            "bod": 3.8,
            "cod": 19.0,
            "rainfall": 32.0,
            "water_flow": 220.0
        }
    },
    {
        "id": "noyyal",
        "name": "Noyyal River",
        "station_name": "Noyyal - Tiruppur Industrial Corridor",
        "state": "Tamil Nadu",
        "lat": 11.1085,
        "lng": 77.3411,
        "current_risk_score": 86.2,
        "current_risk_level": "CRITICAL",
        "wqi": 32.5,
        "previous_risk_score": 80.0,
        "spike_alert": False,
        "last_updated": "25 Aug 2026, 04:25 PM",
        "status_summary": "High TDS and chemical oxygen demand indicating untreated dye house effluent.",
        "parameters": {
            "ph": 5.1,
            "turbidity": 78.0,
            "dissolved_oxygen": 2.3,
            "temperature": 32.5,
            "conductivity": 1380.0,
            "tds": 1120.0,
            "bod": 13.2,
            "cod": 88.0,
            "rainfall": 2.0,
            "water_flow": 28.0
        }
    },
    {
        "id": "vaigai",
        "name": "Vaigai River",
        "station_name": "Vaigai - Madurai Urban Gateway",
        "state": "Tamil Nadu",
        "lat": 9.9252,
        "lng": 78.1198,
        "current_risk_score": 64.0,
        "current_risk_level": "HIGH",
        "wqi": 54.0,
        "previous_risk_score": 45.0,
        "spike_alert": True,
        "last_updated": "25 Aug 2026, 04:00 PM",
        "status_summary": "Low base flow and untreated stormwater inflow causing localized hypoxia.",
        "parameters": {
            "ph": 6.8,
            "turbidity": 42.0,
            "dissolved_oxygen": 3.6,
            "temperature": 28.0,
            "conductivity": 680.0,
            "tds": 510.0,
            "bod": 7.4,
            "cod": 32.0,
            "rainfall": 0.0,
            "water_flow": 38.0
        }
    },
    {
        "id": "tamaraibarani",
        "name": "Tamaraibarani River",
        "station_name": "Tamaraibarani - Papanasam Headworks",
        "state": "Tamil Nadu",
        "lat": 8.7139,
        "lng": 77.7567,
        "current_risk_score": 14.2,
        "current_risk_level": "LOW",
        "wqi": 91.5,
        "previous_risk_score": 16.0,
        "spike_alert": False,
        "last_updated": "25 Aug 2026, 03:50 PM",
        "status_summary": "Optimal mountain flow with saturated dissolved oxygen and pristine clarity.",
        "parameters": {
            "ph": 7.4,
            "turbidity": 2.2,
            "dissolved_oxygen": 8.4,
            "temperature": 22.0,
            "conductivity": 190.0,
            "tds": 120.0,
            "bod": 1.0,
            "cod": 3.8,
            "rainfall": 5.0,
            "water_flow": 310.0
        }
    },
    {
        "id": "sample_river",
        "name": "Sample River",
        "station_name": "Sample River - Demonstration Station",
        "state": "Demo Catchment",
        "lat": 11.0000,
        "lng": 77.5000,
        "current_risk_score": 22.0,
        "current_risk_level": "LOW",
        "wqi": 86.0,
        "previous_risk_score": 24.0,
        "spike_alert": False,
        "last_updated": "25 Aug 2026, 04:30 PM",
        "status_summary": "Standard demonstration station for interactive parameter experimentation.",
        "parameters": {
            "ph": 7.2,
            "turbidity": 4.5,
            "dissolved_oxygen": 7.4,
            "temperature": 24.0,
            "conductivity": 280.0,
            "tds": 180.0,
            "bod": 1.8,
            "cod": 6.5,
            "rainfall": 10.0,
            "water_flow": 190.0
        }
    }
]

def generate_location_trends(location_name: str, time_range: str = "30d") -> dict:
    """
    Generates realistic historical trend observations for graphs and timeline.
    Supports '7d', '30d', '90d' windows with realistic hydrological oscillations and spike events.
    """
    days = 30
    if time_range == "7d":
        days = 7
    elif time_range == "90d":
        days = 90

    # Determine baseline characteristics based on location
    matched = next((s for s in RIVER_STATIONS if s["name"].lower() == location_name.lower() or s["id"] == location_name.lower()), RIVER_STATIONS[0])
    base_params = matched["parameters"]
    base_risk = matched["current_risk_score"]

    np.random.seed(abs(hash(location_name)) % 10000 + days)
    
    end_date = datetime(2026, 8, 25, 16, 30)
    data_points = []
    
    # Generate daily records
    for i in range(days, -1, -1):
        dt = end_date - timedelta(days=i)
        date_str = dt.strftime("%d %b")
        iso_str = dt.strftime("%Y-%m-%d")

        # Introduce realistic multi-day weather / discharge wave
        wave = np.sin(i * 0.45) * 12.0
        
        # Inject an early warning surge spike around day 3-5 before latest
        surge = 0.0
        if 0 <= i <= 2 and matched["spike_alert"]:
            surge = 25.0

        ph = float(np.clip(base_params["ph"] + np.random.normal(0, 0.25) - (surge * 0.02), 4.5, 9.5))
        turb = float(np.clip(base_params["turbidity"] + np.random.normal(0, 4.0) + (surge * 0.8), 1.0, 180.0))
        do = float(np.clip(base_params["dissolved_oxygen"] + np.random.normal(0, 0.35) - (surge * 0.08), 1.2, 11.0))
        bod = float(np.clip(base_params["bod"] + np.random.normal(0, 0.5) + (surge * 0.15), 0.5, 30.0))
        cod = float(np.clip(base_params["cod"] + np.random.normal(0, 2.0) + (surge * 0.4), 2.0, 120.0))
        rainfall = float(np.clip(base_params["rainfall"] + np.random.exponential(5.0) if np.random.rand() > 0.6 else 0.0, 0.0, 150.0))
        
        risk = float(np.clip(base_risk + wave + (surge * 0.9) + np.random.normal(0, 3.0), 5.0, 96.0))
        
        if risk <= 25.0:
            level = "LOW"
        elif risk <= 50.0:
            level = "MODERATE"
        elif risk <= 75.0:
            level = "HIGH"
        else:
            level = "CRITICAL"

        data_points.append({
            "timestamp": iso_str,
            "display_date": date_str,
            "risk_score": round(risk, 1),
            "risk_level": level,
            "ph": round(ph, 2),
            "turbidity": round(turb, 1),
            "dissolved_oxygen": round(do, 2),
            "bod": round(bod, 2),
            "cod": round(cod, 1),
            "rainfall": round(rainfall, 1),
            "water_flow": round(base_params["water_flow"] + np.random.normal(0, 15.0), 1)
        })

    # Identify sudden risk surge in timeline (Early Warning detection)
    timeline = []
    spike_detected = False
    spike_details = None

    for idx, pt in enumerate(data_points):
        delta = 0.0
        if idx > 0:
            delta = round(pt["risk_score"] - data_points[idx - 1]["risk_score"], 1)

        is_spike = delta >= 15.0 or (pt["risk_score"] >= 70.0 and delta >= 10.0)
        if is_spike and idx >= len(data_points) - 4:
            spike_detected = True
            spike_details = {
                "date": pt["display_date"],
                "current_risk": pt["risk_score"],
                "previous_risk": data_points[idx - 1]["risk_score"],
                "delta": delta,
                "message": f"Risk increased by {delta:+.1f} percentage points compared with the previous observation ({data_points[idx - 1]['risk_score']}% → {pt['risk_score']}%)."
            }

        timeline.append({
            **pt,
            "delta": delta,
            "is_surge": is_spike
        })

    # Reverse timeline for display table (newest first)
    timeline_reversed = list(reversed(timeline))

    return {
        "location": matched["name"],
        "time_range": time_range,
        "data_points": data_points,
        "timeline": timeline_reversed,
        "early_warning": {
            "has_early_warning": spike_detected,
            "details": spike_details
        }
    }

def get_live_alerts():
    """
    Generates dynamic active pollution incident alerts based on current station telemetry.
    """
    alerts = [
        {
            "id": "alt_cauvery_spike",
            "station_id": "cauvery",
            "station_name": "Cauvery River (Erode Station)",
            "severity": "HIGH",
            "title": "Cauvery Monitoring Station: Early Pollution Warning",
            "message": "Risk increased by +36.3 percentage points compared with previous observation (42.1% → 78.4%).",
            "primary_reason": "Turbidity increased to 58.0 NTU and Dissolved Oxygen depleted to 2.9 mg/L.",
            "timestamp": "16 minutes ago",
            "status": "ACTIVE",
            "recommended_action": "Inspect upstream municipal drainage outfalls and alert downstream intake."
        },
        {
            "id": "alt_noyyal_critical",
            "station_id": "noyyal",
            "station_name": "Noyyal River (Tiruppur Corridor)",
            "severity": "CRITICAL",
            "title": "Noyyal River: Severe Chemical Load & Acidic Ingress",
            "message": "Pollution risk reached 86.2/100 (CRITICAL). Extreme TDS (1120 mg/L) and low pH (5.1).",
            "primary_reason": "Suspected untreated industrial dye and chemical solvent discharge during low flow.",
            "timestamp": "35 minutes ago",
            "status": "ACTIVE",
            "recommended_action": "Immediate field sampling and industrial effluent compliance audit."
        },
        {
            "id": "alt_vaigai_hypoxia",
            "station_id": "vaigai",
            "station_name": "Vaigai River (Madurai Gateway)",
            "severity": "HIGH",
            "title": "Vaigai River: Moderate Hypoxia & Organic BOD Surge",
            "message": "Pollution risk elevated to 64.0/100 (HIGH). Dissolved oxygen declined below 4.0 mg/L.",
            "primary_reason": "Stagnant low flow conditions concentrating untreated organic runoff.",
            "timestamp": "1 hour ago",
            "status": "INVESTIGATING",
            "recommended_action": "Deploy mobile aeration units and request base-flow release."
        }
    ]
    return alerts
