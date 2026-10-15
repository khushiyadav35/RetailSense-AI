import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Sliders,
  Calendar,
  Layers,
  Sparkles,
  Info,
  CheckCircle,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { fetchForecast } from '../api';
import { ForecastResponse, CategoryData } from '../types';

interface ForecastTabProps {
  categories: CategoryData[];
}

export const ForecastTab: React.FC<ForecastTabProps> = ({ categories }) => {
  const [horizonDays, setHorizonDays] = useState<number>(30);
  const [granularity, setGranularity] = useState<'daily' | 'weekly'>('daily');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [priceChangePct, setPriceChangePct] = useState<number>(0);
  const [marketingBoostPct, setMarketingBoostPct] = useState<number>(0);

  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchForecast({
        horizon_days: horizonDays,
        granularity,
        category: selectedCategory,
        price_change_pct: priceChangePct,
        marketing_boost_pct: marketingBoostPct
      });
      setForecastData(res);
    } catch (err: any) {
      setError(err.message || 'Error generating forecast');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [horizonDays, granularity, selectedCategory, priceChangePct, marketingBoostPct]);

  // Combine historical and forecast for unified timeline chart
  const chartPoints: any[] = [];
  if (forecastData) {
    forecastData.historical.forEach((h) => {
      chartPoints.push({
        date: h.date,
        actual: h.actual,
        forecast: null,
        simulated: null,
        upper_95: null,
        lower_95: null
      });
    });

    // Add forecast points
    forecastData.forecast.forEach((f) => {
      chartPoints.push({
        date: f.date,
        actual: null,
        forecast: f.forecast,
        simulated: f.simulated,
        upper_95: f.upper_95,
        lower_95: f.lower_95
      });
    });
  }

  const summary = forecastData?.summary;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Demand Forecasting & Scenario Simulator</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Time-series ML with confidence intervals and interactive price & promo elasticity modeling
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Horizon Selector */}
            <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              {[7, 14, 30, 60].map((days) => (
                <button
                  key={days}
                  onClick={() => setHorizonDays(days)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    horizonDays === days
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {days}D
                </button>
              ))}
            </div>

            {/* Granularity */}
            <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setGranularity('daily')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  granularity === 'daily' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setGranularity('weekly')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  granularity === 'weekly' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Weekly
              </button>
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="All Categories">All Categories</option>
              {categories.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* What-If Simulator Panel */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400">
              <Sliders className="w-4 h-4" />
              <span>Interactive "What-If" Scenario Sliders:</span>
            </div>
            <button
              onClick={() => {
                setPriceChangePct(0);
                setMarketingBoostPct(0);
              }}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              Reset to Baseline
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Change Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Catalog Price Adjustment</span>
                <span className={`font-mono font-bold ${priceChangePct > 0 ? 'text-emerald-400' : priceChangePct < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  {priceChangePct > 0 ? `+${priceChangePct}%` : `${priceChangePct}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                step="1"
                value={priceChangePct}
                onChange={(e) => setPriceChangePct(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>-20% (Volume Spike)</span>
                <span>Baseline (0%)</span>
                <span>+20% (Premium Margin)</span>
              </div>
            </div>

            {/* Promotion Boost Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Marketing / Promo Campaign Boost</span>
                <span className="font-mono font-bold text-indigo-400">+{marketingBoostPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={marketingBoostPct}
                onChange={(e) => setMarketingBoostPct(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Organic (0%)</span>
                <span>Moderate (+25%)</span>
                <span>Aggressive Surge (+50%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Callouts */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">Baseline Forecast ({summary.horizon_days}d)</span>
            <div className="text-xl font-bold text-white font-mono mt-1">
              ${summary.baseline_projected_revenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Statistical expected revenue</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">Simulated Outcome</span>
            <div className="text-xl font-bold text-cyan-400 font-mono mt-1">
              ${summary.simulated_projected_revenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">With price & promo adjustments</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">Net Revenue Delta</span>
            <div className={`text-xl font-bold font-mono mt-1 flex items-center ${summary.revenue_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {summary.revenue_delta >= 0 ? `+$${summary.revenue_delta.toLocaleString()}` : `-$${Math.abs(summary.revenue_delta).toLocaleString()}`}
              <span className="text-xs ml-1.5 font-normal">({summary.revenue_delta_pct > 0 ? `+${summary.revenue_delta_pct}%` : `${summary.revenue_delta_pct}%`})</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Scenario vs baseline</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">Model Accuracy Score</span>
            <div className="text-xl font-bold text-indigo-400 font-mono mt-1">
              {summary.model_accuracy_pct}%
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">RMSE: ${summary.rmse.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Main Forecast Chart with Confidence Intervals */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-semibold text-white">Demand Trajectory & 95% Confidence Band</h4>
            <p className="text-xs text-slate-400">Actual sales followed by model projection and scenario divergence</p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span>Actual History</span>
            </div>
            <div className="flex items-center space-x-1.5 text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <span>Baseline Forecast</span>
            </div>
            {(priceChangePct !== 0 || marketingBoostPct !== 0) && (
              <div className="flex items-center space-x-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span>Simulated Scenario</span>
              </div>
            )}
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartPoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              <Area
                type="monotone"
                dataKey="upper_95"
                name="Confidence Upper (95%)"
                stroke="transparent"
                fill="#6366f1"
                fillOpacity={0.12}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Sales"
                stroke="#94a3b8"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Baseline Forecast"
                stroke="#6366f1"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 2 }}
              />
              {(priceChangePct !== 0 || marketingBoostPct !== 0) && (
                <Line
                  type="monotone"
                  dataKey="simulated"
                  name="Simulated Scenario"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Level Breakdown */}
      {forecastData?.category_forecasts && (
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <h4 className="text-base font-semibold text-white">Projected Category Demand Breakdown</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {forecastData.category_forecasts.map((cf) => (
              <div key={cf.category} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{cf.category}</span>
                  <span className="text-[11px] font-mono text-indigo-400">{cf.share_pct}%</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  ${cf.projected_revenue.toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-400">Estimated demand in next {horizonDays} days</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
