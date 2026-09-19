# CAPE-Churn Deployment Guide

This guide details the deployment process for the **CAPE-Churn** full-stack platform:
- **FastAPI Backend**: Python 3.11 environment (Render, Railway, Koyeb, or Fly.io)
- **Next.js Frontend**: Vercel

---

## 🐍 1. Backend Deployment (Render / Railway / Koyeb)

### Render / Railway Configuration
1. Connect your GitHub repository `iakash2701/CAPE-Churn-Full-Stack-Development`.
2. Select **Web Service**.
3. Set **Root Directory**: `backend`
4. Set **Environment**: `Python 3`
5. Set **Build Command**:
   ```bash
   pip install -r requirements.txt && python train.py
   ```
6. Set **Start Command**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### Environment Variables
Configure the following in your hosting provider settings:
```env
PORT=8000
CORS_ORIGINS=http://localhost:3000,https://*.vercel.app
MODEL_PATH=models/xgboost_model.joblib
PREPROCESSOR_PATH=models/preprocessor.joblib
DATA_PATH=data/processed_telco.csv
```

### Verification
Once deployed, verify backend health:
- `https://<YOUR_BACKEND_URL>/health` -> `{"status": "healthy"}`
- `https://<YOUR_BACKEND_URL>/docs` -> OpenAPI Documentation

---

## ⚡ 2. Frontend Deployment (Vercel)

### Vercel Project Setup
1. Import repository `iakash2701/CAPE-Churn-Full-Stack-Development` in [Vercel Dashboard](https://vercel.com/new).
2. Configure **Framework Preset**: `Next.js`
3. Configure **Root Directory**: `frontend`
4. Expand **Environment Variables** and add:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://<YOUR_FASTAPI_BACKEND_URL>`
5. Click **Deploy**.

---

## 🔗 3. CORS Alignment
Ensure `CORS_ORIGINS` on the backend includes your production Vercel URL:
```env
CORS_ORIGINS=https://cape-churn-full-stack-development.vercel.app,http://localhost:3000
```
