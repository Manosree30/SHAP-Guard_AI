# SHAP Hydro (HydroGuard-XAI)
### Explainable AI-Based River Pollution Risk Prediction & Decision Support System

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![SHAP](https://img.shields.io/badge/XAI-Tree_SHAP-orange.svg)](https://github.com/shap/shap)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **"Explainable AI for Early River Pollution Risk Prediction & Actionable Environmental Intelligence"**

---

## 📌 1. Project Overview

Conventional water quality monitoring relies on periodic grab sampling and multi-day laboratory turnaround times. By the time contamination is confirmed, toxic effluent and hypoxic water plumes have already dispersed downstream—threatening municipal drinking water intakes, degrading ecosystems, and causing catastrophic fish mortality.

**SHAP Hydro (HydroGuard-XAI)** is an end-to-end Explainable AI (XAI) environmental intelligence platform that:
1. **Predicts**: Quantifies continuous river pollution risk ($0 - 100\%$) and classifies severity into **LOW**, **MODERATE**, **HIGH**, or **CRITICAL**.
2. **Explains**: Utilizes **Exact Tree SHAP (SHapley Additive exPlanations)** to attribute precise positive and negative risk contributions to every telemetry parameter, generating transparent visual explanations and dynamic natural-language ecological summaries.
3. **Acts**: Translates primary pollution drivers into prioritized, context-aware **operational recommendations** (e.g., municipal intake buffering, rapid field sampling, industrial outfall audits, mobile aeration).

---

## ⚡ 2. Quick Start Guide

### Prerequisites
- **Python 3.10+** (Python 3.13 supported)
- **Node.js v18+** and **npm**

### Step 1: Navigate to Project
```bash
cd hydroguard_merged
```

### Step 2: Launch Both Servers (One-Click)
```bash
python run_servers.py
```

### Step 3: Access the Platform
- 🌐 **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- ⚙️ **Backend API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- 📖 **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- 🩺 **Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## 📂 3. Repository Structure

```
Hydroguard-XAI-merged_2/
├── README.md                      # Root documentation
└── hydroguard_merged/             # Main application package
    ├── run_servers.py             # Simultaneous FastAPI + Vite launcher
    ├── requirements.txt           # Python dependencies
    ├── Dockerfile & docker-compose# Containerization specs
    ├── backend/                   # FastAPI Backend
    │   ├── main.py                # Server entrypoint & route registration
    │   ├── verify_all.py          # Automated comprehensive test suite
    │   ├── api/                   # REST API routes
    │   ├── models/                # Pydantic schemas & ML serialized models
    │   ├── services/              # ML inference, station stores & simulators
    │   └── xai/                   # Tree SHAP & NLP explanation engine
    ├── frontend/                  # React 18 + TypeScript + Vite UI
    │   ├── src/
    │   │   ├── components/        # UI Cards, Charts, Gauges, Station Maps
    │   │   ├── services/          # API client
    │   │   └── types/             # TypeScript domain definitions
    │   ├── tailwind.config.js     # Cyber/scientific dark telemetry theme
    │   └── package.json           # Node dependencies
    ├── ml/                        # ML training pipeline & synthetic generator
    └── docs/                      # Scientific documentation & architectural diagrams
```

---

## 🔬 4. Telemetry Input Parameters & Safe Baselines

| Parameter | Unit | Safe Range | Ecological Significance |
| :--- | :--- | :--- | :--- |
| **pH Level** | — | `6.5 – 8.5` | Chemical equilibrium; $<6.0$ or $>8.5$ signals industrial effluent or acid shock. |
| **Turbidity** | `NTU` | `0.0 – 10.0` | Suspended particulates blocking sunlight and carrying adsorbed contaminants. |
| **Dissolved Oxygen (DO)** | `mg/L` | `> 6.0` | Respiration baseline; critical levels ($<3.5$ mg/L) indicate acute hypoxia. |
| **Water Temperature** | `°C` | `18.0 – 28.0` | Thermal pollution; elevated temps accelerate microbial oxygen consumption. |
| **Electrical Conductivity** | `µS/cm` | `100 – 500` | Dissolved ionic minerals; surges indicate fertilizer runoff or chemical ingress. |
| **Total Dissolved Solids (TDS)**| `mg/L` | `50 – 300` | Total mineral and dissolved solid burden. |
| **BOD (Biochemical Oxygen Demand)**| `mg/L` | `< 3.0` | Organic loading from domestic sewage or food-processing wastewater. |
| **COD (Chemical Oxygen Demand)**| `mg/L` | `< 15.0` | Non-biodegradable refractory chemical contamination. |
| **Rainfall Intensity** | `mm` | `0.0 – 50.0` | Non-point source overland surface runoff driver. |
| **Water Flow Rate** | `m³/s` | `50 – 400` | Natural dilution capacity; stagnant low flow concentrates localized toxins. |

---

## 🧠 5. Machine Learning & Explainable AI (Tree SHAP)

### Dual Random Forest Architecture
- **Classifier**: Random Forest Classifier for discrete severity categories (**LOW**, **MODERATE**, **HIGH**, **CRITICAL**).
- **Regressor**: Random Forest Regressor for continuous risk index ($0 - 100$).
- **Benchmark Performance**:
  - **Accuracy**: `94.58%`
  - **Precision / Recall / F1**: `94.59% / 94.58% / 94.28%`
  - **Regression MAE / RMSE**: `1.00 / 1.68` points
  - **$R^2$ Score**: `0.9967`

### Exact Tree SHAP Formulation
For any input vector $x$, local feature attribution $\Delta_j$ for each tree node split is calculated across all decision trees:
$$\hat{y}(x) = \text{base\_value} + \sum_{j=1}^{M} \Delta_j$$
- $\Delta_j > 0$: Feature $j$ **increased** the predicted pollution risk.
- $\Delta_j \le 0$: Feature $j$ **mitigated** or buffered the predicted risk.

---

## 📡 6. API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/predict` | Executes ML inference, Tree SHAP attributions, and action synthesis |
| `GET` | `/api/stations` | Returns active river monitoring stations with coordinates and current status |
| `GET` | `/api/trends/{location}` | Returns 7d, 30d, and 90d telemetry history and surge anomaly timelines |
| `GET` | `/api/alerts` | Returns active high-priority pollution alerts |
| `GET` | `/api/scenarios` | Returns 4 preset evaluation scenarios (Pristine, Agri, Sewage, Industrial) |
| `POST` | `/api/simulate-stream` | Ingests simulated real-time IoT edge telemetry packets |
| `GET` | `/api/health` | Service health status and loaded model evaluation metrics |

---

## 🧪 7. Automated Test Suite

To run the complete verification suite verifying all 4 demo scenarios, geolocation stations, trends, and alert engines:

```bash
cd hydroguard_merged/backend
python verify_all.py
```

---

## 📄 License
This project is licensed under the MIT License.
