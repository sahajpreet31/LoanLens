LoanLens

An AI-powered loan risk assessment platform. Predicts loan default risk using XGBoost, explains every prediction with SHAP, and lets users simulate "what-if" scenarios in real time. Built for both lenders (risk scoring) and borrowers (eligibility check).

Live App: https://try-loanlens.vercel.app/
API Docs: https://loanlens-api-cj4v.onrender.com/docs

Features


Risk prediction using XGBoost (93% accuracy, 0.94 AUC-ROC)
SHAP explainability — shows why each prediction was made
What-if simulator — adjust inputs and see risk update live
Two views: Lender (technical) and Borrower (plain-English)
Demo profiles to try the model instantly


Tech Stack

XGBoost, Scikit-learn, SHAP, SMOTE, FastAPI, React, Vite

Project Structure

loanlens/
├── model/      # Training pipeline
├── backend/    # FastAPI app
└── frontend/   # React app

Run Locally

bash# Train the model
python model/train.py

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev

Model Comparison

ModelAUC-ROCLogistic Regression0.822Random Forest0.927XGBoost (selected)0.942

Dataset

Credit Risk Dataset from Kaggle (~32K rows, USD).
