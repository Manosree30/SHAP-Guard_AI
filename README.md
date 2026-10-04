# 🌊 SHAP Hydro (HydroGuard-XAI)

### Explainable AI-Based River Pollution Risk Prediction & Decision Support System

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)](https://www.typescriptlang.org/)
[![XAI](https://img.shields.io/badge/XAI-SHAP-orange.svg)](https://github.com/shap/shap)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Explainable AI for Early River Pollution Risk Prediction & Actionable Environmental Intelligence**

---

## 🌐 Live Demo

🚀 **[Open HydroGuard-XAI](https://shap-guard-ai.vercel.app/)**

⚙️ **[Backend API](https://shap-guard-ai.onrender.com/)**

### Deployment Architecture

```text
User
  ↓
Vercel
React + Vite
  ↓ REST API
Render
FastAPI Backend
  ↓
Machine Learning + XAI
  ↓
Pollution Risk Prediction
```

---

## 📌 Project Overview

**HydroGuard-XAI** is an AI-powered river pollution monitoring and decision-support platform.

The system:

* 🔮 Predicts pollution risk from **0–100%**
* 🚦 Classifies risk as **LOW / MODERATE / HIGH / CRITICAL**
* 🧠 Explains predictions using **Explainable AI**
* 📊 Visualizes pollution trends
* 🗺️ Displays river monitoring stations
* 🚨 Generates pollution alerts
* ⚡ Provides actionable recommendations
* 📡 Supports simulated IoT telemetry

---

## 🧪 Input Parameters

The model analyzes:

* pH
* Dissolved Oxygen (DO)
* BOD
* COD
* Turbidity
* Temperature
* TDS
* Electrical Conductivity
* Rainfall Intensity
* Water Flow Rate

---

## 🤖 Machine Learning

### Models

* **Random Forest Classifier** → Pollution risk category
* **Random Forest Regressor** → Continuous pollution risk score
* **SHAP / XAI** → Feature-level prediction explanations

### Benchmark Performance

> Evaluated on synthetic environmental benchmark data.

| Metric    |      Score |
| --------- | ---------: |
| Accuracy  | **94.58%** |
| Precision | **94.59%** |
| Recall    | **94.58%** |
| F1 Score  | **94.28%** |
| R² Score  | **0.9967** |

> ⚠️ These metrics are based on synthetic benchmark data. Real-world field validation is required before operational deployment.

---

## 🎯 Demo Scenarios

| Scenario                          | Risk        |
| --------------------------------- | ----------- |
| 🌱 Pristine / Safe Baseline       | 🟢 LOW      |
| 🌾 Agricultural Fertilizer Runoff | 🟡 MODERATE |
| 🏙️ Urban Sewage & Hypoxia        | 🟠 HIGH     |
| 🏭 Industrial Acid Discharge      | 🔴 CRITICAL |

---

## 🔐 Demo Login

```text
Email: admin@hydroguard.ai
Password: hydroguard123
```

---

## 📡 API Endpoints

| Method | Endpoint                 | Description                           |
| ------ | ------------------------ | ------------------------------------- |
| `POST` | `/api/predict`           | Pollution prediction and XAI analysis |
| `GET`  | `/api/stations`          | River monitoring stations             |
| `GET`  | `/api/trends/{location}` | Pollution trends                      |
| `GET`  | `/api/alerts`            | Active pollution alerts               |
| `GET`  | `/api/scenarios`         | Demo scenarios                        |
| `POST` | `/api/simulate-stream`   | Simulated telemetry                   |
| `GET`  | `/api/health`            | Backend health status                 |

---

## 📂 Project Structure

```text
SHAP-Guard_AI/
│
├── README.md
│
└── hydroguard_merged/
    │
    ├── backend/
    │   ├── api/
    │   ├── models/
    │   ├── services/
    │   └── xai/
    │
    ├── frontend/
    │   └── src/
    │
    ├── ml/
    ├── evaluation/
    ├── docs/
    └── requirements.txt
```

---

## ⚡ Run Locally

### Requirements

* Python 3.10+
* Node.js 18+
* npm

### Clone Repository

```bash
git clone https://github.com/Manosree30/SHAP-Guard_AI.git
```

### Enter Project

```bash
cd SHAP-Guard_AI/hydroguard_merged
```

### Start Application

```bash
python run_servers.py
```

### Local URLs

```text
Frontend: http://localhost:5173
Backend:  http://127.0.0.1:8000
Swagger:  http://127.0.0.1:8000/docs
Health:   http://127.0.0.1:8000/api/health
```

---

## ☁️ Deployment

| Component | Platform         |
| --------- | ---------------- |
| Frontend  | Vercel           |
| Backend   | Render           |
| ML / XAI  | FastAPI + Python |

### Production URLs

**Frontend:**
[https://shap-guard-ai.vercel.app/](https://shap-guard-ai.vercel.app/)

**Backend:**
[https://shap-guard-ai.onrender.com/](https://shap-guard-ai.onrender.com/)

---

## 🔄 System Workflow

```text
Water Quality Parameters
          ↓
    Data Processing
          ↓
   Random Forest Model
          ↓
   Pollution Risk Score
          ↓
Risk Classification
LOW / MODERATE / HIGH / CRITICAL
          ↓
      SHAP / XAI
          ↓
Identify Major Risk Drivers
          ↓
Actionable Recommendations
```

---

## 🚨 Key Features

### 🔮 Risk Prediction

Predicts a continuous pollution risk score between **0 and 100**.

### 🧠 Explainable AI

Shows which environmental parameters contribute to the prediction.

### 🗺️ River Monitoring

Displays monitoring stations and their current status.

### 📊 Trend Analysis

Provides pollution and telemetry trend visualization.

### 🚨 Alert System

Highlights potentially critical pollution conditions.

### 📡 IoT Simulation

Demonstrates continuous environmental telemetry processing using simulated data.

---

## ⚠️ Limitations

* Current benchmark evaluation uses synthetic environmental data.
* IoT telemetry is simulated rather than collected from physical sensors.
* Real-world field validation is required.
* Model performance may vary with real environmental conditions.
* The system is intended as a decision-support tool and should not replace professional environmental assessment.

---

## 🌱 Future Scope

* Real-time IoT sensor integration
* Real-world environmental datasets
* Satellite and remote-sensing integration
* Pollution source identification
* Advanced anomaly detection
* Mobile notifications
* Government/environmental monitoring integration
* Field validation with environmental agencies

---

## 🏆 Project Goal

HydroGuard-XAI goes beyond simply showing water-quality measurements.

It aims to answer three important questions:

> **What is the pollution risk?**

> **Why is the risk increasing?**

> **What action should be taken?**

```text
Monitor
   ↓
Predict
   ↓
Explain
   ↓
Alert
   ↓
Act
```

---

## 📄 License

This project is licensed under the **MIT License**.

See [LICENSE](LICENSE) for details.

---

## 👥 Project

**SHAP Hydro (HydroGuard-XAI)**

> **Explainable AI for Early River Pollution Risk Prediction & Actionable Environmental Intelligence**

🚀 **Live Demo:** [https://shap-guard-ai.vercel.app/](https://shap-guard-ai.vercel.app/)

💻 **GitHub:** [https://github.com/Manosree30/SHAP-Guard_AI/](https://github.com/Manosree30/SHAP-Guard_AI/)
