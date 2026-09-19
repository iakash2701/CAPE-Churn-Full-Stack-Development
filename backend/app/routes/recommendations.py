from fastapi import APIRouter, HTTPException
from app.services.data_service import data_service
from app.services.prediction_service import prediction_service
from app.services.shap_service import shap_service
from app.services.recommendation_service import recommendation_service
from app.schemas import RecommendationResponse

router = APIRouter()

@router.get("/customers/{customer_id}/recommendation", response_model=RecommendationResponse)
def get_customer_recommendation(customer_id: str):
    customer = data_service.get_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail=f"Customer ID '{customer_id}' not found")

    pred = prediction_service.predict_customer(customer)
    prob = pred["churn_probability"]
    risk_level = pred["risk_level"]

    explanation = shap_service.explain_customer(customer, prob, risk_level)
    top_factors = explanation.get("positive_factors", [])

    recs = recommendation_service.generate_recommendations(customer, prob, risk_level, top_factors)
    return recs
