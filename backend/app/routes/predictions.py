from fastapi import APIRouter, HTTPException
from app.services.data_service import data_service
from app.services.prediction_service import prediction_service
from app.schemas import PredictionResponse

router = APIRouter()

@router.get("/customers/{customer_id}/prediction", response_model=PredictionResponse)
def get_customer_prediction(customer_id: str):
    customer = data_service.get_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail=f"Customer ID '{customer_id}' not found")

    pred = prediction_service.predict_customer(customer)
    return {
        "customer_id": customer_id,
        "churn_probability": pred["churn_probability"],
        "risk_level": pred["risk_level"],
        "churn_prediction": pred["churn_prediction"]
    }
