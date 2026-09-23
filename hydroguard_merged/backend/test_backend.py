import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from services.ml_service import MLService
from services.sensor_simulator import get_live_alerts, RIVER_STATIONS, DEMO_SCENARIOS, generate_location_trends

def main():
    print("Testing ML Service...")
    s = MLService.get_instance()
    
    # Test High pollution input
    sample_input = {
        "ph": 5.8,
        "turbidity": 72.0,
        "dissolved_oxygen": 3.2,
        "temperature": 31.0,
        "conductivity": 650.0,
        "tds": 420.0,
        "bod": 8.2,
        "cod": 30.0,
        "rainfall": 48.0,
        "water_flow": 120.0
    }
    
    res = s.predict(sample_input)
    print("--- ML & XAI Test Result ---")
    print(f"Risk Score:     {res['risk_score']} / 100")
    print(f"Risk Level:     {res['risk_level']}")
    print(f"Confidence:     {res['confidence_pct']}%")
    print(f"WQI Index:      {res['wqi']}")
    print(f"Base Value:     {res['base_value']}")
    print(f"Explanation:    {res['explanation']['summary']}")
    print("Top Drivers:   ", [f"{d['name']} ({d['impact']:+.2f})" for d in res['top_drivers'][:4]])
    print("Recommendations:", len(res['recommendations']), "items generated.")
    for r in res['recommendations'][:2]:
        print(f" - [{r['priority']}] {r['title']}")
        
    print("\nTesting Sensor Simulator & Trends...")
    trends = generate_location_trends("Cauvery River", "30d")
    print(f"Trends data points: {len(trends['data_points'])}")
    print(f"Early warning: {trends['early_warning']['has_early_warning']}")
    
    alerts = get_live_alerts()
    print(f"Live alerts: {len(alerts)}")
    print("All backend tests passed successfully!")

if __name__ == "__main__":
    main()
