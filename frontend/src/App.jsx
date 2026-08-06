import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UserPortal from './components/UserPortal';
import AgentConsole from './components/AgentConsole';
import AdminKBManager from './components/AdminKBManager';
import AnalyticsStudio from './components/AnalyticsStudio';
import { fetchSettings } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('user');
  const [systemSettings, setSystemSettings] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetchSettings();
        setSystemSettings(res);
      } catch (err) {
        console.error(err);
      }
    };
    loadSettings();
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemSettings={systemSettings}
      />

      {/* Main Tab View Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'user' && <UserPortal />}
        {activeTab === 'agent' && <AgentConsole />}
        {activeTab === 'admin' && <AdminKBManager />}
        {activeTab === 'analytics' && <AnalyticsStudio />}
      </main>

      {/* Enterprise Footer */}
      <footer className="glass-panel border-t border-slate-800/80 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div>
            AI Support Ticket Classification & Auto-Response System &copy; 2026 Enterprise Edition
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span>FastAPI + ML Classifier</span>
            <span>•</span>
            <span>RAG Knowledge Retrieval</span>
            <span>•</span>
            <span>PII Redaction Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
