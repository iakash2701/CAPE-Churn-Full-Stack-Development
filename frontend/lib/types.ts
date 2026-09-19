export interface DashboardStats {
  total_customers: number;
  churned_customers: number;
  churn_rate: number;
  high_risk_customers: number;
  avg_monthly_charges: number;
  contract_distribution: Record<string, { total: number; churned: number }>;
  tenure_distribution: Array<{ range: string; total: number; churned: number; churn_rate: number }>;
  risk_distribution: Record<string, number>;
  top_global_factors: Array<{ feature: string; importance: number }>;
}

export interface CustomerItem {
  customer_id: string;
  gender: string;
  senior_citizen: number;
  partner: string;
  dependents: string;
  tenure: number;
  phone_service: string;
  multiple_lines: string;
  internet_service: string;
  online_security: string;
  online_backup: string;
  device_protection: string;
  tech_support: string;
  streaming_tv: string;
  streaming_movies: string;
  contract: string;
  paperless_billing: string;
  payment_method: string;
  monthly_charges: number;
  total_charges: number;
  actual_churn: number;
  predicted_probability: number;
  risk_level: 'Low Risk' | 'Medium Risk' | 'High Risk';
}

export interface CustomerListResponse {
  total: number;
  page: number;
  page_size: number;
  customers: CustomerItem[];
}

export interface ShapFactor {
  feature: string;
  feature_value: any;
  shap_value: number;
  contribution_type: 'positive' | 'negative';
  impact_magnitude: number;
  description: string;
}

export interface ExplanationResponse {
  customer_id: string;
  churn_probability: number;
  risk_level: string;
  base_value: number;
  positive_factors: ShapFactor[];
  negative_factors: ShapFactor[];
  top_factors: ShapFactor[];
  research_disclaimer: string;
}

export interface RecommendationItem {
  category: string;
  title: string;
  action: string;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
  associated_feature: string;
}

export interface RecommendationResponse {
  customer_id: string;
  risk_level: string;
  churn_probability: number;
  recommendations: RecommendationItem[];
  disclaimer: string;
}

export interface ModelMetricItem {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  confusion_matrix: number[][];
  roc_curve: Array<{ fpr: number; tpr: number }>;
}

export interface ModelMetricsResponse {
  primary_model: string;
  models: Record<string, ModelMetricItem>;
}
