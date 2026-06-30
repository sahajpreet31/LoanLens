from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np
import shap
import os

app = FastAPI(title="LoanLens API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model on startup
MODEL_PATH = os.path.join(os.path.dirname(__file__), "loanlens_model.pkl")
FEATURES_PATH = os.path.join(os.path.dirname(__file__), "loanlens_features.pkl")

model = joblib.load(MODEL_PATH)
features = joblib.load(FEATURES_PATH)

# Initialize SHAP explainer once at startup (fast for XGBoost)
explainer = shap.TreeExplainer(model)

# Encodings (must match training)
HOME_OWNERSHIP_MAP = {"MORTGAGE": 0, "OTHER": 1, "OWN": 2, "RENT": 3}
LOAN_INTENT_MAP = {
    "DEBTCONSOLIDATION": 0, "EDUCATION": 1, "HOMEIMPROVEMENT": 2,
    "MEDICAL": 3, "PERSONAL": 4, "VENTURE": 5
}
LOAN_GRADE_MAP = {"A": 0, "B": 1, "C": 2, "D": 3, "E": 4, "F": 5, "G": 6}
DEFAULT_ON_FILE_MAP = {"N": 0, "Y": 1}

FEATURE_LABELS = {
    "person_age": "Age",
    "person_income": "Annual Income",
    "person_home_ownership": "Home Ownership",
    "person_emp_length": "Employment Length",
    "loan_intent": "Loan Intent",
    "loan_grade": "Loan Grade",
    "loan_amnt": "Loan Amount",
    "loan_int_rate": "Interest Rate",
    "loan_percent_income": "Loan % of Income",
    "cb_person_default_on_file": "Previous Default",
    "cb_person_cred_hist_length": "Credit History Length",
    "loan_to_income_ratio": "Loan-to-Income Ratio",
    "int_rate_x_loan_grade": "Rate × Grade"
}


class LoanRequest(BaseModel):
    person_age: int = Field(..., ge=18, le=100, example=28)
    person_income: float = Field(..., gt=0, example=55000)
    person_home_ownership: str = Field(..., example="RENT")
    person_emp_length: float = Field(..., ge=0, le=60, example=3)
    loan_intent: str = Field(..., example="PERSONAL")
    loan_grade: str = Field(..., example="B")
    loan_amnt: float = Field(..., gt=0, example=10000)
    loan_int_rate: float = Field(..., gt=0, example=11.5)
    loan_percent_income: float = Field(..., gt=0, le=1, example=0.18)
    cb_person_default_on_file: str = Field(..., example="N")
    cb_person_cred_hist_length: int = Field(..., ge=0, example=4)


class LoanResponse(BaseModel):
    risk_level: str
    default_probability: float
    confidence: str
    message: str


class ExplainResponse(BaseModel):
    risk_level: str
    default_probability: float
    confidence: str
    message: str
    shap_values: list[dict]  # [{feature, label, shap_value, direction}]
    base_probability: float


def build_input(request: LoanRequest):
    home_ownership = HOME_OWNERSHIP_MAP.get(request.person_home_ownership.upper())
    loan_intent = LOAN_INTENT_MAP.get(request.loan_intent.upper().replace(" ", ""))
    loan_grade = LOAN_GRADE_MAP.get(request.loan_grade.upper())
    default_on_file = DEFAULT_ON_FILE_MAP.get(request.cb_person_default_on_file.upper())

    if any(v is None for v in [home_ownership, loan_intent, loan_grade, default_on_file]):
        raise HTTPException(status_code=400, detail="Invalid categorical value provided.")

    loan_to_income_ratio = request.loan_amnt / (request.person_income + 1)
    int_rate_x_loan_grade = request.loan_int_rate * loan_grade

    input_data = np.array([[
        request.person_age,
        request.person_income,
        home_ownership,
        request.person_emp_length,
        loan_intent,
        loan_grade,
        request.loan_amnt,
        request.loan_int_rate,
        request.loan_percent_income,
        default_on_file,
        request.cb_person_cred_hist_length,
        loan_to_income_ratio,
        int_rate_x_loan_grade
    ]])

    return input_data


def get_risk_label(prob: float) -> tuple[str, str]:
    if prob < 0.3:
        return "Low", "This applicant is unlikely to default."
    elif prob < 0.6:
        return "Medium", "This applicant carries moderate default risk. Review carefully."
    else:
        return "High", "This applicant has a high likelihood of default. Loan not recommended."


def get_confidence(prob: float) -> str:
    return (
        "High" if prob < 0.2 or prob > 0.8
        else "Medium" if prob < 0.35 or prob > 0.65
        else "Low"
    )


@app.get("/")
def root():
    return {"message": "LoanLens API is running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/predict", response_model=LoanResponse)
def predict(request: LoanRequest):
    try:
        input_data = build_input(request)
        prob = float(model.predict_proba(input_data)[0][1])
        risk_level, message = get_risk_label(prob)
        return LoanResponse(
            risk_level=risk_level,
            default_probability=round(prob, 4),
            confidence=get_confidence(prob),
            message=message
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/explain", response_model=ExplainResponse)
def explain(request: LoanRequest):
    try:
        input_data = build_input(request)

        # Prediction
        prob = float(model.predict_proba(input_data)[0][1])
        risk_level, message = get_risk_label(prob)

        # SHAP values
        shap_vals = explainer.shap_values(input_data)[0]
        base_prob = float(explainer.expected_value)

        # Build sorted SHAP output
        shap_list = []
        for i, feat in enumerate(features):
            val = float(shap_vals[i])
            shap_list.append({
                "feature": feat,
                "label": FEATURE_LABELS.get(feat, feat),
                "shap_value": round(val, 4),
                "direction": "increases_risk" if val > 0 else "decreases_risk"
            })

        # Sort by absolute impact
        shap_list.sort(key=lambda x: abs(x["shap_value"]), reverse=True)

        return ExplainResponse(
            risk_level=risk_level,
            default_probability=round(prob, 4),
            confidence=get_confidence(prob),
            message=message,
            shap_values=shap_list,
            base_probability=round(base_prob, 4)
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))