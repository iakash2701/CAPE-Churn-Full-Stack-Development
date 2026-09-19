'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  BookOpen,
  BrainCircuit,
  HelpCircle,
  Lightbulb,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
  Award
} from 'lucide-react';

export default function AboutResearchPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          Research Methodology & Viva Guide
        </h1>
        <p className="text-sm text-zinc-400">
          Academic foundation, architecture workflow, and examination presentation reference for CAPE-Churn.
        </p>
      </div>

      {/* Core Research Objective */}
      <Card className="glass-card border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span>Main Research Contribution Statement</span>
          </CardTitle>
        </CardHeader>
        <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl text-xs md:text-sm text-zinc-200 leading-relaxed font-medium">
          “The proposed framework integrates machine-learning-based churn prediction with SHAP-based Explainable AI and actionable retention recommendations. Unlike a conventional churn prediction system that only identifies customers at risk, the proposed approach also provides customer-level explanations of model predictions and translates important risk factors into suggested retention actions.”
        </div>
      </Card>

      {/* 3 Core Questions Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Question 1</span>
          <h3 className="text-sm font-semibold text-zinc-100 mt-1">Which customers are likely to churn?</h3>
          <p className="text-xs text-zinc-400 mt-1">Answered via XGBoost supervised binary classification & churn probability scores.</p>
        </Card>

        <Card className="glass-card">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Question 2</span>
          <h3 className="text-sm font-semibold text-zinc-100 mt-1">Why is each customer likely to churn?</h3>
          <p className="text-xs text-zinc-400 mt-1">Answered via SHAP TreeExplainer feature attributions (+ positive / - negative drivers).</p>
        </Card>

        <Card className="glass-card">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Question 3</span>
          <h3 className="text-sm font-semibold text-zinc-100 mt-1">What retention action to consider?</h3>
          <p className="text-xs text-zinc-400 mt-1">Answered via model-informed rule-based retention recommendation engine.</p>
        </Card>
      </div>

      {/* End-to-End Workflow Architecture */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>End-to-End System Workflow Architecture</span>
          </CardTitle>
        </CardHeader>

        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs p-3 bg-[#18181B] rounded-xl border border-[#27272A] font-medium text-center">
          <div className="p-2.5 bg-[#141417] rounded-lg border border-[#27272A] w-full md:w-auto">Telco Dataset</div>
          <ArrowRight className="w-4 h-4 text-zinc-500 shrink-0 hidden md:block" />
          <div className="p-2.5 bg-[#141417] rounded-lg border border-[#27272A] w-full md:w-auto">Preprocessing Pipeline</div>
          <ArrowRight className="w-4 h-4 text-zinc-500 shrink-0 hidden md:block" />
          <div className="p-2.5 bg-[#141417] rounded-lg border border-[#27272A] w-full md:w-auto">Baselines (LR, RF)</div>
          <ArrowRight className="w-4 h-4 text-zinc-500 shrink-0 hidden md:block" />
          <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg w-full md:w-auto font-bold">XGBoost Churn Model</div>
          <ArrowRight className="w-4 h-4 text-zinc-500 shrink-0 hidden md:block" />
          <div className="p-2.5 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg w-full md:w-auto font-bold">SHAP XAI Explanation</div>
          <ArrowRight className="w-4 h-4 text-zinc-500 shrink-0 hidden md:block" />
          <div className="p-2.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg w-full md:w-auto font-bold">Retention Engine</div>
        </div>
      </Card>

      {/* Viva Q&A Examination Prep */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <span>Viva & College Project Defense Answers</span>
          </CardTitle>
          <span className="text-xs text-amber-400 font-medium">Standard External Examiner Questions</span>
        </CardHeader>

        <div className="space-y-4 text-xs">
          <div className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl space-y-1.5">
            <h4 className="text-sm font-bold text-blue-400">Q1: “What is your project?”</h4>
            <p className="text-zinc-300 leading-relaxed">
              “Our project is an Explainable AI-based customer churn prediction system. We use XGBoost to predict the probability that a customer will churn and SHAP to explain the factors contributing to each prediction. Based on these factors, the system provides a suggested retention action through an interactive decision-support dashboard.”
            </p>
          </div>

          <div className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl space-y-1.5">
            <h4 className="text-sm font-bold text-blue-400">Q2: “Why did you choose XGBoost?”</h4>
            <p className="text-zinc-300 leading-relaxed">
              “Because our dataset consists of structured tabular customer data. XGBoost is specifically designed for nonlinear relationships, feature interactions, and tabular datasets while integrating seamlessly with SHAP for exact tree-based explainability.”
            </p>
          </div>

          <div className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl space-y-1.5">
            <h4 className="text-sm font-bold text-blue-400">Q3: “Why use SHAP instead of feature importances from Gini impurity?”</h4>
            <p className="text-zinc-300 leading-relaxed">
              “Standard Gini impurity importance only provides a global summary for the whole dataset. SHAP provides consistent local customer-level explanations showing exactly how much each feature pushes an individual customer’s churn probability up or down.”
            </p>
          </div>

          <div className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl space-y-1.5">
            <h4 className="text-sm font-bold text-blue-400">Q4: “Why not use Deep Learning (CNN, RNN, LSTM)?”</h4>
            <p className="text-zinc-300 leading-relaxed">
              “Our dataset is structured tabular customer data without image inputs or time-series event streams. Tree-based models like XGBoost consistently achieve higher accuracy and far better interpretability than deep learning on tabular data.”
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
