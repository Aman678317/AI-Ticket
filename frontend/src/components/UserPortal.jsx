import React, { useState } from 'react';
import { Send, CheckCircle2, AlertTriangle, Clock, ShieldCheck, Sparkles, Star, FileText } from 'lucide-react';
import { submitTicket } from '../services/api';

export default function UserPortal() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [csatRating, setCsatRating] = useState(0);
  const [csatSubmitted, setCsatSubmitted] = useState(false);

  const samplePrompts = [
    {
      title: "Account Lockout",
      subject: "Locked out of account - reset password",
      desc: "I entered my password wrong three times this morning. Now it says my account is locked out. Email: demo.employee@company.com Phone: 555-019-2831"
    },
    {
      title: "Double Charge Refund",
      subject: "Charged twice for monthly invoice #INV-8821",
      desc: "Our credit card 4532-1100-8899-0021 was billed twice for invoice #INV-8821. Please issue a refund of $299."
    },
    {
      title: "Technical 403 Error",
      subject: "Custom API returning HTTP 403 Forbidden",
      desc: "Our internal webhooks are returning 403 Forbidden after the 2.0 release deployment. Request ID x-req-9921."
    },
    {
      title: "Vacation PTO Balance",
      subject: "Check remaining PTO vacation leave balance",
      desc: "How many vacation leave days do I have accrued for the remaining quarter?"
    }
  ];

  const handleSelectPrompt = (prompt) => {
    setSubject(prompt.subject);
    setDescription(prompt.desc);
    setResult(null);
    setCsatSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await submitTicket(subject, description);
      setResult(res);
      setCsatSubmitted(false);
      setCsatRating(0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Automated Triage System</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How can support help you today?
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl">
            Submit your support ticket below. Common inquiries (password resets, billing, leave balance) receive an <strong className="text-indigo-300">instant automated resolution</strong>. Complex issues are automatically routed to a support agent with highest priority.
          </p>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Try Sample Test Inquiries:</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPrompt(p)}
              className="glass-card p-3 rounded-xl text-left hover:border-indigo-500/40 group transition-all"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                {p.title}
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-1">{p.subject}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Submission Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Ticket Subject <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Unable to log into my enterprise portal account"
              className="w-[#100%] glass-input px-4 py-3 rounded-xl text-sm w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Full Description & Details <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact details of your request or error messages..."
              className="w-[#100%] glass-input px-4 py-3 rounded-xl text-sm w-full resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Automatic PII Redaction & Enterprise Security Active</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !subject.trim() || !description.trim()}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition-all text-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Classifying & Running RAG...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Ticket</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Submission Result Output */}
      {result && (
        <div className={`glass-panel p-6 sm:p-8 rounded-2xl border-2 transition-all ${
          result.auto_resolved ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-amber-500/40 bg-amber-950/10'
        }`}>
          {/* Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              {result.auto_resolved ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              )}

              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    result.auto_resolved 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {result.auto_resolved ? '⚡ Instant Resolution' : '⏳ Agent Queue Routing'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: {result.id}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{result.subject}</h3>
              </div>
            </div>

            {/* Confidence Badge */}
            <div className="text-right">
              <div className="text-xs text-slate-400">ML Confidence Score</div>
              <div className="text-xl font-extrabold font-mono text-indigo-300">
                {result.confidence_percentage}
              </div>
              <div className="text-[11px] text-slate-400">Intent: <strong className="text-slate-200">{result.category}</strong></div>
            </div>
          </div>

          {/* PII Redaction Warning Banner */}
          {result.pii_detected && (
            <div className="my-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3.5 flex items-center space-x-3 text-xs text-indigo-200">
              <AlertTriangle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <div>
                <strong>Security Guardrail Active:</strong> PII (email / credit card / phone) detected in your ticket text was redacted before AI model inference.
              </div>
            </div>
          )}

          {/* AI Response Preview */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Drafted Grounded Response</span>
              </span>
              <span>Source KB: <strong className="text-indigo-300">{result.source_kb_title}</strong></span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {result.response_text}
            </div>
          </div>

          {/* CSAT Feedback Rating Modal */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-300">Was this response helpful?</div>
            {csatSubmitted ? (
              <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you for rating! CSAT logged.</span>
              </span>
            ) : (
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => { setCsatRating(star); setCsatSubmitted(true); }}
                    className="p-1 text-slate-600 hover:text-amber-400 transition-colors"
                  >
                    <Star className={`w-5 h-5 ${star <= csatRating ? 'text-amber-400 fill-amber-400' : ''}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
