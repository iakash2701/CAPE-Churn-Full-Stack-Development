'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  BrainCircuit,
  Info,
  Layers,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  ShieldAlert
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function ExplainableAIPage() {
  const [globalImportance, setGlobalImportance] = useState<Array<{ feature: string; importance: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGlobalXAI() {
      try {
        setLoading(true);
        const data = await api.getGlobalExplanation();
        setGlobalImportance(data.global_importance || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load global SHAP importance.');
      } finally {
        setLoading(false);
      }
    }
    loadGlobalXAI();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          Explainable AI (SHAP) Research Center
        </h1>
        <p className="text-sm text-zinc-400">
          Unpacking XGBoost churn model behavior using Shapley Additive exPlanations (SHAP).
        </p>
      </div>

      {/* Concept Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg shrink-0">
              <BrainCircuit className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">Shapley Additive Values</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Derived from cooperative game theory, SHAP attributes model predictions fairly across input features.
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-card">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg shrink-0">
              <TrendingUp className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">Positive Contribution (+ Red)</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Feature value increases the predicted log-odds / probability of customer churn.
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-card">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shrink-0">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">Negative Contribution (- Blue)</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Feature value reduces predicted churn probability, acting as a retention stabilizer.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Global Feature Importance Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Global Feature Importance (|SHAP| Mean Absolute Impact)</span>
          </CardTitle>
          <span className="text-xs text-zinc-400">Evaluated across test set samples</span>
        </CardHeader>

        {loading ? (
          <Skeleton className="h-80 w-full" />
        ) : error ? (
          <p className="text-sm text-amber-400 p-4">{error}</p>
        ) : (
          <div className="space-y-4">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={globalImportance.slice(0, 12)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <XAxis type="number" stroke="#71717A" fontSize={11} tickLine={false} />
                  <YAxis dataKey="feature" type="category" stroke="#A1A1AA" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#141417', borderColor: '#27272A', color: '#FAFAFA', borderRadius: '8px' }}
                    formatter={(val: any) => [val.toFixed(4), 'Mean |SHAP| Value']}
                  />
                  <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                    {globalImportance.slice(0, 12).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index < 3 ? '#8B5CF6' : '#3B82F6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl text-xs text-zinc-300 leading-relaxed space-y-2">
              <p className="font-semibold text-zinc-100 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-400" /> Plain-English Global Feature Insights:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                <li><strong className="text-zinc-200">Contract Type:</strong> Month-to-month contracts exert the strongest overall influence on churn risk predictions.</li>
                <li><strong className="text-zinc-200">Tenure:</strong> Customer tenure duration acts as a primary stabilizing factor; low tenure correlates strongly with churn.</li>
                <li><strong className="text-zinc-200">Monthly Charges & Tech Support:</strong> High monthly costs without technical support add-ons create major risk spikes.</li>
              </ul>
            </div>
          </div>
        )}
      </Card>

      {/* Causal Disclaimer & Viva Guidelines */}
      <Card className="glass-card border-amber-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Research Integrity Notice — Model Attribution vs Causal Causality</span>
          </CardTitle>
        </CardHeader>
        <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
          <p>
            In academic presentations and viva discussions, it is essential to distinguish between <strong className="text-amber-300">Model Explanation (SHAP)</strong> and <strong className="text-amber-300">Causal Proof</strong>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-lg">
              <h4 className="font-bold text-zinc-100 mb-1">What SHAP Does:</h4>
              <p className="text-zinc-400">Explains why the trained XGBoost model assigned a particular churn probability score based on dataset feature values.</p>
            </div>
            <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-lg">
              <h4 className="font-bold text-zinc-100 mb-1">What SHAP Does NOT Do:</h4>
              <p className="text-zinc-400">Does not prove that changing a feature will causally force a customer to stay without counterfactual intervention data.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
