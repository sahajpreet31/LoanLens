# LoanLens — AI-Powered Loan Risk Assessment Platform

An explainable AI platform that predicts loan default risk using XGBoost, with SHAP-based explainability and a real-time what-if simulator. Built for two audiences — **lenders** making credit decisions and **borrowers** checking their loan eligibility.

![Tech Stack](https://img.shields.io/badge/XGBoost-ML-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green) ![React](https://img.shields.io/badge/React-Frontend-61dafb) ![SHAP](https://img.shields.io/badge/SHAP-Explainable_AI-orange) ![Status](https://img.shields.io/badge/Status-Live-brightgreen)

## 🔗 Live Demo
- **App:** [loanlens.vercel.app](#)
- **API Docs:** [loanlens-api.onrender.com/docs](#)

---

## Why LoanLens

Most loan risk models are black boxes — they output a number with no explanation. LoanLens is built like real fintech credit tools (similar to what Zest AI, Upstart, and Indian NBFCs like Lendingkart use internally): it doesn't just predict risk, it explains *why*, and shows what would change the outcome.

**Two user modes:**
- 🏦 **Lender View** — technical risk scoring, SHAP impact charts, and risk factors to review before approving a loan
- 👤 **Borrower View** — plain-English eligibility check, what's helping/hurting your application, and concrete suggestions to improve your chances

---

## Features

- **ML Risk Scoring** — XGBoost model trained on 32K+ loan records (93% accuracy, 0.94 AUC-ROC)
- **Explainable AI (SHAP)** — every prediction comes with a breakdown of which factors drove the score, and by how much
- **What-if Simulator** — adjust income, loan amount, interest rate, and more with live sliders to see the risk score update in real time
- **Visual Risk Gauge** — speedometer-style gauge showing Low/Medium/High risk zones
- **Improvement Suggestions** — auto-generated, SHAP-driven advice on what to fix to lower risk
- **Demo Scenarios** — pre-built Low/Medium/High risk profiles to instantly explore the model's behavior
- **Input Validation** — real-time form validation with clear error messages
- **Dual-mode UI** — same model, two completely different presentations depending on the audience

---

## Tech Stack

| Layer | Tech |
|---|---|
| ML Model | XGBoost (vs. Logistic Regression & Random Forest, compared on AUC-ROC) |
| Explainability | SHAP (TreeExplainer) |
| Class Imbalance | SMOTE |
| Backend | FastAPI + Uvicorn |
| Frontend | React + Vite, Recharts for visualizations |
| Model Serving | joblib |
| Deployment | Render (API) + Vercel (Frontend) |

---

## Project Structure

```
loanlens/
├── model/
│   ├── train.py              # Full training pipeline: EDA, SMOTE, model comparison, SHAP
│   ├── loanlens_model.pkl    # Saved XGBoost model
│   └── loanlens_features.pkl # Feature list
├── backend/
│   ├── main.py               # FastAPI app — /predict and /explain endpoints
│   └── requirements.txt
├── frontend/
│   └── src/
│       └── App.jsx           # React UI — Lender/Borrower modes, gauge, charts, simulator
└── README.md
```

---

## Setup & Run Locally

### 1. Train the Model

```bash
# Dataset: Credit Risk Dataset (Kaggle, by laotse)
kaggle datasets download -d laotse/credit-risk-dataset --unzip
python model/train.py
# → generates loanlens_model.pkl and loanlens_features.pkl
```

### 2. Backend

```bash
cd backend
cp ../model/loanlens_model.pkl .
cp ../model/loanlens_features.pkl .
pip install -r requirements.txt
uvicorn main:app --reload
# API: http://localhost:8000  |  Docs: http://localhost:8000/docs
```

### 3. Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
# App: http://localhost:5173
```

---

## Model Performance

| Model | AUC-ROC | Avg Precision |
|---|---|---|
| Logistic Regression | 0.822 | 0.598 |
| Random Forest | 0.927 | 0.874 |
| **XGBoost (selected)** | **0.942** | **0.897** |

**Final model (XGBoost) on test set:**
- Accuracy: 93%
- Precision (Default class): 0.92
- Recall (Default class): 0.74
- F1 (Default class): 0.82

Class imbalance (~78% non-default, ~22% default) handled with SMOTE oversampling on the training set only.

---

## API Reference

### `POST /predict`
Returns risk level, default probability, and confidence.

### `POST /explain`
Returns everything `/predict` does, plus a SHAP breakdown of every feature's contribution to the prediction — used to power both the Lender's "Why?" chart and the Borrower's "What's Affecting Me?" view.

```bash
curl -X POST http://localhost:8000/explain \
  -H "Content-Type: application/json" \
  -d '{
    "person_age": 28, "person_income": 55000, "person_home_ownership": "RENT",
    "person_emp_length": 3, "loan_intent": "PERSONAL", "loan_grade": "B",
    "loan_amnt": 10000, "loan_int_rate": 11.5, "loan_percent_income": 0.18,
    "cb_person_default_on_file": "N", "cb_person_cred_hist_length": 4
  }'
```

Response:
```json
{
  "risk_level": "Low",
  "default_probability": 0.0705,
  "confidence": "High",
  "message": "This applicant is unlikely to default.",
  "shap_values": [
    { "feature": "int_rate_x_loan_grade", "label": "Rate × Grade", "shap_value": -1.472, "direction": "decreases_risk" }
  ],
  "base_probability": 0.02
}
```

---

## Deployment

**Backend (Render):**
- Root directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Frontend (Vercel):**
- Root directory: `frontend`
- Env var: `VITE_API_URL = <your-render-url>`

---

## Dataset & Limitations

Trained on the [Credit Risk Dataset](https://www.kaggle.com/datasets/laotse/credit-risk-dataset) by laotse on Kaggle (CC0 Public Domain, ~32K rows, USD-denominated). The model reflects US lending patterns and is calibrated for loan amounts up to ~$35,000 and incomes up to ~$200,000 — predictions outside this range should be treated as illustrative rather than production-accurate. Built for educational and portfolio purposes.

---

## What This Project Demonstrates

- End-to-end ML pipeline: EDA → preprocessing → class imbalance handling → model comparison → evaluation
- Model interpretability with SHAP, a core skill in production ML/fintech systems
- Full-stack deployment (FastAPI + React) with a real, usable product
- Product thinking — designing the same model for two different audiences with different needs
