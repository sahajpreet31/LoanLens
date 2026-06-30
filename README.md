LoanLens — AI-Powered Loan Risk Assessment Platform

Explainable AI platform that predicts loan default risk using XGBoost, with SHAP-based explainability and a real-time what-if simulator. Built for two audiences — lenders making credit decisions and borrowers checking their loan eligibility.

🔗 Live App: try-loanlens.vercel.app
🔗 API Docs: loanlens-api-cj4v.onrender.com/docs


Features


ML Risk Scoring — XGBoost model (93% accuracy, 0.94 AUC-ROC), benchmarked against Logistic Regression and Random Forest
Explainable AI (SHAP) — every prediction shows which factors drove the score, and by how much
What-if Simulator — adjust income, loan amount, interest rate etc. and watch the risk score update live
Dual-mode UI — Lender view (technical risk metrics + SHAP chart) and Borrower view (plain-English eligibility + improvement tips)
Visual Risk Gauge, demo scenarios, and an in-app "How was this model built?" section documenting model selection



Tech Stack

ML: XGBoost, Scikit-learn, SHAP, SMOTE, Pandas
Backend: FastAPI
Frontend: React + Vite, Recharts
Deployment: Render (API) + Vercel (Frontend)


Project Structure

loanlens/
├── model/        # Training pipeline: EDA, SMOTE, model comparison, SHAP
├── backend/      # FastAPI — /predict and /explain endpoints
└── frontend/     # React UI — Lender/Borrower modes, gauge, what-if simulator


Run Locally

bash# 1. Train model
python model/train.py

# 2. Backend
cd backend && pip install -r requirements.txt
uvicorn main:app --reload          # http://localhost:8000

# 3. Frontend
cd frontend && npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev                        # http://localhost:5173


Model Performance

ModelAUC-ROCLogistic Regression0.822Random Forest0.927XGBoost (selected)0.942

Class imbalance (~78% non-default / 22% default) handled with SMOTE on the training set.


Dataset

Credit Risk Dataset (Kaggle, ~32K rows, USD-denominated). Reflects US lending patterns; built for educational and portfolio purposes.
