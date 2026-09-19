'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Activity, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function Header() {
  const [backendReady, setBackendReady] = useState<boolean | null>(null);

  const checkBackend = async () => {
    try {
      const res = await api.checkHealth();
      setBackendReady(res.status === 'healthy' && res.models_loaded);
    } catch {
      setBackendReady(false);
    }
  };

  useEffect(() => {
    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#141417]/80 backdrop-blur border-b border-[#27272A] px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <Activity className="w-5 h-5 text-blue-400" />
        <h2 className="text-sm font-semibold text-zinc-200">
          Causal-Aware / Explainable Customer Churn Intelligence
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Backend API Status Pill */}
        <div className="flex items-center space-x-2 bg-[#18181B] border border-[#27272A] px-3 py-1.5 rounded-full text-xs font-medium">
          {backendReady === null ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
              <span className="text-zinc-400">Connecting Backend...</span>
            </>
          ) : backendReady ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">FastAPI ML Active</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400">Backend Offline</span>
            </>
          )}
        </div>

        <div className="text-xs text-zinc-500 bg-[#09090B] px-2.5 py-1 rounded-md border border-[#27272A]">
          FastAPI • Port 8000
        </div>
      </div>
    </header>
  );
}
