from fastapi import APIRouter, HTTPException
from app.services.data_service import data_service
from app.services.prediction_service import prediction_service
from app.services.shap_service import shap_service
from app.schemas import ExplanationResponse

router = APIRouter()

@router.get("/customers/{customer_id}/explanation", response_model=ExplanationResponse)
def get_customer_explanation(customer_id: str):
    customer = data_service.get_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail=f"Customer ID '{customer_id}' not found")

    pred = prediction_service.predict_customer(customer)
    prob = pred["churn_probability"]
    risk_level = pred["risk_level"]

    explanation = shap_service.explain_customer(customer, prob, risk_level)
    return explanation

@router.get("/xai/global")
def get_global_explanation():
    global_importance = shap_service.get_global_importance()
    return {
        "global_importance": global_importance,
        "description": "Global feature importance calculated via mean absolute SHAP values across XGBoost model trees."
    }
