# CAPE-Churn — Causal-Aware & Explainable Customer Churn Prediction Platform

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.110-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![XGBoost](https://img.shields.io/badge/ML%20Engine-XGBoost%202.0-orange)](https://xgboost.readthedocs.io/)
[![SHAP](https://img.shields.io/badge/XAI-SHAP%200.45-blue)](https://shap.readthedocs.io/)

**CAPE-Churn** is a research-grade, full-stack decision-support web platform designed to transform customer churn prediction from a opaque probability score into an interpretable, customer-level intelligence workflow.

---

## 🎯 1. Core Objective

Traditional churn systems only output a binary prediction:
$$\text{Customer Data} \longrightarrow \text{Churn Prediction}$$

Our system provides an end-to-end explainable retention workflow:
$$\text{Customer Data} \longrightarrow \text{Data Cleaning} \longrightarrow \text{XGBoost Model} \longrightarrow \text{Churn Probability} \longrightarrow \text{SHAP XAI} \longrightarrow \text{Risk Factors} \longrightarrow \text{Model-Informed Action}$$

### Key Questions Answered
1. **Which customers are likely to churn?** (XGBoost Churn Probability)
2. **Why is each customer likely to churn?** (Local SHAP Feature Attributions)
3. **What retention action could be considered?** (Model-Informed Retention Recommendation Engine)

---

## 🏗️ 2. System Architecture

```
                    INTERNET
                       │
                       ▼
                ┌─────────────┐
                │   VERCEL    │
                │ Next.js UI  │
                └──────┬──────┘
                       │
                    HTTPS
                       │
                       ▼
                ┌─────────────┐
                │   FASTAPI   │
                │   Backend   │
                └──────┬──────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      XGBoost        SHAP        Dataset
```

---

## 🔬 3. Research Contribution

> **“The proposed framework integrates machine-learning-based churn prediction with SHAP-based Explainable AI and actionable retention recommendations. Unlike a conventional churn prediction system that only identifies customers at risk, the proposed approach also provides customer-level explanations of model predictions and translates important risk factors into suggested retention actions.”**

---

## 📊 4. Model Evaluation Summary

Trained on the **IBM Telco Customer Churn** dataset (7,043 customer records, stratified 80/20 train-test split):

| Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC | Role |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Logistic Regression** | 80.34% | 67.80% | 88.31% | 85.26% | 0.8579 | Baseline |
| **Random Forest** | 78.50% | 64.90% | 90.96% | 84.49% | 0.8516 | Tree Baseline |
| **XGBoost Classifier** | **79.35%** | **66.10%** | **87.54%** | **84.51%** | **0.8478** | **Primary Production Model** |

---

## 🛠️ 5. Local Setup & Execution Guide

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & npm

### Backend Setup
```bash
cd backend

# 1. Install dependencies
pip install -r requirements.txt

# 2. Run dataset generator & training pipeline
python train.py

# 3. Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### Frontend Setup
```bash
cd frontend

# 1. Install packages
npm install

# 2. Run Next.js development server
npm run dev
```
- Dashboard URL: `http://localhost:3000`

---

## 💡 6. Viva Examination & Defense Q&A

### Q1: Why use XGBoost over Deep Learning (CNN/LSTM)?
> *“Our dataset is structured tabular customer data without image inputs or time-series sequence logs. Tree-based models like XGBoost handle non-linear thresholds and feature interaction splits on tabular data more efficiently while supporting exact SHAP TreeExplainer computation.”*

### Q2: Why use SHAP instead of feature importances from Gini impurity?
> *“Gini impurity importance only provides a global summary for the whole dataset. SHAP provides consistent local customer-level explanations showing exactly how much each feature pushes an individual customer’s churn score up or down.”*

---

## ⚠️ 7. Research Limitations
1. Retention recommendations are **model-informed suggestions**, not causally proven intervention outcomes.
2. Results depend on public dataset features and require external validation before deployment in live production.

