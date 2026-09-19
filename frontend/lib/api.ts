import {
  DashboardStats,
  CustomerListResponse,
  CustomerItem,
  ExplanationResponse,
  RecommendationResponse,
  ModelMetricsResponse
} from './types';

const rawBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const API_BASE_URL = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;
const API_ROOT_URL = rawBase.endsWith('/api') ? rawBase.replace(/\/api$/, '') : rawBase;

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error (${res.status}): ${errorText || res.statusText}`);
  }

  return res.json();
}

export const api = {
  async getDashboardStats(): Promise<DashboardStats> {
    return fetchJson<DashboardStats>(`${API_BASE_URL}/dashboard/stats`);
  },

  async getCustomers(params: {
    search?: string;
    risk_level?: string;
    contract?: string;
    internet_service?: string;
    min_tenure?: number;
    max_tenure?: number;
    min_charges?: number;
    max_charges?: number;
    page?: number;
    page_size?: number;
  }): Promise<CustomerListResponse> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'All') {
        query.append(key, String(value));
      }
    });
    return fetchJson<CustomerListResponse>(`${API_BASE_URL}/customers?${query.toString()}`);
  },

  async getCustomer(customerId: string): Promise<CustomerItem> {
    return fetchJson<CustomerItem>(`${API_BASE_URL}/customers/${encodeURIComponent(customerId)}`);
  },

  async getExplanation(customerId: string): Promise<ExplanationResponse> {
    return fetchJson<ExplanationResponse>(`${API_BASE_URL}/customers/${encodeURIComponent(customerId)}/explanation`);
  },

  async getGlobalExplanation(): Promise<{ global_importance: Array<{ feature: string; importance: number }>; description: string }> {
    return fetchJson<{ global_importance: Array<{ feature: string; importance: number }>; description: string }>(`${API_BASE_URL}/xai/global`);
  },

  async getRecommendation(customerId: string): Promise<RecommendationResponse> {
    return fetchJson<RecommendationResponse>(`${API_BASE_URL}/customers/${encodeURIComponent(customerId)}/recommendation`);
  },

  async getModelMetrics(): Promise<ModelMetricsResponse> {
    return fetchJson<ModelMetricsResponse>(`${API_BASE_URL}/model/metrics`);
  },

  async checkHealth(): Promise<{ status: string; models_loaded: boolean; data_loaded: boolean }> {
    return fetchJson<{ status: string; models_loaded: boolean; data_loaded: boolean }>(`${API_ROOT_URL}/health`);
  }
};
