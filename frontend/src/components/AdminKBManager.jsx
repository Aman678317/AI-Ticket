import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Save, BookOpen, CheckCircle2, RefreshCw, Sparkles, Layers } from 'lucide-react';
import { fetchCategories, saveCategory, fetchSettings, updateSetting } from '../services/api';

export default function AdminKBManager() {
  const [categories, setCategories] = useState([]);
  const [threshold, setThreshold] = useState(0.85);
  const [selectedCat, setSelectedCat] = useState(null);
  
  // Form fields for category/KB editing or creation
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [kbTitle, setKbTitle] = useState('');
  const [kbContent, setKbContent] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadData = async () => {
    try {
      const catData = await fetchCategories();
      setCategories(catData);
      if (catData.length > 0 && !selectedCat) {
        selectCategoryItem(catData[0]);
      }

      const settings = await fetchSettings();
      if (settings?.CONFIDENCE_THRESHOLD) {
        setThreshold(settings.CONFIDENCE_THRESHOLD);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectCategoryItem = (cat) => {
    setSelectedCat(cat);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setKbTitle(cat.kb_article?.title || '');
    setKbContent(cat.kb_article?.content || '');
    setSaveSuccess(false);
  };

  const handleNewCategory = () => {
    setSelectedCat(null);
    setCatName('');
    setCatDesc('');
    setKbTitle('');
    setKbContent('');
    setSaveSuccess(false);
  };

  const handleThresholdChange = async (e) => {
    const val = parseFloat(e.target.value);
    setThreshold(val);
    try {
      await updateSetting('CONFIDENCE_THRESHOLD', val);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!catName.trim() || !kbTitle.trim() || !kbContent.trim()) return;

    setIsSaving(true);
    try {
      await saveCategory(catName, catDesc, kbTitle, kbContent);
      setSaveSuccess(true);
      setTimeout(() => {
        loadData();
      }, 600);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Dynamic Threshold Settings */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-6 border-l-4 border-l-indigo-500">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>AI Confidence Auto-Resolution Guardrail</span>
          </div>
          <h3 className="text-lg font-bold text-white">System Confidence Threshold: {int(threshold * 100)}%</h3>
          <p className="text-xs text-slate-400">
            Tickets with an intent classification confidence score <strong className="text-emerald-300">at or above {int(threshold * 100)}%</strong> will be automatically resolved and emailed to the customer. Tickets below this threshold are routed to the Agent Review Queue.
          </p>
        </div>

        <div className="w-full sm:w-64 glass-card p-4 rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-mono font-bold text-slate-300">
            <span>50% (Conservative)</span>
            <span className="text-indigo-400">{int(threshold * 100)}%</span>
            <span>95% (Strict)</span>
          </div>
          <input
            type="range"
            min="0.50"
            max="0.95"
            step="0.05"
            value={threshold}
            onChange={handleThresholdChange}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Main Category & KB Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Category List (4 Cols) */}
        <div className="lg:col-span-4 glass-panel p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Intent Categories ({categories.length})</span>
            </span>

            <button
              onClick={handleNewCategory}
              className="flex items-center space-x-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-xs px-2.5 py-1 rounded-lg transition-colors font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {categories.map((c) => {
              const isSelected = selectedCat && selectedCat.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => selectCategoryItem(c)}
                  className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/50 text-white shadow-md'
                      : 'glass-card border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold">{c.name}</span>
                    <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-indigo-300 font-mono">
                      {c.ticket_count || 0} tickets
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{c.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: KB Article Editor (8 Cols) */}
        <form onSubmit={handleSave} className="lg:col-span-8 glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">
                {selectedCat ? `Edit KB: ${selectedCat.name}` : 'Create New Intent Category & KB Article'}
              </h3>
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/30 border border-emerald-500/20 px-3 py-1 rounded-full">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Auto Vector Vectorization Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Category Intent Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Account Access & SSO"
                className="w-full glass-input px-4 py-2.5 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Short Intent Description
              </label>
              <input
                type="text"
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="e.g. Password resets, MFA lockouts, login errors"
                className="w-full glass-input px-4 py-2.5 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Knowledge Base Article Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={kbTitle}
              onChange={(e) => setKbTitle(e.target.value)}
              placeholder="e.g. Self-Service Guide: Password Reset & Credentials FAQ"
              className="w-full glass-input px-4 py-2.5 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              RAG Knowledge Base Article Body (Grounding Context) <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={10}
              value={kbContent}
              onChange={(e) => setKbContent(e.target.value)}
              placeholder="Provide exact step-by-step instructions, links, and troubleshooting rules that the AI should use to draft responses..."
              className="w-full glass-input p-4 rounded-xl text-xs font-mono text-slate-200 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>KB Article saved and vector embeddings re-indexed!</span>
              </span>
            ) : (
              <span className="text-xs text-slate-400">Edits automatically recalculate ML centroids.</span>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 text-xs transition-all"
            >
              {isSaving ? (
                <span>Re-indexing Embeddings...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save & Re-Index Vector KB</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
