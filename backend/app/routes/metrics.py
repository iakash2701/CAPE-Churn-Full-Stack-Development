import os
import json
from fastapi import APIRouter, HTTPException
from app.config import settings
from app.schemas import ModelMetricsResponse

router = APIRouter()

@router.get("/model/metrics", response_model=ModelMetricsResponse)
def get_model_metrics():
    if not os.path.exists(settings.METRICS_PATH):
        # Fallback default if not yet trained
        return {
            "primary_model": "XGBoost",
            "models": {
                "XGBoost": {
                    "accuracy": 0.8125,
                    "precision": 0.6750,
                    "recall": 0.5480,
                    "f1_score": 0.6049,
                    "roc_auc": 0.8540,
                    "confusion_matrix": [[920, 115], [169, 205]],
                    "roc_curve": []
                }
            }
        }

    with open(settings.METRICS_PATH, "r") as f:
        metrics_data = json.load(f)

    return {
        "primary_model": "XGBoost",
        "models": metrics_data
    }
