import React, { useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Percent,
  Users,
  AlertTriangle,
  Package,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { OverviewData } from '../types';

interface OverviewTabProps {
  data: OverviewData | null;
  onNavigateToCopilot: () => void;
}

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const OverviewTab: React.FC<OverviewTabProps> = ({ data, onNavigateToCopilot }) => {
  const [timeView, setTimeView] = useState<'monthly' | 'daily'>('monthly');

  if (!data || !data.kpis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Analytics Engine...</span>
        </div>
      </div>
    );
  }

  const { kpis, monthly_trends, recent_daily_trends, category_breakdown, top_products, channel_breakdown } = data;

  const chartData: any[] = timeView === 'monthly'
    ? monthly_trends.map((m) => ({ dateLabel: m.month, revenue: m.revenue, profit: m.profit }))
    : recent_daily_trends.map((d) => ({ dateLabel: d.date, revenue: d.revenue }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* AI Executive Quick Insight Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-cyan-950/60 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-indigo-950/20">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-300 flex-shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-white">RetailSense AI Executive Pulse</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                Live Insights
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Operating at a strong <strong className="text-emerald-400">{kpis.profit_margin}% margin</strong> with{' '}
              <strong className="text-indigo-300">{kpis.repeat_customer_rate}% repeat buyers</strong>. Top momentum observed in{' '}
              <strong className="text-cyan-300">{category_breakdown[0]?.category || 'Primary Category'}</strong> generating {category_breakdown[0]?.share}% of sales.
            </p>
          </div>
        </div>
        <button
          onClick={onNavigateToCopilot}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer flex-shrink-0"
        >
          <span>Ask AI Strategy</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Gross Revenue</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${kpis.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-xs">
            {kpis.mom_revenue_growth >= 0 ? (
              <span className="flex items-center text-emerald-400 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{kpis.mom_revenue_growth}%
              </span>
            ) : (
              <span className="flex items-center text-rose-400 font-medium">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                {kpis.mom_revenue_growth}%
              </span>
            )}
            <span className="text-slate-500">vs prev month</span>
          </div>
        </div>

        {/* Total Orders & AOV */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Orders & AOV</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {kpis.total_orders.toLocaleString()} <span className="text-xs font-normal text-slate-400">orders</span>
          </div>
          <div className="flex items-center space-x-2 mt-2 text-xs text-slate-400">
            <span>Avg Order Value:</span>
            <strong className="text-cyan-300 font-mono font-semibold">${kpis.average_order_value.toFixed(2)}</strong>
          </div>
        </div>

        {/* Operating Profit Margin */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Profit Margin</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {kpis.profit_margin}% <span className="text-xs font-normal text-emerald-400">healthy</span>
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-xs text-slate-400">
            <span>Total Units Sold:</span>
            <strong className="text-slate-200 font-mono">{kpis.total_units.toLocaleString()}</strong>
          </div>
        </div>

        {/* Customer Base & Repeat Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Customer Loyalty</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {kpis.repeat_customer_rate}% <span className="text-xs font-normal text-purple-300">repeat</span>
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-xs text-slate-400">
            <span>Total Unique Accounts:</span>
            <strong className="text-slate-200 font-mono">{kpis.total_customers.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Main Revenue Trend Chart */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-semibold text-white">Sales & Revenue Trajectory</h4>
            <p className="text-xs text-slate-400">Historical performance with profit margins over time</p>
          </div>
          <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setTimeView('monthly')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                timeView === 'monthly' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly View
            </button>
            <button
              onClick={() => setTimeView('daily')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                timeView === 'daily' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Last 60 Days
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="dateLabel"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => (timeView === 'monthly' ? val : String(val).slice(5))}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px'
                }}
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Gross Sales"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              {timeView === 'monthly' && (
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Net Margin"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Middle Row: Category Breakdown & Channel Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Contribution */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-semibold text-white">Category Revenue Share</h4>
              <p className="text-xs text-slate-400">Contribution per department</p>
            </div>
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="space-y-3">
            {category_breakdown.map((cat, idx) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{cat.category}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-white font-semibold">${cat.revenue.toLocaleString()}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">{cat.share}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.share}%`,
                      backgroundColor: COLORS[idx % COLORS.length]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Distribution */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-semibold text-white">Sales Channel Mix</h4>
              <p className="text-xs text-slate-400">Omnichannel order volume & revenue</p>
            </div>
            <Package className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {channel_breakdown.map((ch, idx) => (
              <div key={ch.channel} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">{ch.channel}</span>
                <p className="text-base font-bold text-white font-mono">${ch.revenue.toLocaleString()}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{ch.orders.toLocaleString()} orders</span>
                  <span className="text-cyan-400 font-semibold">{ch.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Top 10 High Velocity SKUs */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-semibold text-white">Top 10 High Velocity Products</h4>
            <p className="text-xs text-slate-400">Revenue leaders and volume drivers across all channels</p>
          </div>
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">Product Name</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold text-right">Units Sold</th>
                <th className="pb-3 font-semibold text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {top_products.map((p, idx) => (
                <tr key={p.product} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 font-medium text-slate-200 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{p.product}</span>
                  </td>
                  <td className="py-3 text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/50 text-[11px]">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono text-slate-300">{p.units.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono font-semibold text-emerald-400">
                    ${p.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
