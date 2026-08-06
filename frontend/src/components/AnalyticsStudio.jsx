import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Zap, Clock, Star, ShieldCheck, Activity, AlertCircle } from 'lucide-react';
import { fetchAnalytics } from '../services/api';

export default function AnalyticsStudio() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  if (!data) return <div className="text-center py-12 text-slate-400 text-xs">Loading analytics data...</div>;

  return (
    <div className="space-y-8">
      
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Stat 1 */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Auto-Resolution Rate</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-3 font-mono">{data.auto_resolution_rate}</div>
          <div className="flex items-center space-x-1 text-xs text-emerald-400 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Target: 60%+ (Beating SLA)</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Classifier Accuracy</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-3 font-mono">{data.classification_accuracy}</div>
          <div className="flex items-center space-x-1 text-xs text-indigo-400 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Target: ≥ 90% (Calibrated)</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">First Response Latency</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-3 font-mono">{data.avg_first_response_time}</div>
          <div className="flex items-center space-x-1 text-xs text-purple-400 mt-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Target: &lt; 3.0 seconds</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer CSAT</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-3 font-mono">{data.csat_score} <span className="text-sm font-sans text-slate-400">/ 5.0</span></div>
          <div className="flex items-center space-x-1 text-xs text-amber-400 mt-2">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>Target: ≥ 4.0 / 5</span>
          </div>
        </div>

      </div>

      {/* Category Performance Matrix */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>Intent Category Performance & Auto-Resolution Matrix</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Total Volume: {data.total_tickets} tickets</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Intent Category</th>
                <th className="pb-3 px-3 text-center">Total Volume</th>
                <th className="pb-3 px-3 text-center">Auto-Resolved</th>
                <th className="pb-3 px-3 text-right">Auto-Resolution %</th>
                <th className="pb-3 px-3 text-right">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.category_distribution.map((cat, idx) => {
                const autoRate = parseInt(cat.auto_resolution_rate);
                const isHealthy = autoRate >= 60;
                return (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-white">{cat.category_name}</td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-300">{cat.total_tickets}</td>
                    <td className="py-3.5 px-3 text-center font-mono text-emerald-400">{cat.auto_resolved}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-indigo-300">
                      {cat.auto_resolution_rate}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isHealthy 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {isHealthy ? (
                          <>
                            <Zap className="w-3 h-3" />
                            <span>High Self-Service</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" />
                            <span>Low KB Coverage</span>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
