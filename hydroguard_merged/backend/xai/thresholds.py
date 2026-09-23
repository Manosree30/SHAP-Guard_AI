"""
HydroGuard-XAI - Environmental Water Quality Thresholds & Status Classifier
Provides scientific standard reference ranges, parameter status classification,
and environmental impact descriptors based on CPCB, WHO, and EPA standards.
"""

PARAM_METADATA = {
    "ph": {
        "name": "pH Level",
        "unit": "",
        "min_safe": 6.5,
        "max_safe": 8.5,
        "optimal_min": 7.0,
        "optimal_max": 7.8,
        "low_desc": "Acidic conditions, typically from industrial chemical discharge, acid mine drainage, or atmospheric acid deposition.",
        "high_desc": "Alkaline conditions, often linked to industrial effluents (textile/tannery), soap washings, or severe algal blooms.",
        "normal_desc": "Balanced neutral pH supporting healthy aquatic life and standard biological functions."
    },
    "turbidity": {
        "name": "Turbidity",
        "unit": "NTU",
        "min_safe": 0.0,
        "max_safe": 10.0,
        "optimal_min": 0.5,
        "optimal_max": 5.0,
        "high_threshold": 25.0,
        "critical_threshold": 60.0,
        "high_desc": "Elevated particulate suspension, silt runoff, soil erosion, or wastewater discharge limiting sunlight penetration.",
        "normal_desc": "Clear water with minimal suspended solids, permitting normal aquatic photosynthesis."
    },
    "dissolved_oxygen": {
        "name": "Dissolved Oxygen (DO)",
        "unit": "mg/L",
        "min_safe": 6.0,
        "max_safe": 14.0,
        "optimal_min": 6.5,
        "optimal_max": 9.5,
        "low_threshold": 4.5,
        "critical_threshold": 3.0,
        "low_desc": "Hypoxic or depleted oxygen condition, signaling intensive biological decomposition of organic waste and endangering fish fauna.",
        "normal_desc": "Well-oxygenated water ensuring healthy respiratory conditions for aquatic ecosystems."
    },
    "temperature": {
        "name": "Water Temperature",
        "unit": "°C",
        "min_safe": 18.0,
        "max_safe": 29.0,
        "optimal_min": 22.0,
        "optimal_max": 27.0,
        "high_desc": "Thermal pollution, often from cooling water discharge, reducing gas solubility and accelerating microbial metabolism.",
        "normal_desc": "Ambient seasonal water temperature within standard ecological tolerance."
    },
    "conductivity": {
        "name": "Electrical Conductivity",
        "unit": "µS/cm",
        "min_safe": 100.0,
        "max_safe": 600.0,
        "optimal_min": 150.0,
        "optimal_max": 400.0,
        "high_desc": "High dissolved mineral salts or ionic contaminants, typically from agricultural drainage or chemical runoff.",
        "normal_desc": "Normal ionic balance representing healthy natural freshwater baseline."
    },
    "tds": {
        "name": "Total Dissolved Solids (TDS)",
        "unit": "mg/L",
        "min_safe": 50.0,
        "max_safe": 400.0,
        "optimal_min": 100.0,
        "optimal_max": 250.0,
        "high_desc": "Elevated inorganic salts and organic matter, increasing water salinity and mineral burden.",
        "normal_desc": "Standard dissolved solids concentration within healthy freshwater parameters."
    },
    "bod": {
        "name": "Biochemical Oxygen Demand (BOD)",
        "unit": "mg/L",
        "min_safe": 0.0,
        "max_safe": 3.0,
        "optimal_min": 0.5,
        "optimal_max": 2.0,
        "high_threshold": 5.0,
        "critical_threshold": 10.0,
        "high_desc": "High organic contamination (untreated domestic sewage, livestock waste, or food processing effluent) demanding extensive microbial oxygen.",
        "normal_desc": "Low organic loading with natural biological purification balance."
    },
    "cod": {
        "name": "Chemical Oxygen Demand (COD)",
        "unit": "mg/L",
        "min_safe": 0.0,
        "max_safe": 15.0,
        "optimal_min": 2.0,
        "optimal_max": 10.0,
        "high_threshold": 30.0,
        "critical_threshold": 60.0,
        "high_desc": "High non-biodegradable chemical pollution burden, frequently indicating synthetic industrial discharge.",
        "normal_desc": "Clean chemical baseline with minimal non-biodegradable oxidizable pollutants."
    },
    "rainfall": {
        "name": "Rainfall",
        "unit": "mm",
        "min_safe": 0.0,
        "max_safe": 50.0,
        "optimal_min": 0.0,
        "optimal_max": 20.0,
        "high_desc": "Heavy precipitation inducing intense non-point source overland surface runoff and sediment flush.",
        "normal_desc": "Moderate or dry conditions with standard overland runoff interaction."
    },
    "water_flow": {
        "name": "Water Flow Rate",
        "unit": "m³/s",
        "min_safe": 50.0,
        "max_safe": 400.0,
        "optimal_min": 80.0,
        "optimal_max": 250.0,
        "low_desc": "Low river discharge volume diminishing natural dilution capacity and exacerbating pollutant concentration.",
        "normal_desc": "Adequate hydrodynamic flow facilitating natural re-aeration and pollutant dispersal."
    }
}

def evaluate_parameter_status(param_key: str, value: float) -> dict:
    meta = PARAM_METADATA.get(param_key, {})
    name = meta.get("name", param_key)
    unit = meta.get("unit", "")
    
    status = "normal"
    badge_label = "Normal"
    status_color = "emerald"
    narrative = meta.get("normal_desc", "Normal level")

    if param_key == "ph":
        if value < 6.0:
            status = "critical_low"
            badge_label = "Critically Acidic"
            status_color = "rose"
            narrative = meta["low_desc"]
        elif value < 6.5:
            status = "below_normal"
            badge_label = "Below Normal (Acidic)"
            status_color = "amber"
            narrative = meta["low_desc"]
        elif value > 9.0:
            status = "critical_high"
            badge_label = "Critically Alkaline"
            status_color = "rose"
            narrative = meta["high_desc"]
        elif value > 8.5:
            status = "above_normal"
            badge_label = "Above Normal (Alkaline)"
            status_color = "amber"
            narrative = meta["high_desc"]

    elif param_key == "dissolved_oxygen":
        if value < 3.0:
            status = "critical_low"
            badge_label = "Severe Hypoxia (Critical)"
            status_color = "rose"
            narrative = meta["low_desc"]
        elif value < 5.0:
            status = "below_normal"
            badge_label = "Low (Stressed)"
            status_color = "amber"
            narrative = meta["low_desc"]
        elif value >= 6.5:
            badge_label = "Optimal"

    elif param_key in ["turbidity", "bod", "cod"]:
        crit_t = meta.get("critical_threshold", 50.0)
        high_t = meta.get("high_threshold", 20.0)
        max_s = meta.get("max_safe", 10.0)
        
        if value >= crit_t:
            status = "critical_high"
            badge_label = "Critically High"
            status_color = "rose"
            narrative = meta["high_desc"]
        elif value >= high_t or value > max_s:
            status = "above_normal"
            badge_label = "Elevated"
            status_color = "amber"
            narrative = meta["high_desc"]

    elif param_key in ["conductivity", "tds", "temperature", "rainfall"]:
        max_s = meta.get("max_safe", 500.0)
        if value > max_s * 1.5:
            status = "critical_high"
            badge_label = "Significantly High"
            status_color = "rose"
            narrative = meta["high_desc"]
        elif value > max_s:
            status = "above_normal"
            badge_label = "Elevated"
            status_color = "amber"
            narrative = meta["high_desc"]

    elif param_key == "water_flow":
        min_s = meta.get("min_safe", 50.0)
        if value < min_s * 0.6:
            status = "critical_low"
            badge_label = "Critically Low Flow"
            status_color = "rose"
            narrative = meta["low_desc"]
        elif value < min_s:
            status = "below_normal"
            badge_label = "Low Flow"
            status_color = "amber"
            narrative = meta["low_desc"]

    return {
        "key": param_key,
        "name": name,
        "value": value,
        "unit": unit,
        "status": status,
        "badge_label": badge_label,
        "status_color": status_color,
        "safe_range": f"{meta.get('min_safe', 0)} - {meta.get('max_safe', 100)} {unit}".strip(),
        "narrative": narrative
    }
