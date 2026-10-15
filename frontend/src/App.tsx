import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { UploadModal } from './components/UploadModal';
import { OverviewTab } from './components/OverviewTab';
import { ForecastTab } from './components/ForecastTab';
import { CustomerTab } from './components/CustomerTab';
import { AnomalyTab } from './components/AnomalyTab';
import { AiCopilotTab } from './components/AiCopilotTab';
import { AiCopilotDrawer } from './components/AiCopilotDrawer';
import { fetchOverview, loadSampleData } from './api';
import { OverviewData } from './types';
import { Brain, Sparkles, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchOverview();
      setOverviewData(data);
    } catch (err: any) {
      console.error('Failed to load overview data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleResetSample = async () => {
    setIsLoading(true);
    try {
      await loadSampleData();
      await loadDashboardData();
      showToast('Sample retail dataset reloaded successfully (5,800+ transactions)');
    } catch (err: any) {
      showToast(`Error reloading sample: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = async () => {
    await loadDashboardData();
    setIsUploadOpen(false);
    showToast('Custom dataset parsed & synchronized across all ML engines!');
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 text-xs font-medium animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onLoadSample={handleResetSample}
        onToggleAiDrawer={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
        isAiDrawerOpen={isAiDrawerOpen}
        totalRecords={overviewData?.kpis.total_orders || 0}
        isLoading={isLoading}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewTab
            data={overviewData}
            onNavigateToCopilot={() => setActiveTab('ai-copilot')}
          />
        )}

        {activeTab === 'forecast' && (
          <ForecastTab categories={overviewData?.category_breakdown || []} />
        )}

        {activeTab === 'customers' && <CustomerTab />}

        {activeTab === 'anomalies' && <AnomalyTab />}

        {activeTab === 'ai-copilot' && <AiCopilotTab />}
      </main>

      {/* Upload CSV Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Global AI Copilot Slide-out Drawer */}
      <AiCopilotDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />

      {/* Platform Enterprise Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">RetailSense AI</span>
            <span>— Intelligent Sales, Customer & Demand Analytics Platform</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span>Scikit-Learn ML</span>
            </span>
            <span>•</span>
            <span>Holt-Winters Time-Series</span>
            <span>•</span>
            <span>RFM K-Means</span>
            <span>•</span>
            <span>Isolation Forest</span>
            <span>•</span>
            <span className="text-indigo-400 font-medium">Gemini GenAI</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
