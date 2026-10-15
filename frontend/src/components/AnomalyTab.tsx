import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  Info,
  DollarSign,
  TrendingDown,
  Search,
  CheckCircle2,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { fetchAnomalies } from '../api';
import { AnomalyResponse, AnomalyRecord } from '../types';

export const AnomalyTab: React.FC = () => {
  const [data, setData] = useState<AnomalyResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAnomalies();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to detect anomalies');
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
          <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Scanning Isolation Forest Outliers & Macro Shocks...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center text-rose-400 text-sm">
        {error || 'Unable to scan anomalies'}
      </div>
    );
  }

  const { summary, records, daily_timeline } = data;

  const filteredRecords = records.filter((r) => {
    const matchesSev = severityFilter === 'All' || r.severity === severityFilter;
    const matchesQuery =
      r.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Risk & Anomaly Radar</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Unsupervised Isolation Forest detection coupled with statistical rolling Z-score macro time-series analysis
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Continuous ML Guardrail Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Total Flagged Irregularities</span>
          <div className="text-xl font-bold text-white font-mono mt-1">
            {summary.total_anomalies} <span className="text-xs font-normal text-slate-400">orders</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Surfaced across 5,800+ transactions</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Critical Exposure Alerts</span>
          <div className="text-xl font-bold text-rose-400 font-mono mt-1">
            {summary.critical_alerts} <span className="text-xs font-normal text-rose-300">immediate action</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Negative profit or massive bulk anomalies</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Est. Revenue at Risk</span>
          <div className="text-xl font-bold text-amber-400 font-mono mt-1">
            ${summary.estimated_revenue_at_risk.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Potential margin or discount leakage</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Macro Anomaly Days</span>
          <div className="text-xl font-bold text-cyan-400 font-mono mt-1">
            {summary.daily_anomalous_days_count} <span className="text-xs font-normal text-slate-400">days</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Deviations &gt; 2.5 std devs from moving average</p>
        </div>
      </div>

      {/* Macro Daily Timeline Chart */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-semibold text-white">Daily Revenue Volatility & Outlier Timeline</h4>
            <p className="text-xs text-slate-400">Rolling 7-day baseline with statistical deviation thresholds</p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <span className="w-2.5 h-0.5 bg-slate-500"></span>
              <span>7-Day Moving Baseline</span>
            </div>
            <div className="flex items-center space-x-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span>Daily Volume</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={daily_timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(val) => val.slice(5)} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px'
                }}
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
              />
              <Line
                type="monotone"
                dataKey="baseline"
                name="Rolling Baseline"
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Daily Revenue"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Anomalous Transactions Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-semibold text-white">Surfaced Anomalous Transactions</h4>
            <p className="text-xs text-slate-400">Root-cause diagnostics, margin impact, and recommended countermeasures</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reason / order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-8 pr-3 py-1.5 outline-none focus:border-rose-500 w-48"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">Severity</th>
                <th className="pb-3 font-semibold">Order ID & Date</th>
                <th className="pb-3 font-semibold">Customer & Product</th>
                <th className="pb-3 font-semibold text-right">Quantity</th>
                <th className="pb-3 font-semibold text-right">Total Amount</th>
                <th className="pb-3 font-semibold text-right">Net Profit</th>
                <th className="pb-3 font-semibold">Diagnostic Root Cause</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.slice(0, 40).map((r) => {
                const isCritical = r.severity === 'Critical';
                const isHigh = r.severity === 'High';
                const isNegativeProfit = r.profit < 0;

                return (
                  <tr key={r.order_id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : isHigh
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        }`}
                      >
                        {r.severity}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="font-mono font-semibold text-slate-200">{r.order_id}</div>
                      <div className="text-[10px] text-slate-500">{r.order_date}</div>
                    </td>
                    <td className="py-3">
                      <div className="font-medium text-slate-200">{r.customer_name}</div>
                      <div className="text-[10px] text-slate-400">{r.product_name} ({r.category})</div>
                    </td>
                    <td className="py-3 text-right font-mono text-slate-300 font-semibold">{r.quantity}</td>
                    <td className="py-3 text-right font-mono text-slate-200">${r.total_amount.toLocaleString()}</td>
                    <td className={`py-3 text-right font-mono font-semibold ${isNegativeProfit ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isNegativeProfit ? `-$${Math.abs(r.profit).toLocaleString()}` : `$${r.profit.toLocaleString()}`}
                    </td>
                    <td className="py-3 text-slate-300 max-w-xs">
                      <span className="text-[11px] leading-relaxed block text-slate-300">
                        {r.reason}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              No anomalies matching current criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
