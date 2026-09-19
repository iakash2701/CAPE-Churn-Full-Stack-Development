'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardStats } from '@/lib/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Users,
  UserX,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center bg-[#141417] border border-[#27272A] rounded-xl my-10">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-zinc-200">Unable to Connect to Backend API</h3>
        <p className="text-sm text-zinc-400 mt-1">{error || 'Please ensure the FastAPI backend API is running.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Data formatting for charts
  const riskData = [
    { name: 'Low Risk', value: stats.risk_distribution['Low Risk'] || 0, color: '#10B981' },
    { name: 'Medium Risk', value: stats.risk_distribution['Medium Risk'] || 0, color: '#F59E0B' },
    { name: 'High Risk', value: stats.risk_distribution['High Risk'] || 0, color: '#F43F5E' },
  ];

  const contractChartData = Object.entries(stats.contract_distribution).map(([type, d]) => ({
    contract: type,
    total: d.total,
    churned: d.churned,
    rate: d.total > 0 ? parseFloat(((d.churned / d.total) * 100).toFixed(1)) : 0
  }));

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            Retention Intelligence Executive Overview
          </h1>
          <p className="text-sm text-zinc-400">
            Real-time churn risk metrics & model predictions from the 7,043 IBM Telco dataset.
          </p>
        </div>
        <Link
          href="/analysis"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-blue-600/20"
        >
          <span>Analyze Single Customer</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-zinc-400">Total Active Customers</p>
              <h3 className="text-2xl font-bold text-zinc-100 mt-1">{stats.total_customers.toLocaleString()}</h3>
              <p className="text-xs text-zinc-500 mt-1">Full dataset population</p>
            </div>
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="glass-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-zinc-400">Churned Customers</p>
              <h3 className="text-2xl font-bold text-zinc-100 mt-1">{stats.churned_customers.toLocaleString()}</h3>
              <p className="text-xs text-rose-400 font-medium mt-1">{stats.churn_rate}% Dataset Churn Rate</p>
            </div>
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <UserX className="w-5 h-5 text-rose-400" />
            </div>
          </div>
        </Card>

        <Card className="glass-card stat-glow-high">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-zinc-400">High-Risk Customers</p>
              <h3 className="text-2xl font-bold text-rose-400 mt-1">{stats.high_risk_customers.toLocaleString()}</h3>
              <p className="text-xs text-zinc-400 mt-1">Predicted &gt;70% churn probability</p>
            </div>
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
          </div>
        </Card>

        <Card className="glass-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-zinc-400">Avg Monthly Charges</p>
              <h3 className="text-2xl font-bold text-zinc-100 mt-1">${stats.avg_monthly_charges.toFixed(2)}</h3>
              <p className="text-xs text-emerald-400 font-medium mt-1">Mean ARPU across cohort</p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Model Risk Band Distribution</CardTitle>
            <span className="text-xs text-zinc-400">Project Risk Thresholds (0-30%, 30-70%, 70-100%)</span>
          </CardHeader>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#141417', borderColor: '#27272A', color: '#FAFAFA', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around pt-3 border-t border-[#27272A] text-xs">
            {riskData.map((r) => (
              <div key={r.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }}></span>
                <span className="text-zinc-300 font-medium">{r.name}:</span>
                <span className="text-zinc-400">{r.value.toLocaleString()} ({((r.value / stats.total_customers) * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Contract Type vs Churn Rate */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Churn Rate by Contract Type</CardTitle>
            <span className="text-xs text-zinc-400">Churn Percentage %</span>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contractChartData}>
                <XAxis dataKey="contract" stroke="#71717A" fontSize={12} tickLine={false} />
                <YAxis stroke="#71717A" fontSize={12} unit="%" tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141417', borderColor: '#27272A', color: '#FAFAFA', borderRadius: '8px' }}
                  formatter={(val: any) => [`${val}%`, 'Churn Rate']}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                  {contractChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.contract.includes('Month') ? '#F43F5E' : '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-zinc-400 text-center pt-2">
            Month-to-month contracts exhibit significantly higher churn rate compared to long-term commitments.
          </p>
        </Card>
      </div>

      {/* Row 3: Tenure Distribution & Top Global SHAP Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenure Range vs Churn */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Tenure Cohort Churn Rates</CardTitle>
            <span className="text-xs text-zinc-400">Months of Service vs Churn Rate</span>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.tenure_distribution}>
                <XAxis dataKey="range" stroke="#71717A" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717A" fontSize={12} unit="%" tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141417', borderColor: '#27272A', color: '#FAFAFA', borderRadius: '8px' }}
                  formatter={(val: any) => [`${val}%`, 'Churn Rate']}
                />
                <Bar dataKey="churn_rate" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Global SHAP Drivers preview */}
        <Card className="glass-card flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <span>Top Global Model Feature Importance (SHAP)</span>
              </CardTitle>
              <Link href="/xai" className="text-xs text-blue-400 hover:underline">Full XAI View &rarr;</Link>
            </CardHeader>

            <div className="space-y-3">
              {stats.top_global_factors.slice(0, 5).map((f, i) => (
                <div key={f.feature} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 font-medium">{i + 1}. {f.feature}</span>
                    <span className="text-zinc-400 font-mono">SHAP {f.importance.toFixed(3)}</span>
                  </div>
                  <div className="w-full bg-[#18181B] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (f.importance / (stats.top_global_factors[0]?.importance || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#27272A] flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Calculated across XGBoost tree ensembles
            </span>
            <Link href="/segments" className="text-blue-400 font-medium hover:underline">Explore Segments &rarr;</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
