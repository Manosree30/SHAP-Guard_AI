"""
HydroGuard-XAI - Actionable Environmental Intelligence & Recommendation Engine
Generates prioritized, context-aware operational recommendations for river basin authorities,
pollution control field officers, and environmental scientists.
"""

def generate_recommendations(risk_level: str, risk_score: float, top_drivers: list, param_statuses: list) -> list[dict]:
    """
    Generates tailored, prioritized recommendations based on the predicted risk level
    and the specific chemical/hydrological parameters driving the risk.
    """
    recs = []
    driver_keys = [d["key"] for d in top_drivers]
    param_dict = {p["key"]: p for p in param_statuses}

    # 1. Critical & High Priority Emergency Overrides
    if risk_level in ["HIGH", "CRITICAL"]:
        recs.append({
            "id": "rec_field_dispatch",
            "priority": "HIGH" if risk_level == "HIGH" else "CRITICAL",
            "category": "Immediate Field Action",
            "title": "Dispatch Rapid Response Verification Team",
            "action": "Deploy field inspection crew to river sampling transects to collect confirmatory grab samples and inspect immediate upstream banks.",
            "rationale": f"Overall pollution risk reached {risk_score:.0f}/100 ({risk_level} tier)."
        })
        
        recs.append({
            "id": "rec_intake_alert",
            "priority": "HIGH",
            "category": "Water Utility Alert",
            "title": "Notify Downstream Water Treatment Utilities",
            "action": "Issue precautionary advisory to municipal water intakes and irrigation gates downstream to adjust coagulant dosing or temporarily buffer intake.",
            "rationale": "High contaminant concentration may disrupt standard municipal filtration processes."
        })

    # 2. Factor-Specific Interventions

    # Turbidity
    if "turbidity" in driver_keys or param_dict.get("turbidity", {}).get("status") in ["above_normal", "critical_high"]:
        turb_val = param_dict.get("turbidity", {}).get("value", 0)
        recs.append({
            "id": "rec_turbidity",
            "priority": "MEDIUM" if risk_level == "MODERATE" else "HIGH",
            "category": "Sediment & Runoff Control",
            "title": "Inspect Upstream Construction & Silt Runoff Outfalls",
            "action": "Audit active excavation, agricultural drainage canals, and stormwater outfalls within a 5 km upstream radius for silt curtain compliance.",
            "rationale": f"Turbidity measured at {turb_val} NTU (elevated particulate suspension)."
        })

    # Dissolved Oxygen & BOD (Organic Pollution)
    if ("dissolved_oxygen" in driver_keys or "bod" in driver_keys or 
        param_dict.get("dissolved_oxygen", {}).get("status") in ["below_normal", "critical_low"] or
        param_dict.get("bod", {}).get("status") in ["above_normal", "critical_high"]):
        
        do_val = param_dict.get("dissolved_oxygen", {}).get("value", 0)
        bod_val = param_dict.get("bod", {}).get("value", 0)
        
        recs.append({
            "id": "rec_organic_wastewater",
            "priority": "HIGH" if do_val < 4.0 or bod_val > 5.0 else "MEDIUM",
            "category": "Sewage & Organic Audit",
            "title": "Audit Sewage Treatment Plants (STP) & Drain Inflows",
            "action": "Inspect outfalls of nearby municipal STPs, commercial drains, and livestock facilities for untreated organic sewage bypass.",
            "rationale": f"DO at {do_val} mg/L and BOD at {bod_val} mg/L signal heavy organic biodegradation consuming aquatic oxygen."
        })

        if do_val < 3.5:
            recs.append({
                "id": "rec_aeration",
                "priority": "HIGH",
                "category": "Ecological Support",
                "title": "Deploy Mobile Surface Aerators in Stagnant Reaches",
                "action": "Activate mechanical fountain aerators or diffused micro-bubble aerators at critical weir pools to prevent acute fish mortality.",
                "rationale": "Hypoxic conditions (< 3.5 mg/L DO) threaten immediate aquatic respiratory collapse."
            })

    # pH Anomalies (Chemical / Industrial)
    ph_status = param_dict.get("ph", {}).get("status", "normal")
    if "ph" in driver_keys or ph_status in ["below_normal", "critical_low", "above_normal", "critical_high"]:
        ph_val = param_dict.get("ph", {}).get("value", 7.0)
        recs.append({
            "id": "rec_ph_chemical",
            "priority": "HIGH",
            "category": "Industrial & Chemical Surveillance",
            "title": "Investigate Industrial Effluent Discharges",
            "action": "Audit upstream textile, chemical, electroplating, and manufacturing facilities for unneutralized acidic or alkaline effluent discharge.",
            "rationale": f"Abnormal pH of {ph_val} indicates synthetic chemical ingress."
        })

    # COD (Chemical Oxygen Demand)
    if "cod" in driver_keys or param_dict.get("cod", {}).get("status") in ["above_normal", "critical_high"]:
        cod_val = param_dict.get("cod", {}).get("value", 0)
        recs.append({
            "id": "rec_cod_trace",
            "priority": "MEDIUM" if risk_level != "CRITICAL" else "HIGH",
            "category": "Refractory Chemical Trace",
            "title": "Screen for Non-Biodegradable Industrial Solvents & Surfactants",
            "action": "Collect laboratory samples for spectrophotometric chemical screening (heavy metals, phenolic compounds, surfactants).",
            "rationale": f"Elevated COD ({cod_val} mg/L) indicates presence of chemically oxidizable industrial non-biodegradable waste."
        })

    # Low Flow Stagnation
    flow_status = param_dict.get("water_flow", {}).get("status", "normal")
    if flow_status in ["below_normal", "critical_low"] and risk_level in ["MODERATE", "HIGH", "CRITICAL"]:
        recs.append({
            "id": "rec_flow_release",
            "priority": "MEDIUM",
            "category": "Hydrological Management",
            "title": "Request Ecological Base Flow Release from Upstream Barrage",
            "action": "Coordinate with water resources department to release dilution base-flow from upstream reservoir to flush stagnant pollutant accumulation.",
            "rationale": "Low hydrodynamic discharge reduces dilution capacity and amplifies localized contaminant toxicity."
        })

    # 3. Routine Low-Risk / Baseline Recommendations
    if risk_level == "LOW":
        recs.append({
            "id": "rec_routine_telemetry",
            "priority": "LOW",
            "category": "Routine Surveillance",
            "title": "Maintain Continuous Telemetry & Baseline Sensor Logging",
            "action": "Continue standard 15-minute telemetry intervals. Ensure sensor optical surfaces and DO membranes are calibrated on weekly schedule.",
            "rationale": "Water quality parameters remain within healthy baseline environmental thresholds."
        })
        recs.append({
            "id": "rec_watershed_preservation",
            "priority": "LOW",
            "category": "Catchment Management",
            "title": "Support Riparian Vegetation & Wetland Buffers",
            "action": "Preserve natural floodplain vegetation along river banks to filter natural seasonal overland surface runoff.",
            "rationale": "Natural buffer zones help maintain stable baseline water quality."
        })

    # Add general decision support disclaimer
    for r in recs:
        r["disclaimer"] = "Advisory decision support guidance. Subject to ground validation and statutory authority protocols."

    return recs
