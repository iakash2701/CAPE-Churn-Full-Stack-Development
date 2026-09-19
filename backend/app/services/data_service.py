import os
import pandas as pd
import numpy as np
from app.config import settings

class DataService:
    _instance = None

    def __init__(self):
        self.df: pd.DataFrame = None
        self.raw_df: pd.DataFrame = None
        self.predictions_cache: dict = {}
        self.load_data()

    def load_data(self):
        if os.path.exists(settings.DATA_PATH):
            self.df = pd.read_csv(settings.DATA_PATH)
        elif os.path.exists(settings.RAW_DATA_PATH):
            self.raw_df = pd.read_csv(settings.RAW_DATA_PATH)
            # Basic clean
            df = self.raw_df.copy()
            df["TotalCharges"] = pd.to_numeric(df["TotalCharges"].astype(str).str.strip(), errors="coerce")
            df["TotalCharges"] = df["TotalCharges"].fillna(df["MonthlyCharges"] * df["tenure"])
            df["Churn"] = df["Churn"].apply(lambda x: 1 if str(x).strip().lower() == "yes" else 0)
            self.df = df
        else:
            self.df = pd.DataFrame()

    def get_all_customers(self):
        return self.df

    def get_customer_by_id(self, customer_id: str):
        if self.df.empty:
            return None
        matched = self.df[self.df["customerID"].astype(str).str.strip() == str(customer_id).strip()]
        if len(matched) == 0:
            return None
        return matched.iloc[0].to_dict()

    def get_filtered_customers(
        self,
        search: str = None,
        risk_level: str = None,
        contract: str = None,
        internet_service: str = None,
        min_tenure: int = None,
        max_tenure: int = None,
        min_charges: float = None,
        max_charges: float = None,
        page: int = 1,
        page_size: int = 20
    ):
        if self.df.empty:
            return [], 0

        filtered = self.df.copy()

        if search:
            s = str(search).strip().lower()
            filtered = filtered[filtered["customerID"].astype(str).str.lower().str.contains(s)]

        if contract and contract != "All":
            filtered = filtered[filtered["Contract"] == contract]

        if internet_service and internet_service != "All":
            filtered = filtered[filtered["InternetService"] == internet_service]

        if min_tenure is not None:
            filtered = filtered[filtered["tenure"] >= min_tenure]
        if max_tenure is not None:
            filtered = filtered[filtered["tenure"] <= max_tenure]

        if min_charges is not None:
            filtered = filtered[filtered["MonthlyCharges"] >= min_charges]
        if max_charges is not None:
            filtered = filtered[filtered["MonthlyCharges"] <= max_charges]

        total = len(filtered)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        sliced = filtered.iloc[start_idx:end_idx]
        return sliced.to_dict(orient="records"), total

data_service = DataService()
