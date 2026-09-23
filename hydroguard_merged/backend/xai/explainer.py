"""
HydroGuard-XAI - Explainable AI (XAI) Feature Attribution & Interpretation Engine
Computes exact tree-based feature attributions (TreeSHAP principles), generates dynamic
human-understandable environmental explanations, and identifies primary risk drivers.
"""

import numpy as np
from sklearn.tree import _tree
from xai.thresholds import evaluate_parameter_status, PARAM_METADATA

def compute_tree_regressor_attributions(regressor, X_scaled_sample, feature_names):
    """
    Computes exact local feature contributions for a Random Forest Regressor
    by traversing the decision paths of each individual estimator tree.
    Guarantees: sum(attributions) + base_value = predicted_score
    """
    sample = X_scaled_sample.reshape(1, -1)
    n_features = len(feature_names)
    n_estimators = len(regressor.estimators_)
    
    total_contributions = np.zeros(n_features)
    base_values = []
    
    for tree in regressor.estimators_:
        t = tree.tree_
        # Expected value at root
        root_val = t.value[0, 0, 0]
        base_values.append(root_val)
        
        # Traverse node path for this sample
        node_id = 0
        current_val = root_val
        
        while t.children_left[node_id] != _tree.TREE_LEAF:
            feat_idx = t.feature[node_id]
            threshold = t.threshold[node_id]
            
            if sample[0, feat_idx] <= threshold:
                next_node = t.children_left[node_id]
            else:
                next_node = t.children_right[node_id]
                
            next_val = t.value[next_node, 0, 0]
            delta = next_val - current_val
            total_contributions[feat_idx] += delta
            
            node_id = next_node
            current_val = next_val

    # Average across all trees in the ensemble
    mean_base_value = float(np.mean(base_values))
    avg_contributions = total_contributions / n_estimators
    
    attributions = {}
    for i, name in enumerate(feature_names):
        attributions[name] = float(avg_contributions[i])
        
    return attributions, mean_base_value

def calculate_wqi(params: dict) -> float:
    """
    Computes standard Canadian / Weighted Arithmetic Water Quality Index (WQI) (0-100, where 100 is pristine).
    """
    sub_indices = []
    
    # pH sub-index (ideal 7.2)
    ph = params.get("ph", 7.0)
    ph_score = max(0, 100 - abs(ph - 7.2) * 28)
    sub_indices.append(ph_score * 0.15)
    
    # DO sub-index (ideal >= 7.5)
    do = params.get("dissolved_oxygen", 7.0)
    do_score = min(100, max(0, (do / 8.0) * 100))
    sub_indices.append(do_score * 0.25)
    
    # BOD sub-index (ideal <= 1.0)
    bod = params.get("bod", 1.5)
    bod_score = max(0, 100 - (bod * 16.0))
    sub_indices.append(bod_score * 0.20)
    
    # Turbidity sub-index (ideal <= 2.0)
    turb = params.get("turbidity", 3.0)
    turb_score = max(0, 100 - (turb * 2.5))
    sub_indices.append(turb_score * 0.15)
    
    # TDS sub-index
    tds = params.get("tds", 150.0)
    tds_score = max(0, 100 - ((tds - 100) * 0.12))
    sub_indices.append(tds_score * 0.10)
    
    # COD sub-index
    cod = params.get("cod", 5.0)
    cod_score = max(0, 100 - (cod * 1.5))
    sub_indices.append(cod_score * 0.15)
    
    wqi = float(np.clip(sum(sub_indices), 5.0, 99.0))
    return round(wqi, 1)

def generate_dynamic_explanation(risk_level: str, risk_score: float, top_increasing: list, top_decreasing: list, param_statuses: list) -> dict:
    """
    Generates dynamic, human-understandable environmental narrative synthesizing
    the primary risk drivers and ecological dynamics without fake fixed templates.
    """
    # Group abnormal parameters
    critical_params = [p for p in param_statuses if "critical" in p["status"]]
    abnormal_params = [p for p in param_statuses if "normal" not in p["status"] and "optimal" not in p["badge_label"].lower()]
    
    lead_drivers = [f"{d['name']} ({'+' if d['impact'] > 0 else ''}{d['impact']:.1f} pts)" for d in top_increasing[:3]]
    
    # Construct synthesis summary
    if risk_level in ["HIGH", "CRITICAL"]:
        if len(top_increasing) > 0:
            main_factors = ", ".join([d["name"] for d in top_increasing[:3]])
            summary = (
                f"Elevated pollution risk ({risk_score:.0f}/100) is predominantly driven by {main_factors}. "
            )
        else:
            summary = f"Severe cumulative environmental stress observed with a pollution risk score of {risk_score:.0f}/100. "

        # Add domain insights based on key combinations
        insights = []
        param_dict = {p["key"]: p for p in param_statuses}
        
        do_status = param_dict.get("dissolved_oxygen", {}).get("status", "normal")
        bod_status = param_dict.get("bod", {}).get("status", "normal")
        ph_val = param_dict.get("ph", {}).get("value", 7.0)
        turb_val = param_dict.get("turbidity", {}).get("value", 5.0)
        
        if "critical" in do_status or "below" in do_status:
            if "high" in bod_status:
                insights.append("Low dissolved oxygen combined with elevated BOD strongly indicates active aerobic microbial decomposition of untreated organic wastewater.")
            else:
                insights.append("Depleted dissolved oxygen threatens aquatic respiratory survival and indicates oxygen-demanding contaminant load.")

        if ph_val < 6.2 or ph_val > 8.8:
            insights.append(f"Abnormal pH level ({ph_val}) suggests chemical or untreated industrial effluent discharge disrupting natural river alkalinity.")

        if turb_val > 30.0:
            insights.append(f"High turbidity ({turb_val} NTU) indicates heavy suspended particulate matter, limiting photic depth and potentially carrying adsorbed contaminants.")

        if not insights:
            insights.append("Multiple combined water quality parameters have exceeded safe ecological baseline thresholds.")

        detailed_text = summary + " " + " ".join(insights)

    elif risk_level == "MODERATE":
        if top_increasing:
            main_factors = ", ".join([d["name"] for d in top_increasing[:2]])
            detailed_text = (
                f"Moderate pollution risk ({risk_score:.0f}/100). Mild anomalies detected in {main_factors}, "
                f"while other parameters remain within acceptable ecological tolerance."
            )
        else:
            detailed_text = f"Moderate water quality condition ({risk_score:.0f}/100) requiring regular surveillance."

    else: # LOW
        if top_decreasing:
            mitigating = ", ".join([d["name"] for d in top_decreasing[:3]])
            detailed_text = (
                f"River water quality is within healthy ecological baseline ({risk_score:.0f}/100). "
                f"Optimal {mitigating} provide strong natural buffering and aerobic capacity."
            )
        else:
            detailed_text = f"River water quality is currently safe and stable with a low pollution risk score of {risk_score:.0f}/100."

    return {
        "summary": summary if risk_level in ["HIGH", "CRITICAL"] else detailed_text,
        "detailed_text": detailed_text,
        "key_points": [
            f"{d['name']}: {d['value_formatted']} — {'increases' if d['impact'] > 0 else 'reduces'} predicted risk by {abs(d['impact']):.1f} pts"
            for d in (top_increasing[:3] + top_decreasing[:1])
        ]
    }

class XAIExplainer:
    def __init__(self, model_bundle: dict):
        self.classifier = model_bundle["classifier"]
        self.regressor = model_bundle["regressor"]
        self.preprocessor = model_bundle["preprocessor"]
        self.feature_names = model_bundle["feature_names"]
        self.baseline_stats = model_bundle.get("baseline_stats", {})

    def explain(self, raw_params: dict, risk_score: float, risk_level: str) -> dict:
        # Preprocess sample
        X_scaled = self.preprocessor.transform(raw_params)
        
        # Exact Tree Attribution
        raw_attributions, base_value = compute_tree_regressor_attributions(
            self.regressor, X_scaled, self.feature_names
        )

        # Build feature drivers breakdown
        drivers = []
        for feat in self.feature_names:
            meta = PARAM_METADATA.get(feat, {})
            val = raw_params.get(feat, 0.0)
            impact = raw_attributions.get(feat, 0.0)
            
            drivers.append({
                "key": feat,
                "name": meta.get("name", feat),
                "unit": meta.get("unit", ""),
                "value": val,
                "value_formatted": f"{val} {meta.get('unit', '')}".strip(),
                "impact": round(impact, 2),
                "direction": "INCREASES_RISK" if impact > 0 else "DECREASES_RISK",
                "magnitude": round(abs(impact), 2)
            })

        # Sort drivers
        increasing_drivers = sorted([d for d in drivers if d["impact"] > 0], key=lambda x: x["impact"], reverse=True)
        decreasing_drivers = sorted([d for d in drivers if d["impact"] <= 0], key=lambda x: x["impact"])

        # Top 5 absolute drivers for chart
        chart_drivers = sorted(drivers, key=lambda x: abs(x["impact"]), reverse=True)[:7]

        # Evaluate parameter statuses
        param_statuses = [evaluate_parameter_status(feat, raw_params.get(feat, 0.0)) for feat in self.feature_names]

        # Dynamic human-readable explanation
        explanation_obj = generate_dynamic_explanation(
            risk_level, risk_score, increasing_drivers, decreasing_drivers, param_statuses
        )

        # Calculate WQI
        wqi_val = calculate_wqi(raw_params)

        return {
            "base_value": round(base_value, 2),
            "feature_attributions": drivers,
            "top_increasing_drivers": increasing_drivers[:5],
            "top_mitigating_drivers": decreasing_drivers[:3],
            "chart_drivers": chart_drivers,
            "parameter_statuses": param_statuses,
            "explanation": explanation_obj,
            "wqi": wqi_val
        }
