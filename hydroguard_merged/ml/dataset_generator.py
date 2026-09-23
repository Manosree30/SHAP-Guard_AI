"""
HydroGuard-XAI - Synthetic River Water Quality Dataset Generator
Generates realistic, physically consistent river monitoring observations across multiple river basins.
Clearly labeled as DEMO/SAMPLE simulated environmental telemetry for prototype demonstration.
"""

import numpy as np
import pandas as pd
import os
from datetime import datetime, timedelta

def calculate_realistic_risk_score(ph, turbidity, do, temp, conductivity, tds, bod, cod, rainfall, water_flow):
    """
    Computes a grounded environmental pollution risk score (0-100) based on standard
    Water Quality Index (WQI) principles, CPCB & EPA guidelines.
    """
    # 1. pH penalty (optimal 7.0 - 7.8, safe 6.5 - 8.5)
    if ph < 6.5:
        ph_penalty = (6.5 - ph) * 22.0
    elif ph > 8.5:
        ph_penalty = (ph - 8.5) * 20.0
    else:
        ph_penalty = abs(ph - 7.2) * 3.0

    # 2. Dissolved Oxygen penalty (healthy > 6.5 mg/L, critical < 3.5 mg/L)
    if do < 6.5:
        do_penalty = (6.5 - do) * 14.0
    else:
        do_penalty = 0.0

    # 3. Turbidity penalty (safe < 5 NTU, severe > 50 NTU)
    turb_penalty = np.clip((turbidity - 5.0) * 0.55, 0, 30.0)

    # 4. BOD penalty (safe < 2.5 mg/L, severe > 10.0 mg/L)
    bod_penalty = np.clip((bod - 2.0) * 4.5, 0, 35.0)

    # 5. COD penalty (safe < 10 mg/L, severe > 40 mg/L)
    cod_penalty = np.clip((cod - 10.0) * 0.9, 0, 25.0)

    # 6. TDS & Conductivity penalties
    tds_penalty = np.clip((tds - 250.0) * 0.035, 0, 15.0)
    cond_penalty = np.clip((conductivity - 400.0) * 0.02, 0, 15.0)

    # 7. Temperature & Hydrology interactions
    temp_penalty = np.clip((temp - 27.0) * 1.5, 0, 10.0)

    # Hydrology dilution or stagnant stagnation effect
    # Low flow concentrates pollutants; heavy storm runoff flushes urban wash-off
    flow_factor = 1.0
    if water_flow < 40.0:
        flow_factor = 1.15  # stagnation increases risk concentration
    elif water_flow > 250.0 and rainfall > 40.0:
        flow_factor = 1.05  # storm runoff surges

    raw_score = (
        ph_penalty * 0.16 +
        do_penalty * 0.28 +
        bod_penalty * 0.22 +
        cod_penalty * 0.14 +
        turb_penalty * 0.10 +
        tds_penalty * 0.05 +
        cond_penalty * 0.05 +
        temp_penalty * 0.05
    ) * flow_factor

    # Normalize to 0 - 100 with smooth sigmoid/clip
    risk_score = float(np.clip(raw_score * 2.1, 0.0, 100.0))
    return round(risk_score, 1)

def classify_risk_score(score):
    if score <= 25.0:
        return "LOW"
    elif score <= 50.0:
        return "MODERATE"
    elif score <= 75.0:
        return "HIGH"
    else:
        return "CRITICAL"

def generate_sample_dataset(num_samples=2000, seed=42):
    np.random.seed(seed)
    
    locations = [
        "Cauvery River",
        "Bhavani River",
        "Noyyal River",
        "Vaigai River",
        "Tamaraibarani River",
        "Sample River"
    ]
    
    base_time = datetime.now() - timedelta(days=90)
    
    records = []
    
    # Generate balanced representative scenarios
    # 35% Clean Baseline, 25% Agricultural Runoff, 20% Urban Sewage/Hypoxic, 20% Industrial Effluent
    scenario_types = [
        "baseline_clean", 
        "agricultural_runoff", 
        "urban_sewage_hypoxia", 
        "industrial_effluent"
    ]
    scenario_probs = [0.35, 0.25, 0.20, 0.20]
    
    for i in range(num_samples):
        location = np.random.choice(locations)
        scenario = np.random.choice(scenario_types, p=scenario_probs)
        timestamp = base_time + timedelta(hours=i * (90 * 24 / num_samples) + np.random.uniform(0, 1.5))
        
        if scenario == "baseline_clean":
            ph = np.random.normal(7.3, 0.3)
            turbidity = np.random.exponential(3.0) + 1.2
            do = np.random.normal(7.6, 0.5)
            temp = np.random.normal(24.0, 2.0)
            conductivity = np.random.normal(260.0, 40.0)
            tds = np.random.normal(170.0, 30.0)
            bod = np.random.exponential(1.1) + 0.5
            cod = np.random.exponential(4.0) + 3.0
            rainfall = np.random.exponential(4.0)
            water_flow = np.random.normal(180.0, 35.0)

        elif scenario == "agricultural_runoff":
            # Higher turbidity, moderate BOD, elevated TDS and conductivity, triggered by moderate rainfall
            rainfall = np.random.uniform(25.0, 80.0)
            ph = np.random.normal(7.9, 0.4)
            turbidity = np.random.uniform(22.0, 65.0)
            do = np.random.normal(5.4, 0.7)
            temp = np.random.normal(26.5, 2.0)
            conductivity = np.random.normal(620.0, 90.0)
            tds = np.random.normal(480.0, 70.0)
            bod = np.random.uniform(3.8, 7.5)
            cod = np.random.uniform(18.0, 35.0)
            water_flow = np.random.normal(240.0, 50.0)

        elif scenario == "urban_sewage_hypoxia":
            # Very low DO, high BOD, high COD, elevated temp, lower flow
            rainfall = np.random.uniform(0.0, 15.0)
            ph = np.random.normal(6.7, 0.5)
            turbidity = np.random.uniform(35.0, 85.0)
            do = np.random.uniform(1.5, 4.2)
            temp = np.random.normal(29.0, 2.5)
            conductivity = np.random.normal(750.0, 110.0)
            tds = np.random.normal(590.0, 80.0)
            bod = np.random.uniform(7.5, 18.0)
            cod = np.random.uniform(30.0, 70.0)
            water_flow = np.random.uniform(20.0, 70.0)

        else: # industrial_effluent
            # Abnormal pH (acidic or high alkaline), high COD, high TDS and conductivity, elevated temp
            is_acidic = np.random.choice([True, False], p=[0.6, 0.4])
            ph = np.random.uniform(4.5, 6.1) if is_acidic else np.random.uniform(8.9, 10.5)
            turbidity = np.random.uniform(45.0, 110.0)
            do = np.random.uniform(2.0, 4.8)
            temp = np.random.uniform(28.0, 35.0)
            conductivity = np.random.uniform(850.0, 1600.0)
            tds = np.random.uniform(700.0, 1400.0)
            bod = np.random.uniform(6.0, 15.0)
            cod = np.random.uniform(45.0, 120.0)
            rainfall = np.random.uniform(0.0, 20.0)
            water_flow = np.random.uniform(30.0, 90.0)

        # Clip values to physically realistic ranges
        ph = float(np.clip(round(ph, 2), 3.0, 12.0))
        turbidity = float(np.clip(round(turbidity, 1), 0.5, 250.0))
        do = float(np.clip(round(do, 2), 0.2, 14.0))
        temp = float(np.clip(round(temp, 1), 10.0, 45.0))
        conductivity = float(np.clip(round(conductivity, 1), 20.0, 3000.0))
        tds = float(np.clip(round(tds, 1), 20.0, 2500.0))
        bod = float(np.clip(round(bod, 2), 0.1, 40.0))
        cod = float(np.clip(round(cod, 2), 1.0, 180.0))
        rainfall = float(np.clip(round(rainfall, 1), 0.0, 250.0))
        water_flow = float(np.clip(round(water_flow, 1), 5.0, 800.0))

        risk_score = calculate_realistic_risk_score(
            ph, turbidity, do, temp, conductivity, tds, bod, cod, rainfall, water_flow
        )
        risk_level = classify_risk_score(risk_score)

        records.append({
            "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "location": location,
            "scenario_type": scenario,
            "ph": ph,
            "turbidity": turbidity,
            "dissolved_oxygen": do,
            "temperature": temp,
            "conductivity": conductivity,
            "tds": tds,
            "bod": bod,
            "cod": cod,
            "rainfall": rainfall,
            "water_flow": water_flow,
            "risk_score": risk_score,
            "pollution_risk": risk_level
        })

    df = pd.DataFrame(records)
    # Sort chronologically
    df = df.sort_values(by=["location", "timestamp"]).reset_index(drop=True)
    return df

if __name__ == "__main__":
    output_path = os.path.join(os.path.dirname(__file__), "data", "river_water_quality_demo.csv")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df = generate_sample_dataset(2400)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} sample river observations saved to {output_path}")
    print("\nClass distribution:")
    print(df["pollution_risk"].value_counts(normalize=True))
    print("\nSummary Statistics:")
    print(df.describe().T[["mean", "min", "50%", "max"]])
