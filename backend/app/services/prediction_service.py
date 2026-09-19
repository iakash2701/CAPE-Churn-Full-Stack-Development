import os
import joblib
import pandas as pd
import numpy as np
from app.config import settings

class PredictionService:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.metadata = None
        self.load_artifacts()

    def load_artifacts(self):
        if os.path.exists(settings.MODEL_PATH) and os.path.exists(settings.PREPROCESSOR_PATH):
            self.model = joblib.load(settings.MODEL_PATH)
            self.preprocessor = joblib.load(settings.PREPROCESSOR_PATH)
            if os.path.exists(settings.METADATA_PATH):
                self.metadata = joblib.load(settings.METADATA_PATH)

    def get_risk_level(self, probability: float) -> str:
        if probability <= settings.LOW_RISK_MAX:
            return "Low Risk"
        elif probability <= settings.MEDIUM_RISK_MAX:
            return "Medium Risk"
        else:
            return "High Risk"

    def predict_customer(self, customer_dict: dict) -> dict:
        if not self.model or not self.preprocessor:
            self.load_artifacts()
            if not self.model or not self.preprocessor:
                # Fallback heuristic if models not trained yet
                tenure = float(customer_dict.get("tenure", 12))
                charges = float(customer_dict.get("MonthlyCharges", 70))
                prob = min(0.95, max(0.05, (charges / 120.0) * (1.0 - tenure / 72.0)))
                return {
                    "churn_probability": round(prob, 4),
                    "risk_level": self.get_risk_level(prob),
                    "churn_prediction": 1 if prob >= 0.5 else 0
                }

        # Prepare single row DataFrame
        df_row = pd.DataFrame([customer_dict])
        
        # Ensure drop cols ignored
        for col in ["customerID", "Churn"]:
            if col in df_row.columns:
                df_row = df_row.drop(columns=[col])

        # Preprocess
        X_trans = self.preprocessor.transform(df_row)
        
        # Predict probability of Churn (class 1)
        prob = float(self.model.predict_proba(X_trans)[0, 1])
        prediction = int(self.model.predict(X_trans)[0])
        
        return {
            "churn_probability": round(prob, 4),
            "risk_level": self.get_risk_level(prob),
            "churn_prediction": prediction
        }

prediction_service = PredictionService()
