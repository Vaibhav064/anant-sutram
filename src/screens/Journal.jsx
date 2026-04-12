import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Calendar, Search, X, Trash2, Tag, BookOpen, PenTool } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { apiFetch } from '../lib/api';

const PROMPTS = [
  "What's one thing that drained your energy today — and what restored it?",
  "Describe your mood right now as if it were weather.",
  "What would you tell a close friend who was feeling exactly what you're feeling?",
  "What's something you've been avoiding thinking about?",
  "If today were a chapter title in your life story, what would you call it?",
];

const TAGS = ['anxiety', 'gratitude', 'growth', 'relationships', 'self-care', 'work', 'stress', 'healing'];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function Journal() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useStore(s => s.user);

  const [view, setView] = useState('write'); // 'write' | 'history'
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [prompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [showInsight, setShowInsight] = useState(false);

  // History state
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const words = content.trim().split(/\s+/);
    setWordCount(content.trim() === '' ? 0 : words.length);
  }, [content]);

  const fetchEntries = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let path = '/api/journal';
      if (search.trim()) path += `?tab=search&q=${encodeURIComponent(search)}`;
      
      const res = await apiFetch(path);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries);
      }
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'history') {
      const delay = setTimeout(fetchEntries, 400);
      return () => clearTimeout(delay);
    }
  }, [view, search, user]);

  const handleSave = async () => {
    if (wordCount < 5 || !user) return;
    setSaving(true);
    try {
      const res = await apiFetch('/api/journal', {
        method: 'POST',
        body: JSON.stringify({ content, tags: selectedTags, currentPrompt: prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success('Journal saved securely');
        if (data.aiInsight) {
          setAiInsight(data.aiInsight);
          setShowInsight(true);
        } else {
          setContent('');
          setSelectedTags([]);
          setView('history');
        }
      }
    } catch {
      toast.error('Failed to save journal');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      const res = await apiFetch(`/api/journal/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Entry removed");
        setSelectedEntry(null);
        fetchEntries();
      }
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: 'var(--bg-app)' }}>
      
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 pt-12 pb-4 px-6 flex items-center justify-between" style={{ background: 'var(--bg-app)' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/home')} className="w-9 h-9 rounded-xl bg-surface border border-soft flex items-center justify-center text-sub hover:bg-surface2 transition-colors active:scale-90 shadow-sm">
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-[18px] font-bold text-main tracking-tight">Daily Journal</h1>
            <p className="text-[11px] text-muted font-semibold">{today}</p>
          </div>
        </div>

        <button
          onClick={() => setView(v => v === 'write' ? 'history' : 'write')}
          className="w-10 h-10 rounded-xl bg-surface border border-indigo-200 flex items-center justify-center text-indigo-700 transition-all hover:bg-indigo-50"
        >
          {view === 'write' ? <BookOpen size={18} /> : <PenTool size={18} />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ── Write View ── */}
        {view === 'write' && (
          <motion.div key="write" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex-1 flex flex-col px-6 pt-4">

            {/* Prompt Box */}
            <div className="bg-surface border border-subtle shadow-sm rounded-2xl p-5 mb-6 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-20 h-20 bg-indigo-100 opacity-20 rounded-full blur-xl" />
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                <Tag size={12} className="text-indigo-400" /> Suggestion
              </p>
              <p className="text-[15px] font-semibold text-sub leading-snug pr-4">{prompt}</p>
            </div>

            {/* Text Editor */}
            <div className="flex-1 flex flex-col bg-surface rounded-3xl p-5 border border-subtle shadow-sm mb-6 min-h-[300px]">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind today?"
                className="w-full h-full min-h-[250px] bg-transparent resize-none outline-none text-sub text-[16px] leading-relaxed placeholder:text-muted font-medium"
                spellCheck="false"
              />

              <div className="h-px w-full bg-surface2 my-4" />

              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <button key={tag} onClick={() => setSelectedTags(t => t.filter(x => x !== tag))}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg active:scale-95 transition-all">
                    #{tag} <X size={10} className="opacity-60" />
                  </button>
                ))}
                <button 
                  onClick={() => setShowTagPicker(!showTagPicker)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-muted bg-surface2 border border-soft px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all active:scale-95"
                >
                  <Tag size={10} /> Add Tag
                </button>
              </div>

              {showTagPicker && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 bg-surface2 border border-subtle rounded-xl flex flex-wrap gap-2">
                  {TAGS.filter(t => !selectedTags.includes(t)).map(tag => (
                    <button key={tag} onClick={() => { setSelectedTags(t => [...t, tag]); setShowTagPicker(false); }}
                      className="text-[11px] font-bold text-sub bg-surface border border-soft px-3 py-1.5 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-all">
                      {tag}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Bottom Floating Bar */}
            <div className="sticky bottom-0 left-0 right-0 pt-2 pb-6 px-1" style={{ background: 'var(--bg-app)' }}>
              <div className="flex justify-between items-center px-4 py-4 bg-surface border border-subtle rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Entry Length</span>
                  <span className="text-[14px] font-bold text-main">{wordCount} words</span>
                </div>

                {wordCount >= 5 ? (
                  <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-[13px] active:scale-[0.96] transition-all disabled:opacity-50 shadow-md flex items-center gap-2"
                  >
                    {saving ? 'Saving...' : 'Save Draft'}
                  </button>
                ) : (
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Keep writing</p>
                    <p className="text-[12px] font-bold text-muted">{5 - wordCount} words min</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── History View ── */}
        {view === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex-1 px-6 pt-4">

            {/* Search */}
            <div className="relative mb-6">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search past thoughts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface border border-soft rounded-2xl pl-11 pr-11 py-4 text-[14px] text-sub placeholder:text-muted focus:outline-none focus:border-[#C5D5F7] focus:ring-2 focus:ring-[#C5D5F7]/20 transition-all shadow-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sub hover:text-sub">
                  <X size={12} />
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-32 bg-surface rounded-[20px] animate-pulse shadow-sm border border-subtle" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-20 bg-surface border border-soft border-dashed rounded-[32px] mt-4 shadow-sm">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[24px]">📔</div>
                <p className="text-sub text-[16px] font-bold mb-1">{search ? 'No Match Found' : 'Clean Slate'}</p>
                <p className="text-muted text-[13px] font-medium px-10 mb-6">Start documenting your mental health journey today.</p>
                {!search && (
                  <button onClick={() => setView('write')} className="text-indigo-700 font-bold bg-indigo-50 px-5 py-2.5 rounded-xl text-[13px]">
                    Create First Entry
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4 pb-8">
                {entries.map((entry, idx) => (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedEntry(entry)}
                    className="bg-surface border border-subtle rounded-[24px] p-5 cursor-pointer hover:border-gray-300 hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                        <p className="text-muted text-[11px] font-bold uppercase tracking-widest">{formatDate(entry.createdAt)}</p>
                      </div>
                      <div className="flex gap-1.5 opacity-80">
                        {entry.tags?.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md uppercase">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sub text-[15px] font-medium leading-relaxed tracking-tight line-clamp-2 px-1">
                      {entry.content}
                    </p>
                    {entry.aiInsight?.text && (
                      <div className="mt-3 flex items-center gap-2 px-1">
                        <span className="text-[12px]">✨</span>
                        <p className="text-muted text-[12px] italic font-medium truncate">{entry.aiInsight.text}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AI Insight Modal (Saved successfully) ── */}
      <AnimatePresence>
        {showInsight && aiInsight && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 pb-12"
            onClick={() => { setShowInsight(false); setContent(''); setSelectedTags([]); setView('history'); }}
          >
            <motion.div
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface rounded-[32px] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden text-center"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/30 rounded-full blur-3xl" />
              <div className="w-16 h-16 rounded-[20px] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[28px] mx-auto mb-6">
                ✨
              </div>
              
              <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-3">AI Reflection</h3>
              <p className="text-sub text-[18px] font-medium leading-snug tracking-tight mb-8">
                "{aiInsight.insight}"
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {aiInsight.emotions?.map(emotion => (
                  <span key={emotion} className="bg-gray-100 text-sub text-[11px] font-bold px-3 py-1.5 rounded-lg uppercase">
                    {emotion}
                  </span>
                ))}
              </div>

              <button 
                onClick={() => { setShowInsight(false); setContent(''); setSelectedTags([]); setView('history'); }}
                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-[14px] active:scale-[0.98] transition-all"
              >
                Close & View Journal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Entry Detail Modal ── */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex flex-col justify-end"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface rounded-t-[40px] h-[85dvh] flex flex-col shadow-2xl"
            >
              <div className="w-14 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2" />
              
              <div className="flex justify-between items-center px-6 py-4 border-b border-subtle">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                     <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                     <p className="text-main font-bold text-[16px] tracking-tight">{formatDate(selectedEntry.createdAt)}</p>
                  </div>
                  <p className="text-muted text-[11px] font-bold uppercase tracking-widest">{selectedEntry.wordCount} Words</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDeleteEntry(selectedEntry._id)}
                    className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">
                    <Trash2 size={16} />
                  </button>
                  <button onClick={() => setSelectedEntry(null)}
                    className="w-10 h-10 rounded-xl bg-gray-100 text-sub flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-7 py-8">
                {selectedEntry.prompt && (
                  <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl mb-8">
                     <p className="text-indigo-900/50 text-[10px] font-bold uppercase tracking-widest mb-2">Prompt</p>
                     <p className="text-indigo-900 text-[15px] font-medium leading-relaxed italic pr-2">"{selectedEntry.prompt}"</p>
                  </div>
                )}
                
                <p className="text-sub text-[16px] leading-relaxed font-medium mb-10 whitespace-pre-line">
                  {selectedEntry.content}
                </p>
                
                {selectedEntry.aiInsight?.text && (
                  <div className="bg-indigo-50 border border-indigo-100/50 p-6 rounded-[24px]">
                    <div className="flex items-center gap-2 mb-3">
                       <span className="text-[18px]">✨</span>
                       <p className="text-[11px] font-bold text-indigo-900 uppercase tracking-widest">AI Insight</p>
                    </div>
                    <p className="text-main font-medium text-[15px] leading-relaxed italic">"{selectedEntry.aiInsight.text}"</p>
                    
                    <div className="flex flex-wrap gap-2 mt-5">
                       {selectedEntry.aiInsight?.emotions?.map(emo => (
                         <span key={emo} className="bg-surface text-sub border border-indigo-100 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-widest">
                           {emo}
                         </span>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
