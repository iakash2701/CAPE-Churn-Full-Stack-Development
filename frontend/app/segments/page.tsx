'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CustomerItem } from '@/lib/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { RiskBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Users,
  Download,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerSegmentsPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [contractFilter, setContractFilter] = useState('All');
  const [internetFilter, setInternetFilter] = useState('All');

  useEffect(() => {
    async function loadFilteredCustomers() {
      try {
        setLoading(true);
        const data = await api.getCustomers({
          search,
          risk_level: riskFilter,
          contract: contractFilter,
          internet_service: internetFilter,
          page,
          page_size: pageSize
        });
        setCustomers(data.customers);
        setTotal(data.total);
      } catch (err) {
        console.error("Failed to load customer segments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFilteredCustomers();
  }, [search, riskFilter, contractFilter, internetFilter, page, pageSize]);

  // Export Filtered Results to CSV
  const handleExportCSV = () => {
    if (customers.length === 0) return;

    const headers = [
      'Customer ID', 'Risk Level', 'Churn Probability', 'Contract',
      'Tenure (Mos)', 'Monthly Charges', 'Internet Service', 'Tech Support', 'Actual Churn'
    ];

    const rows = customers.map(c => [
      c.customer_id,
      c.risk_level,
      `${(c.predicted_probability * 100).toFixed(1)}%`,
      `"${c.contract}"`,
      c.tenure,
      `$${c.monthly_charges.toFixed(2)}`,
      `"${c.internet_service}"`,
      `"${c.tech_support}"`,
      c.actual_churn === 1 ? 'Yes' : 'No'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CAPE_Churn_Segments_${riskFilter.replace(' ', '_')}_Page${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            Customer Risk Cohorts & Segments
          </h1>
          <p className="text-sm text-zinc-400">
            Filter customer base by risk bands, contract types, and service features, then export custom CSVs.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={customers.length === 0}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-emerald-600/20"
        >
          <Download className="w-4 h-4" />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* Filter Control Bar */}
      <Card className="glass-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search ID */}
          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1 block">Search Customer ID</label>
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ID Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-[#18181B] border border-[#27272A] rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Risk Level Filter */}
          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1 block">Risk Category</label>
            <select
              value={riskFilter}
              onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
              className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Risk Levels</option>
              <option value="High Risk">High Risk (&gt;70%)</option>
              <option value="Medium Risk">Medium Risk (30-70%)</option>
              <option value="Low Risk">Low Risk (0-30%)</option>
            </select>
          </div>

          {/* Contract Filter */}
          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1 block">Contract Type</label>
            <select
              value={contractFilter}
              onChange={(e) => { setContractFilter(e.target.value); setPage(1); }}
              className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Contracts</option>
              <option value="Month-to-month">Month-to-month</option>
              <option value="One year">One year</option>
              <option value="Two year">Two year</option>
            </select>
          </div>

          {/* Internet Service Filter */}
          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1 block">Internet Service</label>
            <select
              value={internetFilter}
              onChange={(e) => { setInternetFilter(e.target.value); setPage(1); }}
              className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Internet Services</option>
              <option value="DSL">DSL</option>
              <option value="Fiber optic">Fiber optic</option>
              <option value="No">No Internet</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Customer Segment Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Matching Customer Cohort ({total.toLocaleString()} total)</span>
          </CardTitle>
          <span className="text-xs text-zinc-400">Page {page} of {totalPages}</span>
        </CardHeader>

        {loading ? (
          <Skeleton className="h-96 w-full" />
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-sm">
            No customers match the specified filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#18181B] text-zinc-400 border-b border-[#27272A] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Customer ID</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">Predicted Prob</th>
                  <th className="p-3">Contract</th>
                  <th className="p-3">Tenure</th>
                  <th className="p-3">Monthly Charge</th>
                  <th className="p-3">Internet</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] text-zinc-200">
                {customers.map((c) => (
                  <tr key={c.customer_id} className="hover:bg-[#18181B] transition">
                    <td className="p-3 font-mono font-semibold text-zinc-100">{c.customer_id}</td>
                    <td className="p-3"><RiskBadge level={c.risk_level} /></td>
                    <td className="p-3 font-mono font-bold text-zinc-100">
                      {(c.predicted_probability * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-zinc-300">{c.contract}</td>
                    <td className="p-3 text-zinc-300">{c.tenure} mos</td>
                    <td className="p-3 font-mono text-zinc-300">${c.monthly_charges.toFixed(2)}</td>
                    <td className="p-3 text-zinc-400">{c.internet_service}</td>
                    <td className="p-3">
                      <Link
                        href={`/analysis?id=${c.customer_id}`}
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
                      >
                        <span>Analyze</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        <div className="flex items-center justify-between pt-4 border-t border-[#27272A] mt-4 text-xs text-zinc-400">
          <span>Showing {customers.length} of {total} records</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 bg-[#18181B] border border-[#27272A] rounded-lg disabled:opacity-40 hover:bg-[#202025]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-zinc-200">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 bg-[#18181B] border border-[#27272A] rounded-lg disabled:opacity-40 hover:bg-[#202025]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
