import os
from dataclasses import dataclass, field

@dataclass
class Settings:
    PROJECT_NAME: str = "CAPE-Churn API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    CORS_ORIGINS: list[str] = field(default_factory=lambda: ["http://localhost:3000", "http://127.0.0.1:3000", "*"])
    
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_PATH: str = os.path.join(BASE_DIR, "data", "processed_telco.csv")
    RAW_DATA_PATH: str = os.path.join(BASE_DIR, "data", "telco_churn.csv")
    MODEL_PATH: str = os.path.join(BASE_DIR, "models", "xgboost_model.joblib")
    PREPROCESSOR_PATH: str = os.path.join(BASE_DIR, "models", "preprocessor.joblib")
    METADATA_PATH: str = os.path.join(BASE_DIR, "models", "metadata.joblib")
    METRICS_PATH: str = os.path.join(BASE_DIR, "models", "metrics.json")
    GLOBAL_SHAP_PATH: str = os.path.join(BASE_DIR, "models", "global_shap.json")
    
    LOW_RISK_MAX: float = 0.30
    MEDIUM_RISK_MAX: float = 0.70

settings = Settings()
