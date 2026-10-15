import React from 'react';
import {
  Brain,
  Upload,
  RefreshCw,
  Download,
  Sparkles,
  Database,
  BarChart3,
  TrendingUp,
  Users,
  ShieldAlert,
  Bot
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpload: () => void;
  onLoadSample: () => void;
  onToggleAiDrawer: () => void;
  isAiDrawerOpen: boolean;
  totalRecords: number;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onLoadSample,
  onToggleAiDrawer,
  isAiDrawerOpen,
  totalRecords,
  isLoading
}) => {
  const navTabs = [
    { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
    { id: 'forecast', label: 'Demand Forecasting', icon: TrendingUp },
    { id: 'customers', label: 'Customer RFM & Churn', icon: Users },
    { id: 'anomalies', label: 'Risk & Anomaly Radar', icon: ShieldAlert },
    { id: 'ai-copilot', label: 'AI Copilot Assistant', icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">RetailSense</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md">
                  AI Platform
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Intelligent Sales, Customer & Demand Analytics</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Dataset Pill */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>{totalRecords > 0 ? `${totalRecords.toLocaleString()} orders active` : 'Ready'}</span>
            </div>

            {/* Load Sample Data Button */}
            <button
              onClick={onLoadSample}
              disabled={isLoading}
              title="Reset with full sample dataset (5,800+ transactions)"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Load Sample</span>
            </button>

            {/* Download Sample CSV */}
            <a
              href="/api/download-sample-csv"
              download
              title="Download clean sample retail CSV"
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Sample CSV</span>
            </a>

            {/* Upload Dataset Button */}
            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV</span>
            </button>

            {/* AI Assistant Quick Toggle */}
            <button
              onClick={onToggleAiDrawer}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                isAiDrawerOpen
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span className="hidden sm:inline">Copilot Drawer</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
