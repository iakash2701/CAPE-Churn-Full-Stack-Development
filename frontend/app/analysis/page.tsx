'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CustomerItem, ExplanationResponse, RecommendationResponse } from '@/lib/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { RiskBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  UserSearch,
  Search,
  BrainCircuit,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ShieldAlert,
  Info
} from 'lucide-react';

export default function CustomerAnalysisPage() {
  const [searchId, setSearchId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [sampleCustomers, setSampleCustomers] = useState<CustomerItem[]>([]);
  
  const [customer, setCustomer] = useState<CustomerItem | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sample customers on mount
  useEffect(() => {
    async function loadSamples() {
      try {
        const data = await api.getCustomers({ page: 1, page_size: 15 });
        setSampleCustomers(data.customers);
        if (data.customers.length > 0) {
          // Select first customer by default
          setSelectedCustomerId(data.customers[0].customer_id);
        }
      } catch (err) {
        console.error("Error loading sample customers:", err);
      }
    }
    loadSamples();
  }, []);

  // Fetch details whenever selectedCustomerId changes
  useEffect(() => {
    if (!selectedCustomerId) return;
    
    async function fetchCustomerDetails() {
      try {
        setLoading(true);
        setError(null);
        
        const [cData, expData, recData] = await Promise.all([
          api.getCustomer(selectedCustomerId),
          api.getExplanation(selectedCustomerId),
          api.getRecommendation(selectedCustomerId)
        ]);

        setCustomer(cData);
        setExplanation(expData);
        setRecommendation(recData);
      } catch (err: any) {
        setError(err.message || 'Failed to analyze customer.');
        setCustomer(null);
        setExplanation(null);
        setRecommendation(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomerDetails();
  }, [selectedCustomerId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      setSelectedCustomerId(searchId.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          Individual Customer Churn & SHAP Risk Analysis
        </h1>
        <p className="text-sm text-zinc-400">
          Inspect customer risk scores, exact local SHAP feature attributions, and suggested retention actions.
        </p>
      </div>

      {/* Search & Selector Bar */}
      <Card className="glass-card">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          {/* Direct Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Customer ID (e.g. 7590-VHVEG)..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full bg-[#18181B] border border-[#27272A] rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
            >
              Analyze
            </button>
          </form>

          {/* Quick Select Dropdown */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">Select Sample:</span>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition"
            >
              {sampleCustomers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.customer_id} ({c.risk_level} • {(c.predicted_probability * 100).toFixed(0)}%)
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Main Analysis Layout */}
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-40" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      ) : error ? (
        <Card className="glass-card text-center p-8">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-zinc-200">Customer Not Found</h3>
          <p className="text-sm text-zinc-400 mt-1">{error}</p>
        </Card>
      ) : customer && explanation && recommendation ? (
        <div className="space-y-6">
          {/* Customer Risk Overview Header Card */}
          <Card className="glass-card">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <div>
                <span className="text-xs font-medium text-zinc-400">Customer ID</span>
                <h2 className="text-xl font-bold text-zinc-100 mt-0.5">{customer.customer_id}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <RiskBadge level={customer.risk_level} />
                  <span className="text-xs text-zinc-500">
                    {customer.contract} • {customer.tenure} mos tenure
                  </span>
                </div>
              </div>

              {/* Churn Probability Gauge */}
              <div className="md:border-l md:border-r border-[#27272A] md:px-6">
                <span className="text-xs font-medium text-zinc-400">XGBoost Churn Probability</span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className={`text-3xl font-extrabold ${
                    customer.predicted_probability >= 0.7 ? 'text-rose-400' : customer.predicted_probability >= 0.3 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {(customer.predicted_probability * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">score</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-[#18181B] h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      customer.predicted_probability >= 0.7 ? 'bg-rose-500' : customer.predicted_probability >= 0.3 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${customer.predicted_probability * 100}%` }}
                  />
                </div>
              </div>

              {/* Demographics & Plan summary */}
              <div>
                <span className="text-xs font-medium text-zinc-400">Service Plan</span>
                <p className="text-sm font-semibold text-zinc-200 mt-1">{customer.internet_service} Internet</p>
                <p className="text-xs text-zinc-400 mt-0.5">${customer.monthly_charges.toFixed(2)}/mo • {customer.payment_method}</p>
              </div>

              <div>
                <span className="text-xs font-medium text-zinc-400">Ground Truth Status</span>
                <p className="text-sm font-semibold text-zinc-200 mt-1">
                  {customer.actual_churn === 1 ? (
                    <span className="text-rose-400 flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4" /> Actual Churned
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Retained (No Churn)
                    </span>
                  )}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">Total Spent: ${customer.total_charges.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          {/* Row 2: SHAP Explanation Waterfall & Drivers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Factors Increasing Churn Risk (+ positive SHAP) */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-rose-400">
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                  <span>Top Factors Increasing Churn Risk (+ SHAP)</span>
                </CardTitle>
                <span className="text-xs text-zinc-500">Pushes score higher</span>
              </CardHeader>

              {explanation.positive_factors.length === 0 ? (
                <p className="text-sm text-zinc-400 py-4 text-center">No strong positive risk factors identified for this low-risk customer.</p>
              ) : (
                <div className="space-y-3.5">
                  {explanation.positive_factors.map((factor, i) => (
                    <div key={i} className="p-3 bg-[#18181B] border border-rose-500/20 rounded-lg space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-rose-300">{factor.feature}</span>
                        <span className="font-mono text-rose-400 font-bold">+{factor.shap_value.toFixed(4)}</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{factor.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Factors Reducing Churn Risk (- negative SHAP) */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-400">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <span>Top Factors Reducing Churn Risk (- SHAP)</span>
                </CardTitle>
                <span className="text-xs text-zinc-500">Pushes score lower</span>
              </CardHeader>

              {explanation.negative_factors.length === 0 ? (
                <p className="text-sm text-zinc-400 py-4 text-center">No strong negative factors mitigating churn risk for this customer.</p>
              ) : (
                <div className="space-y-3.5">
                  {explanation.negative_factors.map((factor, i) => (
                    <div key={i} className="p-3 bg-[#18181B] border border-emerald-500/20 rounded-lg space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-emerald-300">{factor.feature}</span>
                        <span className="font-mono text-emerald-400 font-bold">{factor.shap_value.toFixed(4)}</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{factor.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Row 3: Model-Informed Retention Recommendations */}
          <Card className="glass-card border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Lightbulb className="w-5 h-5 text-blue-400" />
                <span>Model-Informed Suggested Retention Actions</span>
              </CardTitle>
              <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                Rule-Based Intelligence Engine
              </span>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendation.recommendations.map((rec, i) => (
                <div key={i} className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">{rec.category}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        rec.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : rec.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {rec.priority} Priority
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-zinc-100 mt-2">{rec.title}</h4>
                    <p className="text-xs text-zinc-300 font-medium mt-1 leading-relaxed bg-[#141417] p-2.5 rounded-lg border border-[#27272A]">
                      Action: {rec.action}
                    </p>
                    <p className="text-xs text-zinc-400 mt-2">Reasoning: {rec.reason}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Scientific Integrity Disclaimer */}
            <div className="mt-4 pt-3 border-t border-[#27272A] flex items-start space-x-2 text-xs text-zinc-500">
              <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <p>{recommendation.disclaimer}</p>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
