'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserSearch,
  BrainCircuit,
  BarChart3,
  Users,
  BookOpen,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Customer Analysis', href: '/analysis', icon: UserSearch },
  { name: 'Explainable AI', href: '/xai', icon: BrainCircuit },
  { name: 'Model Performance', href: '/performance', icon: BarChart3 },
  { name: 'Customer Segments', href: '/segments', icon: Users },
  { name: 'About & Research', href: '/research', icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#141417] border-r border-[#27272A] flex flex-col justify-between h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#27272A] flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide text-white flex items-center gap-1.5">
              CAPE<span className="text-blue-500 font-semibold">-Churn</span>
            </h1>
            <p className="text-[10px] text-zinc-400 font-medium">Explainable XAI Platform</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1 mt-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181B]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-zinc-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Model Spec Footer Badge */}
      <div className="p-4 border-t border-[#27272A] bg-[#09090B]/40 m-3 rounded-xl">
        <div className="flex items-center space-x-2 text-xs font-medium text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>XGBoost + SHAP Engine</span>
        </div>
        <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
          IBM Telco ML Baseline Pipeline • Production Ready
        </p>
      </div>
    </aside>
  );
}
