'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ModelMetricsResponse } from '@/lib/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Award,
  Info,
  Layers,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function ModelPerformancePage() {
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        const data = await api.getModelMetrics();
        setMetrics(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load model metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20" />
        <Skeleton className="h-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <Card className="glass-card text-center p-8">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-zinc-200">Unable to load metrics</h3>
        <p className="text-sm text-zinc-400 mt-1">{error}</p>
      </Card>
    );
  }

  const xgbMetrics = metrics.models['XGBoost'] || Object.values(metrics.models)[0];
  const cm = xgbMetrics?.confusion_matrix || [[0, 0], [0, 0]];
  const tn = cm[0][0], fp = cm[0][1], fn = cm[1][0], tp = cm[1][1];

  const rocData = xgbMetrics?.roc_curve || [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          Model Comparison & Evaluation Metrics
        </h1>
        <p className="text-sm text-zinc-400">
          Experimental baseline comparison: Logistic Regression vs Random Forest vs Primary XGBoost model.
        </p>
      </div>

      {/* Model Comparison Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>Experimental Evaluation Summary</span>
          </CardTitle>
          <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
            Real Test Set Experimental Results
          </span>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#18181B] text-zinc-400 border-b border-[#27272A] uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Model</th>
                <th className="p-3.5">Accuracy</th>
                <th className="p-3.5">Precision</th>
                <th className="p-3.5">Recall</th>
                <th className="p-3.5">F1-Score</th>
                <th className="p-3.5">ROC-AUC</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A] text-zinc-200">
              {Object.entries(metrics.models).map(([name, m]) => {
                const isPrimary = name === metrics.primary_model;
                return (
                  <tr key={name} className={isPrimary ? 'bg-blue-600/10 font-semibold' : 'hover:bg-[#18181B]'}>
                    <td className="p-3.5 flex items-center gap-2">
                      {isPrimary && <Award className="w-4 h-4 text-blue-400" />}
                      <span className={isPrimary ? 'text-blue-400 font-bold' : 'text-zinc-200'}>{name}</span>
                    </td>
                    <td className="p-3.5 font-mono">{(m.accuracy * 100).toFixed(2)}%</td>
                    <td className="p-3.5 font-mono">{(m.precision * 100).toFixed(2)}%</td>
                    <td className="p-3.5 font-mono">{(m.recall * 100).toFixed(2)}%</td>
                    <td className="p-3.5 font-mono">{(m.f1_score * 100).toFixed(2)}%</td>
                    <td className="p-3.5 font-mono font-bold text-indigo-400">{m.roc_auc.toFixed(4)}</td>
                    <td className="p-3.5">
                      {isPrimary ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Primary Production
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400">
                          Baseline Comparison
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Row 2: Confusion Matrix & ROC Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>XGBoost Confusion Matrix</CardTitle>
            <span className="text-xs text-zinc-400">Test Set Predictions</span>
          </CardHeader>

          <div className="grid grid-cols-2 gap-3 p-4 bg-[#18181B] rounded-xl border border-[#27272A]">
            <div className="p-4 bg-[#141417] border border-emerald-500/30 rounded-lg text-center">
              <span className="text-xs text-zinc-400 font-medium">True Negatives (Retained)</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{tn}</p>
              <span className="text-[10px] text-zinc-500">Correctly predicted non-churn</span>
            </div>

            <div className="p-4 bg-[#141417] border border-amber-500/30 rounded-lg text-center">
              <span className="text-xs text-zinc-400 font-medium">False Positives (False Alarm)</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">{fp}</p>
              <span className="text-[10px] text-zinc-500">Predicted churn, actually stayed</span>
            </div>

            <div className="p-4 bg-[#141417] border border-rose-500/30 rounded-lg text-center">
              <span className="text-xs text-zinc-400 font-medium">False Negatives (Missed Churn)</span>
              <p className="text-2xl font-bold text-rose-400 mt-1">{fn}</p>
              <span className="text-[10px] text-zinc-500">Predicted stay, actually churned</span>
            </div>

            <div className="p-4 bg-[#141417] border border-blue-500/30 rounded-lg text-center">
              <span className="text-xs text-zinc-400 font-medium">True Positives (Caught Churn)</span>
              <p className="text-2xl font-bold text-blue-400 mt-1">{tp}</p>
              <span className="text-[10px] text-zinc-500">Correctly predicted churn</span>
            </div>
          </div>
        </Card>

        {/* ROC Curve Representation */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>ROC Curve (Receiver Operating Characteristic)</span>
            </CardTitle>
            <span className="text-xs text-indigo-400 font-mono">AUC = {xgbMetrics?.roc_auc.toFixed(4)}</span>
          </CardHeader>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocData}>
                <XAxis dataKey="fpr" stroke="#71717A" fontSize={11} tickLine={false} label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5, fill: '#71717A' }} />
                <YAxis stroke="#71717A" fontSize={11} tickLine={false} label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fill: '#71717A' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141417', borderColor: '#27272A', color: '#FAFAFA', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="tpr" stroke="#6366F1" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Research Discussion */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            <span>Why XGBoost Over Deep Learning for Tabular Customer Data?</span>
          </CardTitle>
        </CardHeader>

        <div className="text-xs text-zinc-300 space-y-2 leading-relaxed">
          <p>
            For structured tabular customer datasets like IBM Telco, tree-based gradient boosting models (XGBoost) consistently outperform deep neural networks (CNNs, LSTMs, Transformers) in both predictive efficiency and explainability.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li><strong>Nonlinear Interaction Handling:</strong> Tree splits naturally capture non-linear thresholds (e.g. high monthly charge combined with low tenure).</li>
            <li><strong>Exact SHAP TreeExplainer:</strong> Tree models support polynomial-time exact SHAP computation, whereas deep learning relies on approximate Sampling/Kernel SHAP.</li>
            <li><strong>Training Efficiency:</strong> Trains in seconds without needing specialized GPU infrastructure.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
