from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.data_service import data_service
from app.services.prediction_service import prediction_service
from app.schemas import CustomerListResponse, CustomerItem

router = APIRouter()

@router.get("/customers", response_model=CustomerListResponse)
def get_customers(
    search: Optional[str] = Query(None, description="Search by Customer ID"),
    risk_level: Optional[str] = Query(None, description="Filter by Risk Level (Low Risk, Medium Risk, High Risk)"),
    contract: Optional[str] = Query(None, description="Filter by Contract type"),
    internet_service: Optional[str] = Query(None, description="Filter by Internet Service"),
    min_tenure: Optional[int] = Query(None),
    max_tenure: Optional[int] = Query(None),
    min_charges: Optional[float] = Query(None),
    max_charges: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    raw_list, total = data_service.get_filtered_customers(
        search=search,
        risk_level=risk_level,
        contract=contract,
        internet_service=internet_service,
        min_tenure=min_tenure,
        max_tenure=max_tenure,
        min_charges=min_charges,
        max_charges=max_charges,
        page=page,
        page_size=page_size
    )

    customers_items = []
    for item in raw_list:
        pred = prediction_service.predict_customer(item)
        
        # Risk level filter check if specified
        if risk_level and risk_level != "All" and pred["risk_level"] != risk_level:
            continue

        c_item = CustomerItem(
            customer_id=str(item.get("customerID", "")),
            gender=str(item.get("gender", "")),
            senior_citizen=int(item.get("SeniorCitizen", 0)),
            partner=str(item.get("Partner", "")),
            dependents=str(item.get("Dependents", "")),
            tenure=int(item.get("tenure", 0)),
            phone_service=str(item.get("PhoneService", "")),
            multiple_lines=str(item.get("MultipleLines", "")),
            internet_service=str(item.get("InternetService", "")),
            online_security=str(item.get("OnlineSecurity", "")),
            online_backup=str(item.get("OnlineBackup", "")),
            device_protection=str(item.get("DeviceProtection", "")),
            tech_support=str(item.get("TechSupport", "")),
            streaming_tv=str(item.get("StreamingTV", "")),
            streaming_movies=str(item.get("StreamingMovies", "")),
            contract=str(item.get("Contract", "")),
            paperless_billing=str(item.get("PaperlessBilling", "")),
            payment_method=str(item.get("PaymentMethod", "")),
            monthly_charges=float(item.get("MonthlyCharges", 0.0)),
            total_charges=float(item.get("TotalCharges", 0.0)),
            actual_churn=int(item.get("Churn", 0)),
            predicted_probability=pred["churn_probability"],
            risk_level=pred["risk_level"]
        )
        customers_items.append(c_item)

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "customers": customers_items
    }

@router.get("/customers/{customer_id}", response_model=CustomerItem)
def get_customer(customer_id: str):
    item = data_service.get_customer_by_id(customer_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Customer ID '{customer_id}' not found")

    pred = prediction_service.predict_customer(item)
    return CustomerItem(
        customer_id=str(item.get("customerID", "")),
        gender=str(item.get("gender", "")),
        senior_citizen=int(item.get("SeniorCitizen", 0)),
        partner=str(item.get("Partner", "")),
        dependents=str(item.get("Dependents", "")),
        tenure=int(item.get("tenure", 0)),
        phone_service=str(item.get("PhoneService", "")),
        multiple_lines=str(item.get("MultipleLines", "")),
        internet_service=str(item.get("InternetService", "")),
        online_security=str(item.get("OnlineSecurity", "")),
        online_backup=str(item.get("OnlineBackup", "")),
        device_protection=str(item.get("DeviceProtection", "")),
        tech_support=str(item.get("TechSupport", "")),
        streaming_tv=str(item.get("StreamingTV", "")),
        streaming_movies=str(item.get("StreamingMovies", "")),
        contract=str(item.get("Contract", "")),
        paperless_billing=str(item.get("PaperlessBilling", "")),
        payment_method=str(item.get("PaymentMethod", "")),
        monthly_charges=float(item.get("MonthlyCharges", 0.0)),
        total_charges=float(item.get("TotalCharges", 0.0)),
        actual_churn=int(item.get("Churn", 0)),
        predicted_probability=pred["churn_probability"],
        risk_level=pred["risk_level"]
    )
