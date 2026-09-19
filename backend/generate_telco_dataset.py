import os
import pandas as pd
import numpy as np

def generate_telco_data(num_records=7043, seed=42):
    np.random.seed(seed)
    
    # 1. Customer IDs
    id_nums = np.random.choice(np.arange(1000, 9999), size=num_records, replace=False)
    id_letters = ["".join(np.random.choice(list("ABCDEFGHIJKLMNOPQRSTUVWXYZ"), size=5)) for _ in range(num_records)]
    customer_ids = [f"{n}-{l}" for n, l in zip(id_nums, id_letters)]
    
    # 2. Demographics
    gender = np.random.choice(["Male", "Female"], size=num_records)
    senior = np.random.choice([0, 1], size=num_records, p=[0.84, 0.16])
    partner = np.random.choice(["Yes", "No"], size=num_records, p=[0.48, 0.52])
    dependents = np.random.choice(["Yes", "No"], size=num_records, p=[0.30, 0.70])
    
    # 3. Tenure (1 to 72 months)
    # Bimodal distribution: many new customers (1-12), many long-term (60-72)
    t_low = np.random.randint(1, 13, size=int(num_records * 0.4))
    t_mid = np.random.randint(13, 60, size=int(num_records * 0.35))
    t_high = np.random.randint(60, 73, size=num_records - len(t_low) - len(t_mid))
    tenure = np.concatenate([t_low, t_mid, t_high])
    np.random.shuffle(tenure)
    
    # 4. Services
    phone_service = np.random.choice(["Yes", "No"], size=num_records, p=[0.90, 0.10])
    
    multiple_lines = []
    for ps in phone_service:
        if ps == "No":
            multiple_lines.append("No phone service")
        else:
            multiple_lines.append(np.random.choice(["Yes", "No"], p=[0.42, 0.58]))
            
    internet_service = np.random.choice(["DSL", "Fiber optic", "No"], size=num_records, p=[0.34, 0.44, 0.22])
    
    def get_add_on(internet_type, yes_prob=0.35):
        res = []
        for it in internet_type:
            if it == "No":
                res.append("No internet service")
            else:
                res.append(np.random.choice(["Yes", "No"], p=[yes_prob, 1 - yes_prob]))
        return res

    online_security = get_add_on(internet_service, 0.28)
    online_backup = get_add_on(internet_service, 0.34)
    device_protection = get_add_on(internet_service, 0.34)
    tech_support = get_add_on(internet_service, 0.29)
    streaming_tv = get_add_on(internet_service, 0.38)
    streaming_movies = get_add_on(internet_service, 0.39)
    
    # 5. Account Info
    contract = np.random.choice(["Month-to-month", "One year", "Two year"], size=num_records, p=[0.55, 0.21, 0.24])
    paperless = np.random.choice(["Yes", "No"], size=num_records, p=[0.59, 0.41])
    payment = np.random.choice([
        "Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"
    ], size=num_records, p=[0.34, 0.23, 0.22, 0.21])
    
    # 6. Monthly Charges & Total Charges
    monthly_charges = []
    total_charges = []
    for i in range(num_records):
        base = 20.0 if internet_service[i] == "No" else (50.0 if internet_service[i] == "DSL" else 80.0)
        if online_security[i] == "Yes": base += 10.0
        if tech_support[i] == "Yes": base += 10.0
        if streaming_tv[i] == "Yes": base += 12.0
        if streaming_movies[i] == "Yes": base += 12.0
        
        # add random noise
        mc = round(max(18.25, min(118.75, base + np.random.normal(0, 5.0))), 2)
        monthly_charges.append(mc)
        
        tc = round(max(mc, mc * tenure[i] + np.random.normal(0, 15.0)), 2)
        total_charges.append(tc)
        
    # 7. Real Ground Truth Churn Determination (matching tabular features)
    churn = []
    for i in range(num_records):
        logit = -1.2
        if contract[i] == "Month-to-month": logit += 1.6
        elif contract[i] == "Two year": logit -= 1.4
        
        if tenure[i] < 12: logit += 1.2
        elif tenure[i] > 48: logit -= 1.1
        
        if internet_service[i] == "Fiber optic": logit += 0.8
        if tech_support[i] == "No" and internet_service[i] != "No": logit += 0.7
        if online_security[i] == "No" and internet_service[i] != "No": logit += 0.6
        if payment[i] == "Electronic check": logit += 0.6
        if monthly_charges[i] > 80: logit += 0.5
        
        prob = 1.0 / (1.0 + np.exp(-logit))
        ch = "Yes" if np.random.rand() < prob else "No"
        churn.append(ch)

    df = pd.DataFrame({
        "customerID": customer_ids,
        "gender": gender,
        "SeniorCitizen": senior,
        "Partner": partner,
        "Dependents": dependents,
        "tenure": tenure,
        "PhoneService": phone_service,
        "MultipleLines": multiple_lines,
        "InternetService": internet_service,
        "OnlineSecurity": online_security,
        "OnlineBackup": online_backup,
        "DeviceProtection": device_protection,
        "TechSupport": tech_support,
        "StreamingTV": streaming_tv,
        "StreamingMovies": streaming_movies,
        "Contract": contract,
        "PaperlessBilling": paperless,
        "PaymentMethod": payment,
        "MonthlyCharges": monthly_charges,
        "TotalCharges": total_charges,
        "Churn": churn
    })

    data_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(data_dir, exist_ok=True)
    out_path = os.path.join(data_dir, "telco_churn.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated Telco Churn dataset: {df.shape[0]} rows, {df.shape[1]} columns at {out_path}")
    print(f"Churn distribution:\n{df['Churn'].value_counts(normalize=True)}")

if __name__ == "__main__":
    generate_telco_data()
