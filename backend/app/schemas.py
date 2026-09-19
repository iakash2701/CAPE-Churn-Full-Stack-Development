from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DashboardStats(BaseModel):
    total_customers: int
    churned_customers: int
    churn_rate: float
    high_risk_customers: int
    avg_monthly_charges: float
    contract_distribution: Dict[str, Dict[str, int]]
    tenure_distribution: List[Dict[str, Any]]
    risk_distribution: Dict[str, int]
    top_global_factors: List[Dict[str, Any]]

class CustomerItem(BaseModel):
    customer_id: str
    gender: str
    senior_citizen: int
    partner: str
    dependents: str
    tenure: int
    phone_service: str
    multiple_lines: str
    internet_service: str
    online_security: str
    online_backup: str
    device_protection: str
    tech_support: str
    streaming_tv: str
    streaming_movies: str
    contract: str
    paperless_billing: str
    payment_method: str
    monthly_charges: float
    total_charges: float
    actual_churn: int
    predicted_probability: float
    risk_level: str

class CustomerListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    customers: List[CustomerItem]

class PredictionResponse(BaseModel):
    customer_id: str
    churn_probability: float
    risk_level: str
    churn_prediction: int

class ShapFactor(BaseModel):
    feature: str
    feature_value: Any
    shap_value: float
    contribution_type: str  # "positive" (increases churn risk) or "negative" (reduces churn risk)
    impact_magnitude: float
    description: str

class ExplanationResponse(BaseModel):
    customer_id: str
    churn_probability: float
    risk_level: str
    base_value: float
    positive_factors: List[ShapFactor]
    negative_factors: List[ShapFactor]
    top_factors: List[ShapFactor]
    research_disclaimer: str

class RecommendationItem(BaseModel):
    category: str
    title: str
    action: str
    reason: str
    priority: str  # "High", "Medium", "Low"
    associated_feature: str

class RecommendationResponse(BaseModel):
    customer_id: str
    risk_level: str
    churn_probability: float
    recommendations: List[RecommendationItem]
    disclaimer: str

class ModelMetricItem(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    confusion_matrix: List[List[int]]
    roc_curve: List[Dict[str, float]]

class ModelMetricsResponse(BaseModel):
    primary_model: str
    models: Dict[str, ModelMetricItem]
