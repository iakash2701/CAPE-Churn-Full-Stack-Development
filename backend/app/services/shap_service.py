import os
import json
import joblib
import shap
import pandas as pd
import numpy as np
from app.config import settings

class ShapService:
    def __init__(self):
        self.explainer = None
        self.preprocessor = None
        self.metadata = None
        self.global_shap = None
        self.load_artifacts()

    def load_artifacts(self):
        if os.path.exists(settings.MODEL_PATH) and os.path.exists(settings.PREPROCESSOR_PATH):
            model = joblib.load(settings.MODEL_PATH)
            self.preprocessor = joblib.load(settings.PREPROCESSOR_PATH)
            self.explainer = shap.TreeExplainer(model)
            if os.path.exists(settings.METADATA_PATH):
                self.metadata = joblib.load(settings.METADATA_PATH)
        if os.path.exists(settings.GLOBAL_SHAP_PATH):
            with open(settings.GLOBAL_SHAP_PATH, "r") as f:
                self.global_shap = json.load(f)

    def _get_friendly_feature_name(self, raw_feature: str, row_dict: dict) -> str:
        """Translates raw encoded feature names like Contract_One year to clean human-readable text."""
        if raw_feature == "tenure":
            t = row_dict.get("tenure", 0)
            return f"Tenure ({t} months)"
        elif raw_feature == "MonthlyCharges":
            mc = row_dict.get("MonthlyCharges", 0)
            return f"Monthly Charges (${mc:.2f})"
        elif raw_feature == "TotalCharges":
            tc = row_dict.get("TotalCharges", 0)
            return f"Total Charges (${tc:.2f})"
        
        # Categorical encoded features
        if "_" in raw_feature:
            cat_name, cat_val = raw_feature.split("_", 1)
            actual_val = str(row_dict.get(cat_name, "")).strip()
            return f"{cat_name}: {actual_val}"
            
        return raw_feature

    def _generate_factor_description(self, raw_feature: str, shap_val: float, row_dict: dict) -> str:
        is_pos = shap_val > 0
        if raw_feature == "tenure":
            val = row_dict.get("tenure", 0)
            if is_pos:
                return f"Low tenure of {val} months increases risk of early departure."
            else:
                return f"Long-term tenure of {val} months builds loyalty and lowers churn risk."
        elif raw_feature == "MonthlyCharges":
            val = row_dict.get("MonthlyCharges", 0)
            if is_pos:
                return f"High monthly charge of ${val:.2f} creates price sensitivity."
            else:
                return f"Competitive monthly charge of ${val:.2f} encourages plan retention."
        elif "Contract" in raw_feature:
            val = row_dict.get("Contract", "Month-to-month")
            if "Month-to-month" in val:
                return "Month-to-month contract provides no long-term lock-in."
            else:
                return f"Longer contract term ({val}) provides stability."
        elif "TechSupport" in raw_feature:
            val = row_dict.get("TechSupport", "No")
            if val == "No":
                return "Lack of technical support creates vulnerability during issues."
            else:
                return "Active technical support improves customer satisfaction."
        elif "InternetService" in raw_feature:
            val = row_dict.get("InternetService", "Fiber optic")
            if "Fiber" in val and is_pos:
                return "Fiber optic plan without bundled security/support elevates risk."
            return f"Internet service type ({val}) influence on subscription."
        elif "OnlineSecurity" in raw_feature:
            val = row_dict.get("OnlineSecurity", "No")
            if val == "No":
                return "No online security add-on increases risk of cancellation."
            return "Active security protection increases service dependence."
        elif "PaymentMethod" in raw_feature:
            val = row_dict.get("PaymentMethod", "Electronic check")
            if "Electronic check" in val and is_pos:
                return "Manual payment via Electronic Check is associated with higher turnover."
            return f"Payment method ({val}) reliability."
            
        return f"{'Increases' if is_pos else 'Reduces'} churn risk according to XGBoost model."

    def explain_customer(self, customer_dict: dict, prob: float, risk_level: str) -> dict:
        if not self.explainer or not self.preprocessor or not self.metadata:
            self.load_artifacts()

        if not self.explainer or not self.preprocessor or not self.metadata:
            # Simple fallback if artifacts missing
            return {
                "customer_id": customer_dict.get("customerID", "Unknown"),
                "churn_probability": prob,
                "risk_level": risk_level,
                "base_value": 0.26,
                "positive_factors": [],
                "negative_factors": [],
                "top_factors": [],
                "research_disclaimer": "SHAP feature importances represent local model attribution, not proven real-world causal drivers."
            }

        df_row = pd.DataFrame([customer_dict])
        for col in ["customerID", "Churn"]:
            if col in df_row.columns:
                df_row = df_row.drop(columns=[col])

        X_trans = self.preprocessor.transform(df_row)
        raw_shap_values = self.explainer.shap_values(X_trans)[0]
        
        feature_names = self.metadata["all_feature_names"]
        
        try:
            base_val = float(self.explainer.expected_value)
        except Exception:
            base_val = float(self.explainer.expected_value[0])

        factors = []
        for feat_name, sv in zip(feature_names, raw_shap_values):
            abs_val = abs(float(sv))
            if abs_val < 0.001:
                continue
            
            contrib = "positive" if sv > 0 else "negative"
            friendly_name = self._get_friendly_feature_name(feat_name, customer_dict)
            desc = self._generate_factor_description(feat_name, sv, customer_dict)
            
            factors.append({
                "feature": friendly_name,
                "feature_value": str(customer_dict.get(feat_name.split("_")[0], "")),
                "shap_value": float(round(sv, 4)),
                "contribution_type": contrib,
                "impact_magnitude": float(round(abs_val, 4)),
                "description": desc
            })

        # Sort factors by impact magnitude
        factors.sort(key=lambda x: x["impact_magnitude"], reverse=True)

        positive_factors = [f for f in factors if f["contribution_type"] == "positive"][:5]
        negative_factors = [f for f in factors if f["contribution_type"] == "negative"][:5]
        top_factors = factors[:8]

        return {
            "customer_id": str(customer_dict.get("customerID", "Unknown")),
            "churn_probability": prob,
            "risk_level": risk_level,
            "base_value": round(base_val, 4),
            "positive_factors": positive_factors,
            "negative_factors": negative_factors,
            "top_factors": top_factors,
            "research_disclaimer": "SHAP feature attributions explain the XGBoost model's risk score for this customer. They do NOT guarantee causal real-world intervention effects."
        }

    def get_global_importance(self) -> list:
        if not self.global_shap:
            self.load_artifacts()
        if self.global_shap:
            return self.global_shap.get("global_importance", [])
        return []

shap_service = ShapService()
