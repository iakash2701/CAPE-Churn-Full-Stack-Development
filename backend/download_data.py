import urllib.request
import os
import pandas as pd

DATA_URL = "https://raw.githubusercontent.com/IBM/telco-customer-churn-on-icp-for-data/master/data/Telco-Customer-Churn.csv"
ALT_URL = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/7043_Telco-Customer-Churn.csv"

target_path = os.path.join(os.path.dirname(__file__), "data", "telco_churn.csv")
os.makedirs(os.path.dirname(target_path), exist_ok=True)

print(f"Downloading Telco Customer Churn dataset to {target_path}...")

try:
    urllib.request.urlretrieve(DATA_URL, target_path)
    df = pd.read_csv(target_path)
    print(f"Success! Downloaded dataset with shape: {df.shape}")
except Exception as e:
    print(f"Primary URL failed: {e}. Trying alternative URL...")
    try:
        urllib.request.urlretrieve(ALT_URL, target_path)
        df = pd.read_csv(target_path)
        print(f"Success! Downloaded dataset from alt URL with shape: {df.shape}")
    except Exception as e2:
        print(f"Alt URL failed: {e2}")
        raise e2
