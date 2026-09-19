from app.config import settings

class RecommendationService:
    def generate_recommendations(self, customer_dict: dict, churn_prob: float, risk_level: str, shap_factors: list) -> dict:
        recs = []
        customer_id = str(customer_dict.get("customerID", "Unknown"))
        
        tenure = float(customer_dict.get("tenure", 0))
        monthly_charges = float(customer_dict.get("MonthlyCharges", 0))
        contract = str(customer_dict.get("Contract", "")).strip()
        tech_support = str(customer_dict.get("TechSupport", "")).strip()
        payment_method = str(customer_dict.get("PaymentMethod", "")).strip()
        online_security = str(customer_dict.get("OnlineSecurity", "")).strip()
        internet_service = str(customer_dict.get("InternetService", "")).strip()
        
        # Rule 1: High Monthly Charges
        if monthly_charges > 65.0:
            recs.append({
                "category": "Pricing & Retention",
                "title": "Plan Pricing Review & Loyalty Discount",
                "action": "Review plan pricing and offer a customized lower-cost tier or a $15/month promotional discount for 6 months.",
                "reason": f"Monthly charge of ${monthly_charges:.2f} is high relative to customer tenure and contributes positively to model churn risk.",
                "priority": "High" if monthly_charges > 85.0 else "Medium",
                "associated_feature": "MonthlyCharges"
            })

        # Rule 2: Month-to-Month Contract
        if "Month-to-month" in contract:
            recs.append({
                "category": "Contract Strategy",
                "title": "Long-Term Contract Incentive",
                "action": "Offer a 1-year or 2-year contract lock-in with a complimentary service upgrade (e.g., free speed boost or security package).",
                "reason": "Month-to-month contract offers no retention lock-in, making cancellation simple for the customer.",
                "priority": "High",
                "associated_feature": "Contract"
            })

        # Rule 3: Lack of Tech Support
        if tech_support == "No":
            recs.append({
                "category": "Service & Support",
                "title": "Complimentary Technical Support Bundle",
                "action": "Provide 3 months of free Premium Tech Support and proactive customer check-in.",
                "reason": "Lack of technical support increases dissatisfaction risk when technical issues arise.",
                "priority": "Medium",
                "associated_feature": "TechSupport"
            })

        # Rule 4: Low Tenure Onboarding Risk
        if tenure < 12:
            recs.append({
                "category": "Customer Success",
                "title": "Early Onboarding & Engagement Touchpoint",
                "action": "Assign a dedicated customer success agent to conduct an onboarding check-in call within 7 days.",
                "reason": f"Customer is in vulnerable early tenure ({int(tenure)} months), where cancellation rates are statistically highest.",
                "priority": "High" if tenure < 6 else "Medium",
                "associated_feature": "tenure"
            })

        # Rule 5: Electronic Check Payment Method
        if "Electronic check" in payment_method:
            recs.append({
                "category": "Billing Automation",
                "title": "Auto-Pay Incentive Upgrade",
                "action": "Offer a $10 one-time bill credit to transition from Electronic Check to Automatic Credit Card / ACH billing.",
                "reason": "Electronic check payment is associated with higher friction and turnover compared to automated billing.",
                "priority": "Low",
                "associated_feature": "PaymentMethod"
            })

        # Rule 6: Missing Online Security
        if online_security == "No" and internet_service != "No":
            recs.append({
                "category": "Security Add-on",
                "title": "Online Security Trial Package",
                "action": "Offer a 60-day free trial of Online Security and Device Protection.",
                "reason": "Bundled security services increase product stickiness and lower churn probability.",
                "priority": "Low",
                "associated_feature": "OnlineSecurity"
            })

        # If Low Risk customer with few specific triggers
        if not recs:
            recs.append({
                "category": "Loyalty Maintenance",
                "title": "Standard Loyalty Appreciation",
                "action": "Send annual loyalty appreciation thank-you email with exclusive renewal options.",
                "reason": f"Customer maintains low predicted churn risk ({churn_prob*100:.1f}%).",
                "priority": "Low",
                "associated_feature": "General"
            })

        return {
            "customer_id": customer_id,
            "risk_level": risk_level,
            "churn_probability": churn_prob,
            "recommendations": recs,
            "disclaimer": "These retention actions are model-informed decision-support recommendations based on identified SHAP risk factors. They do not constitute guaranteed causal outcomes."
        }

recommendation_service = RecommendationService()
