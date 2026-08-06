import React, { useState, useEffect } from 'react';
import { Search, Filter, Shield, AlertTriangle, CheckCircle2, Send, Edit3, RefreshCw, FileText, User } from 'lucide-react';
import { fetchTickets, resolveTicket, fetchCategories } from '../services/api';

export default function AgentConsole() {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending_agent');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editableResponse, setEditableResponse] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolveSuccess, setResolveSuccess] = useState(false);

  const loadData = async () => {
    try {
      const data = await fetchTickets(filterStatus, filterCategory, searchQuery);
      setTickets(data);
      if (data.length > 0 && (!selectedTicket || !data.find(t => t.id === selectedTicket.id))) {
        setSelectedTicket(data[0]);
        setEditableResponse(data[0].latest_response || '');
        setSelectedCatId(data[0].category_id || '');
      }
      const catData = await fetchCategories();
      setCategories(catData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus, filterCategory, searchQuery]);

  const handleSelectTicket = (t) => {
    setSelectedTicket(t);
    setEditableResponse(t.latest_response || '');
    setSelectedCatId(t.category_id || '');
    setResolveSuccess(false);
  };

  const handleApproveAndSend = async () => {
    if (!selectedTicket) return;
    setIsResolving(true);
    try {
      await resolveTicket(selectedTicket.id, editableResponse, selectedCatId);
      setResolveSuccess(true);
      setTimeout(() => {
        loadData();
      }, 800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResolving(false);
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.85) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (score >= 0.70) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticket subject or keywords..."
              className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="glass-input px-3 py-2 rounded-xl text-xs font-semibold"
          >
            <option value="pending_agent" className="bg-slate-900 text-white">⏳ Pending Agent Review</option>
            <option value="auto_resolved" className="bg-slate-900 text-white">⚡ Auto-Resolved</option>
            <option value="resolved" className="bg-slate-900 text-white">✅ Resolved by Agent</option>
            <option value="all" className="bg-slate-900 text-white">All Tickets</option>
          </select>

          <button
            onClick={loadData}
            className="p-2 glass-card hover:bg-slate-800 rounded-xl text-slate-300 transition-colors"
            title="Refresh Queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Ticket Queue List (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-4 rounded-2xl space-y-3 max-h-[750px] overflow-y-auto">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Ticket Queue ({tickets.length})</span>
            <span>Sorted by Score</span>
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No tickets found for this filter view.
            </div>
          ) : (
            tickets.map((t) => {
              const isSelected = selectedTicket && selectedTicket.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTicket(t)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                      : 'glass-card border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono text-slate-400">{t.id}</span>
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] border ${getConfidenceColor(t.confidence_score)}`}>
                      {t.confidence_percentage} confidence
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white line-clamp-1">{t.subject}</h4>

                  <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
                    <span className="bg-slate-900 px-2 py-0.5 rounded text-indigo-300 font-medium">
                      {t.category_name}
                    </span>
                    {t.pii_detected && (
                      <span className="text-amber-400 flex items-center space-x-1 font-semibold">
                        <Shield className="w-3 h-3" />
                        <span>PII Redacted</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Split 2-Panel Detail & AI Review Desk (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl space-y-6">
          {!selectedTicket ? (
            <div className="text-center py-20 text-slate-400 text-sm">
              Select a ticket from the left queue to review and edit AI draft.
            </div>
          ) : (
            <>
              {/* Ticket Top Info */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 font-mono">Ticket #{selectedTicket.id}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      selectedTicket.status === 'auto_resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-white mt-1">{selectedTicket.subject}</h2>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Model Confidence</div>
                  <div className="text-2xl font-black font-mono text-indigo-400">
                    {selectedTicket.confidence_percentage}
                  </div>
                </div>
              </div>

              {/* Sub-Panel Grid: Original Text vs AI Draft Editor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Original Ticket Text & PII Audit */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>User Ticket Input</span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2 font-sans min-h-[220px]">
                    <p className="whitespace-pre-wrap">{selectedTicket.sanitized_description || selectedTicket.description}</p>
                  </div>

                  {selectedTicket.pii_detected && (
                    <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 text-[11px] text-amber-300 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>PII Redaction Guardrail applied before LLM inference.</span>
                    </div>
                  )}
                </div>

                {/* AI Draft & Editable Controls */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <span className="flex items-center space-x-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Editable AI Draft Response</span>
                    </span>
                  </div>

                  <textarea
                    rows={10}
                    value={editableResponse}
                    onChange={(e) => setEditableResponse(e.target.value)}
                    className="w-full glass-input p-4 rounded-xl text-xs font-mono text-slate-200 resize-none min-h-[220px]"
                  />
                </div>
              </div>

              {/* Category Re-assignment Dropdown */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Category Override (if AI misclassified):</span>
                  <span className="text-slate-400">Current: <strong className="text-indigo-300">{selectedTicket.category_name}</strong></span>
                </div>

                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name} ({c.description})
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2">
                {resolveSuccess ? (
                  <div className="flex items-center space-x-2 text-xs text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Response sent to customer! Ticket marked as Resolved.</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Human-in-the-Loop Agent Verification</span>
                )}

                <button
                  onClick={handleApproveAndSend}
                  disabled={isResolving || !editableResponse.trim()}
                  className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 text-xs transition-all"
                >
                  {isResolving ? (
                    <span>Sending Response...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Approve & Send Response</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
