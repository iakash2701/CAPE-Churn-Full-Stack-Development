from fastapi import APIRouter
import os
import json
import pandas as pd
from app.services.data_service import data_service
from app.services.prediction_service import prediction_service
from app.services.shap_service import shap_service
from app.schemas import DashboardStats
from app.config import settings

router = APIRouter()

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats():
    df = data_service.get_all_customers()
    if df.empty:
        return {
            "total_customers": 0,
            "churned_customers": 0,
            "churn_rate": 0.0,
            "high_risk_customers": 0,
            "avg_monthly_charges": 0.0,
            "contract_distribution": {},
            "tenure_distribution": [],
            "risk_distribution": {"Low Risk": 0, "Medium Risk": 0, "High Risk": 0},
            "top_global_factors": []
        }

    total = len(df)
    churned = int(df["Churn"].sum()) if "Churn" in df.columns else 0
    churn_rate = float(round((churned / total) * 100, 2)) if total > 0 else 0.0
    avg_charges = float(round(df["MonthlyCharges"].mean(), 2)) if "MonthlyCharges" in df.columns else 0.0

    # Calculate predicted risk levels across dataset
    risk_counts = {"Low Risk": 0, "Medium Risk": 0, "High Risk": 0}
    high_risk_count = 0

    # Sample for performance if dataframe is large
    sample_df = df.sample(n=min(1000, total), random_state=42)
    for _, row in sample_df.iterrows():
        pred = prediction_service.predict_customer(row.to_dict())
        rl = pred["risk_level"]
        risk_counts[rl] = risk_counts.get(rl, 0) + 1
        if rl == "High Risk":
            high_risk_count += 1

    # Scale high risk count estimate to total population
    if len(sample_df) > 0:
        high_risk_estimate = int((high_risk_count / len(sample_df)) * total)
        for k in risk_counts:
            risk_counts[k] = int((risk_counts[k] / len(sample_df)) * total)
    else:
        high_risk_estimate = 0

    # Contract distribution vs Churn
    contract_dist = {}
    if "Contract" in df.columns and "Churn" in df.columns:
        for c in df["Contract"].unique():
            sub = df[df["Contract"] == c]
            c_total = len(sub)
            c_churn = int(sub["Churn"].sum())
            contract_dist[str(c)] = {"total": c_total, "churned": c_churn}

    # Tenure distribution bins vs Churn
    tenure_bins = [
        {"bin": "0-12 Mos", "min": 0, "max": 12},
        {"bin": "13-24 Mos", "min": 13, "max": 24},
        {"bin": "25-36 Mos", "min": 25, "max": 36},
        {"bin": "37-48 Mos", "min": 37, "max": 48},
        {"bin": "49-60 Mos", "min": 49, "max": 60},
        {"bin": "61+ Mos", "min": 61, "max": 100}
    ]
    tenure_dist = []
    if "tenure" in df.columns and "Churn" in df.columns:
        for b in tenure_bins:
            sub = df[(df["tenure"] >= b["min"]) & (df["tenure"] <= b["max"])]
            t_total = len(sub)
            t_churn = int(sub["Churn"].sum())
            tenure_dist.append({
                "range": b["bin"],
                "total": t_total,
                "churned": t_churn,
                "churn_rate": round((t_churn / t_total * 100), 1) if t_total > 0 else 0
            })

    top_global = shap_service.get_global_importance()[:8]

    return {
        "total_customers": total,
        "churned_customers": churned,
        "churn_rate": churn_rate,
        "high_risk_customers": high_risk_estimate,
        "avg_monthly_charges": avg_charges,
        "contract_distribution": contract_dist,
        "tenure_distribution": tenure_dist,
        "risk_distribution": risk_counts,
        "top_global_factors": top_global
    }
