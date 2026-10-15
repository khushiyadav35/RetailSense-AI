import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  AlertCircle,
  TrendingDown,
  Search,
  Filter,
  CheckCircle,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Target
} from 'lucide-react';
import { fetchCustomers } from '../api';
import { SegmentationResponse, CustomerRecord, CustomerSegment } from '../types';

export const CustomerTab: React.FC = () => {
  const [data, setData] = useState<SegmentationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<string>('All');
  const [selectedChurnFilter, setSelectedChurnFilter] = useState<string>('All');
  const [activePlaybookSegment, setActivePlaybookSegment] = useState<CustomerSegment | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCustomers();
      setData(res);
      if (res.segments.length > 0) {
        setActivePlaybookSegment(res.segments[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load customer segmentation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Computing RFM Matrices & K-Means Clusters...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center text-rose-400 text-sm">
        {error || 'Unable to load customer intelligence'}
      </div>
    );
  }

  const { summary, segments, customers } = data;

  // Filter customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customer_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = selectedSegmentFilter === 'All' || c.segment === selectedSegmentFilter;
    const matchesChurn = selectedChurnFilter === 'All' || c.churn_tier === selectedChurnFilter;
    return matchesSearch && matchesSegment && matchesChurn;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Customer RFM Intelligence & Churn Radar</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Recency, Frequency, Monetary scoring with K-Means clustering and predictive churn probability
          </p>
        </div>

        {/* Churn alert pill */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>
            <strong>{summary.high_risk_customers_count}</strong> high-risk churn accounts identified
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Total Customer Accounts</span>
          <div className="text-xl font-bold text-white font-mono mt-1">
            {summary.total_customers.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Segmented across 5 behavioral clusters</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Champions (VIP Whales)</span>
          <div className="text-xl font-bold text-indigo-400 font-mono mt-1">
            {summary.champions_count} <span className="text-xs font-normal text-slate-400">accounts</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Drives {summary.vip_revenue_share_pct}% of total sales</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Average Customer LTV</span>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
            ${summary.avg_customer_ltv.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Historical cumulative spend per account</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">High Churn Exposure</span>
          <div className="text-xl font-bold text-rose-400 font-mono mt-1">
            {((summary.high_risk_customers_count / maxOne(summary.total_customers)) * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Lapsed &gt;90 days with high past value</p>
        </div>
      </div>

      {/* Segment Cards */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white">Segment Profiles & Targeted Playbooks</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {segments.map((seg) => {
            const isSelected = activePlaybookSegment?.segment === seg.segment;
            const isVip = seg.segment.includes('Champions');
            const isAtRisk = seg.segment.includes('At Risk') || seg.segment.includes('Hibernating');

            return (
              <div
                key={seg.segment}
                onClick={() => setActivePlaybookSegment(seg)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                    : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isVip
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          : isAtRisk
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      {seg.share_pct}% Base
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{seg.customer_count} cust</span>
                  </div>

                  <h5 className="text-sm font-bold text-white mb-2">{seg.segment}</h5>

                  <div className="space-y-1.5 text-xs text-slate-300 mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Revenue:</span>
                      <strong className="text-white font-mono">${seg.total_revenue.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Avg Spend:</span>
                      <span className="font-mono">${seg.avg_spend.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Avg Recency:</span>
                      <span className="font-mono">{seg.avg_recency_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Churn Risk:</span>
                      <span className={`font-semibold ${seg.avg_churn_risk_pct > 65 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {seg.avg_churn_risk_pct}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-indigo-400 flex items-center justify-between">
                  <span>View Playbook</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Segment Playbook Drawer */}
      {activePlaybookSegment && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <Target className="w-4 h-4" />
            <span>Automated Retention Playbook: {activePlaybookSegment.segment}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">Strategic Action:</span>
              <p className="text-slate-200 font-semibold">{activePlaybookSegment.playbook.action}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">Recommended Offer:</span>
              <p className="text-indigo-300">{activePlaybookSegment.playbook.recommended_offer}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">Business Objective:</span>
              <p className="text-emerald-300">{activePlaybookSegment.playbook.goal}</p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Customer Drill-Down Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-semibold text-white">Customer Account Directory</h4>
            <p className="text-xs text-slate-400">Search individual buyer profiles, spend histories, and churn probabilities</p>
          </div>

          {/* Table Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-8 pr-3 py-1.5 outline-none focus:border-indigo-500 w-44"
              />
            </div>

            <select
              value={selectedSegmentFilter}
              onChange={(e) => setSelectedSegmentFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Segments</option>
              {segments.map((s) => (
                <option key={s.segment} value={s.segment}>
                  {s.segment}
                </option>
              ))}
            </select>

            <select
              value={selectedChurnFilter}
              onChange={(e) => setSelectedChurnFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Churn Tiers</option>
              <option value="High Risk / Churning">High Risk</option>
              <option value="Moderate Risk">Moderate Risk</option>
              <option value="Low Risk / Safe">Low Risk / Safe</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Segment</th>
                <th className="pb-3 font-semibold text-right">Total Spend</th>
                <th className="pb-3 font-semibold text-right">Orders</th>
                <th className="pb-3 font-semibold text-right">AOV</th>
                <th className="pb-3 font-semibold text-right">Recency</th>
                <th className="pb-3 font-semibold">Favorite Category</th>
                <th className="pb-3 font-semibold">Churn Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.slice(0, 50).map((c) => {
                const isHighRisk = c.churn_tier.includes('High Risk');
                return (
                  <tr key={c.customer_id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 font-medium text-slate-200">
                      <div>{c.customer_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{c.customer_id} • {c.region}</div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 text-[11px] text-slate-300">
                        {c.segment}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono font-semibold text-emerald-400">
                      ${c.total_spend.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono text-slate-300">{c.orders_count}</td>
                    <td className="py-3 text-right font-mono text-slate-400">${c.aov.toFixed(2)}</td>
                    <td className="py-3 text-right font-mono text-slate-400">{c.recency_days}d ago</td>
                    <td className="py-3 text-slate-300">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-[10px]">
                        {c.favorite_category}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              c.churn_risk_score > 65
                                ? 'bg-rose-500'
                                : c.churn_risk_score > 35
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${c.churn_risk_score}%` }}
                          />
                        </div>
                        <span
                          className={`text-[10px] font-semibold ${
                            c.churn_risk_score > 65
                              ? 'text-rose-400'
                              : c.churn_risk_score > 35
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {c.churn_risk_score}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              No customer records matching selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function maxOne(num: number): number {
  return num > 0 ? num : 1;
}
