import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure app package is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import settings
from app.routes import dashboard, customers, predictions, explanations, recommendations, metrics

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Explainable Customer Churn Prediction and Retention Intelligence Platform API"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/health")
def health_check():
    models_ready = os.path.exists(settings.MODEL_PATH) and os.path.exists(settings.PREPROCESSOR_PATH)
    data_ready = os.path.exists(settings.DATA_PATH) or os.path.exists(settings.RAW_DATA_PATH)
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "models_loaded": models_ready,
        "data_loaded": data_ready
    }

# Include routers with API prefix
app.include_router(dashboard.router, prefix=settings.API_PREFIX, tags=["Dashboard"])
app.include_router(customers.router, prefix=settings.API_PREFIX, tags=["Customers"])
app.include_router(predictions.router, prefix=settings.API_PREFIX, tags=["Predictions"])
app.include_router(explanations.router, prefix=settings.API_PREFIX, tags=["Explanations"])
app.include_router(recommendations.router, prefix=settings.API_PREFIX, tags=["Recommendations"])
app.include_router(metrics.router, prefix=settings.API_PREFIX, tags=["Model Metrics"])

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
