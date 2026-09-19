import os
import json
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve
)
import shap

def run_training():
    print("=== Starting CAPE-Churn Reproducible ML Pipeline ===")
    
    # 1. Load Dataset
    data_path = os.path.join(os.path.dirname(__file__), "data", "telco_churn.csv")
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}. Run download_data.py first.")
        
    df = pd.read_csv(data_path)
    print(f"Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns.")
    
    # 2. Data Cleaning & Preprocessing
    df = df.drop_duplicates()
    
    # Clean TotalCharges (spaces to NaN, coerce numeric, fill with median or monthly charge * tenure)
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"].astype(str).str.strip(), errors="coerce")
    df["TotalCharges"] = df["TotalCharges"].fillna(df["MonthlyCharges"] * df["tenure"])
    
    # Convert Churn target to binary (Yes->1, No->0)
    df["Churn"] = df["Churn"].apply(lambda x: 1 if str(x).strip().lower() == "yes" else 0)
    
    # Save processed dataframe copy for fast API lookups
    processed_df_path = os.path.join(os.path.dirname(__file__), "data", "processed_telco.csv")
    df.to_csv(processed_df_path, index=False)
    
    # 3. Define Features and Target
    drop_cols = ["customerID", "Churn"]
    feature_cols = [col for col in df.columns if col not in drop_cols]
    
    X = df[feature_cols]
    y = df["Churn"]
    
    numerical_cols = ["tenure", "MonthlyCharges", "TotalCharges"]
    categorical_cols = [c for c in feature_cols if c not in numerical_cols]
    
    print(f"Features: {len(feature_cols)} ({len(numerical_cols)} numerical, {len(categorical_cols)} categorical)")
    
    # 4. Train / Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    print(f"Train set: {X_train.shape[0]} samples, Test set: {X_test.shape[0]} samples.")
    
    # 5. Build Preprocessing Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numerical_cols),
            ("cat", OneHotEncoder(drop="first", handle_unknown="ignore", sparse_output=False), categorical_cols)
        ]
    )
    
    # Fit preprocessor on X_train
    X_train_trans = preprocessor.fit_transform(X_train)
    X_test_trans = preprocessor.transform(X_test)
    
    # Retrieve engineered feature names
    cat_encoder = preprocessor.named_transformers_["cat"]
    encoded_cat_names = list(cat_encoder.get_feature_names_out(categorical_cols))
    all_feature_names = numerical_cols + encoded_cat_names
    
    # 6. Train Baseline Models & Primary XGBoost Model
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42),
        "XGBoost": XGBClassifier(
            n_estimators=300,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            eval_metric="logloss"
        )
    }
    
    metrics_summary = {}
    fitted_models = {}
    
    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train_trans, y_train)
        fitted_models[name] = model
        
        y_pred = model.predict(X_test_trans)
        y_prob = model.predict_proba(X_test_trans)[:, 1]
        
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred))
        rec = float(recall_score(y_test, y_pred))
        f1 = float(f1_score(y_test, y_pred))
        auc = float(roc_auc_score(y_test, y_prob))
        cm = confusion_matrix(y_test, y_pred).tolist()
        
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        # Downsample ROC points for clean JSON export
        roc_points = [
            {"fpr": float(round(f, 4)), "tpr": float(round(t, 4))}
            for f, t in zip(fpr[::max(1, len(fpr)//50)], tpr[::max(1, len(tpr)//50)])
        ]
        
        metrics_summary[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(auc, 4),
            "confusion_matrix": cm,
            "roc_curve": roc_points
        }
        print(f"  {name} -> Accuracy: {acc:.4f}, Recall: {rec:.4f}, F1: {f1:.4f}, ROC-AUC: {auc:.4f}")
        
    # 7. Compute SHAP Explanations for XGBoost
    print("Computing SHAP explanations for XGBoost...")
    primary_xgb = fitted_models["XGBoost"]
    explainer = shap.TreeExplainer(primary_xgb)
    
    # Compute SHAP values on X_test_trans
    shap_values = explainer.shap_values(X_test_trans)
    
    # Calculate Mean Absolute SHAP value per feature (Global Feature Importance)
    mean_abs_shap = np.abs(shap_values).mean(axis=0)
    global_importance = sorted(
        [
            {"feature": name, "importance": float(round(val, 4))}
            for name, val in zip(all_feature_names, mean_abs_shap)
        ],
        key=lambda x: x["importance"],
        reverse=True
    )
    
    # 8. Export Models and Artifacts
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(models_dir, exist_ok=True)
    
    xgb_path = os.path.join(models_dir, "xgboost_model.joblib")
    prep_path = os.path.join(models_dir, "preprocessor.joblib")
    meta_path = os.path.join(models_dir, "metadata.joblib")
    metrics_path = os.path.join(models_dir, "metrics.json")
    shap_path = os.path.join(models_dir, "global_shap.json")
    
    joblib.dump(primary_xgb, xgb_path)
    joblib.dump(preprocessor, prep_path)
    joblib.dump({
        "all_feature_names": all_feature_names,
        "numerical_cols": numerical_cols,
        "categorical_cols": categorical_cols,
        "feature_cols": feature_cols
    }, meta_path)
    
    with open(metrics_path, "w") as f:
        json.dump(metrics_summary, f, indent=2)
        
    with open(shap_path, "w") as f:
        json.dump({
            "global_importance": global_importance,
            "base_value": float(explainer.expected_value) if isinstance(explainer.expected_value, (int, float, np.number)) else float(explainer.expected_value[0])
        }, f, indent=2)
        
    print(f"Pipeline complete! Artifacts saved to {models_dir}:")
    print(f" - {xgb_path}")
    print(f" - {prep_path}")
    print(f" - {metrics_path}")
    print(f" - {shap_path}")

if __name__ == "__main__":
    run_training()
