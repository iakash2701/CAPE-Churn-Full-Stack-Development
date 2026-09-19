import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_endpoints():
    print("=== Testing CAPE-Churn Backend API Endpoints ===")
    
    # 1. Health
    r = requests.get(f"{BASE_URL}/health")
    print(f"GET /health -> Status {r.status_code}: {r.json()}")
    assert r.status_code == 200
    
    # 2. Dashboard Stats
    r = requests.get(f"{BASE_URL}/api/dashboard/stats")
    print(f"GET /api/dashboard/stats -> Status {r.status_code}")
    data = r.json()
    print(f"  Total Customers: {data['total_customers']}, High Risk: {data['high_risk_customers']}")
    assert r.status_code == 200
    
    # 3. Customer List
    r = requests.get(f"{BASE_URL}/api/customers?page=1&page_size=3")
    print(f"GET /api/customers -> Status {r.status_code}")
    customers = r.json()['customers']
    assert len(customers) > 0
    sample_id = customers[0]['customer_id']
    print(f"  Sample Customer ID: {sample_id}")
    
    # 4. Prediction
    r = requests.get(f"{BASE_URL}/api/customers/{sample_id}/prediction")
    print(f"GET /api/customers/{sample_id}/prediction -> Status {r.status_code}")
    print(f"  Pred: {r.json()}")
    assert r.status_code == 200
    
    # 5. Explanation
    r = requests.get(f"{BASE_URL}/api/customers/{sample_id}/explanation")
    print(f"GET /api/customers/{sample_id}/explanation -> Status {r.status_code}")
    exp = r.json()
    print(f"  Pos Factors: {len(exp['positive_factors'])}, Neg Factors: {len(exp['negative_factors'])}")
    assert r.status_code == 200
    
    # 6. Recommendation
    r = requests.get(f"{BASE_URL}/api/customers/{sample_id}/recommendation")
    print(f"GET /api/customers/{sample_id}/recommendation -> Status {r.status_code}")
    recs = r.json()
    print(f"  Recs count: {len(recs['recommendations'])}")
    assert r.status_code == 200
    
    # 7. Model Metrics
    r = requests.get(f"{BASE_URL}/api/model/metrics")
    print(f"GET /api/model/metrics -> Status {r.status_code}")
    metrics = r.json()
    print(f"  Models: {list(metrics['models'].keys())}")
    assert r.status_code == 200

    print("\n✅ All 7 API endpoints verified successfully!")

if __name__ == "__main__":
    test_endpoints()
