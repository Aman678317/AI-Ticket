import React from 'react';
import { Cpu, Ticket, ShieldCheck, BookOpen, BarChart3, Sliders, Zap } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, systemSettings }) {
  const threshold = systemSettings?.CONFIDENCE_THRESHOLD_PERCENTAGE || "85%";
  const provider = systemSettings?.LLM_PROVIDER || "Smart RAG Engine";

  const navItems = [
    { id: 'user', label: 'Submit Ticket', icon: Ticket },
    { id: 'agent', label: 'Agent Console', icon: ShieldCheck, badge: 'Triage' },
    { id: 'admin', label: 'KB & Settings', icon: BookOpen },
    { id: 'analytics', label: 'AI Analytics', icon: BarChart3 },
  ];

  return (
    <header className="glass-panel sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg text-white tracking-tight">AI Ticket Classifier</h1>
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-2 py-0.5 rounded-full font-mono">
                  v1.0 Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400">RAG Response & Auto-Triage Platform</p>
            </div>
          </div>

          {/* System Mode & Confidence Badges */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Mode:</span>
              <span className="font-semibold text-emerald-400">{provider}</span>
            </div>

            <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">Auto-Send Threshold:</span>
              <span className="font-mono font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded">{threshold}</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

        </div>
      </div>
    </header>
  );
}
