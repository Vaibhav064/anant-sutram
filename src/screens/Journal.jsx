import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Trash2, Search, X, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { PageHeader } from '../components/layout/PageHeader';
import { CardSkeleton } from '../components/ui/Skeleton';

import { API_BASE, apiFetch } from '../lib/api';

const PROMPTS = [
  "What's one thing that drained your energy today — and what restored it?",
  "Describe your mood right now as if it were weather.",
  "What would you tell a close friend who was feeling exactly what you're feeling?",
  "What's something you've been avoiding thinking about?",
  "If today were a chapter title in your life story, what would you call it?",
  "What emotion have you been carrying silently this week?",
  "What do you need to hear right now that no one is saying?",
  "Describe one moment today when you felt fully like yourself.",
];

const TAGS = ['anxiety', 'gratitude', 'growth', 'relationships', 'self-care', 'work', 'family', 'healing'];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function Journal() {
  const toast = useToast();
  const user = useStore(s => s.user);
  const moodScore = useStore(s => s.moodScore);
  const getAuthHeader = useStore(s => s.getAuthHeader);

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
      if (search) path += `?search=${encodeURIComponent(search)}`;
      const res = await apiFetch(path);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch {
      toast.error('Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'history') fetchEntries();
  }, [view, search]);

  const generateAiInsight = async (text) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) return null;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: `You are a compassionate AI that analyzes journal entries. Read this journal entry and respond with ONLY a JSON object (no markdown) in this exact format: {"insight": "one warm, validating sentence about what you notice (max 30 words)", "emotions": ["emotion1", "emotion2", "emotion3"]}. Do not add anything else.\n\nJournal entry: ${text}` }]
          }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
        })
      });
      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = raw.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return { insight: "What you've written carries real depth and honesty.", emotions: ['reflection', 'awareness', 'courage'] };
    }
  };

  const handleSave = async () => {
    if (wordCount < 5) return;
    setSaving(true);

    try {
      const insight = await generateAiInsight(content);
      setAiInsight(insight);

      if (user) {
        const res = await apiFetch('/api/journal', {
          method: 'POST',
          body: JSON.stringify({
            content,
            prompt,
            tags: selectedTags,
            aiInsight: { text: insight?.insight || '', emotions: insight?.emotions || [] },
            moodScore,
          }),
        });
        if (!res.ok) throw new Error();
      }

      setShowInsight(true);
    } catch (err) {
      console.error('Journal save error:', err);
      toast.error('Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      const res = await apiFetch(`/api/journal/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setEntries(prev => prev.filter(e => e._id !== id));
      setSelectedEntry(null);
      toast.success('Entry deleted');
    } catch {
      toast.error('Failed to delete entry');
    }
  };

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-bg flex flex-col pb-nav">
      <PageHeader
        title="Journal"
        subtitle={view === 'write' ? today : `${entries.length} entries`}
        onBack={view === 'history' ? () => setView('write') : undefined}
        action={
          <button
            onClick={() => setView(v => v === 'write' ? 'history' : 'write')}
            className="flex items-center gap-1.5 text-[13px] text-primary font-semibold hover:opacity-80 transition-opacity"
          >
            {view === 'write' ? <><Calendar size={14} /> Past Entries</> : <><ChevronLeft size={14} /> Write</>}
          </button>
        }
      />

      <AnimatePresence mode="wait">
        {/* ── Write View ── */}
        {view === 'write' && (
          <motion.div key="write" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col px-5 pt-6">

            {/* Prompt card */}
            <div className="bg-gradient-to-br from-primary/15 to-secondary/10 border border-primary/20 rounded-2xl p-5 mb-6">
              <p className="text-[10px] font-black text-primary-light uppercase tracking-widest mb-2">✨ Today's prompt</p>
              <p className="text-[17px] font-semibold text-white leading-snug tracking-tight">{prompt}</p>
            </div>

            {/* Text area */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing, or just breathe..."
              className="w-full flex-1 min-h-[220px] bg-transparent resize-none outline-none text-white text-[17px] leading-relaxed placeholder:text-white/20 font-medium tracking-tight border-0 mb-4"
              spellCheck="false"
            />

            <div className="h-px w-full bg-white/5 mb-5" />

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {selectedTags.map(tag => (
                <button key={tag} onClick={() => setSelectedTags(t => t.filter(x => x !== tag))}
                  className="flex items-center gap-1 text-[11px] font-semibold text-primary-light bg-primary/15 border border-primary/25 px-2.5 py-1 rounded-full hover:bg-primary/25 transition-colors">
                  {tag} <X size={10} />
                </button>
              ))}
              <button onClick={() => setShowTagPicker(!showTagPicker)}
                className="flex items-center gap-1 text-[11px] font-semibold text-white/40 bg-white/5 border border-white/8 px-2.5 py-1 rounded-full hover:bg-white/10 transition-colors">
                <Tag size={10} /> Add tag
              </button>
            </div>

            {showTagPicker && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2 mb-5 p-4 bg-surface2 rounded-2xl border border-white/5">
                {TAGS.filter(t => !selectedTags.includes(t)).map(tag => (
                  <button key={tag} onClick={() => { setSelectedTags(t => [...t, tag]); setShowTagPicker(false); }}
                    className="text-[11px] font-semibold text-white/60 bg-white/5 border border-white/8 px-3 py-1.5 rounded-full hover:bg-primary/20 hover:text-primary-light hover:border-primary/30 transition-all">
                    {tag}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pb-4">
              <span className="text-[12px] text-white/20 font-medium">
                {wordCount > 0 ? `${wordCount} words` : 'Your thoughts are safe here'}
              </span>

              {wordCount >= 5 ? (
                <button onClick={handleSave} disabled={saving}
                  className="bg-primary text-white px-6 py-3 rounded-full text-[14px] font-bold btn-glow hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '✨ Save & Reflect'}
                </button>
              ) : (
                <span className="text-[12px] text-white/15">{Math.max(0, 5 - wordCount)} more words to save</span>
              )}
            </div>
          </motion.div>
        )}

        {/* ── History View ── */}
        {view === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex-1 px-5 pt-5">

            {/* Search */}
            <div className="relative mb-5">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search entries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface2 border border-white/6 rounded-2xl pl-11 pr-4 py-3 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:border-primary/40 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  <X size={14} />
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                <CardSkeleton /><CardSkeleton /><CardSkeleton />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-[48px] block mb-4">📓</span>
                <p className="text-white/40 text-[16px] font-medium mb-2">{search ? 'No entries found' : 'No entries yet'}</p>
                <p className="text-white/25 text-[14px]">{search ? 'Try a different search' : 'Start writing to see your journey here'}</p>
                {!search && <button onClick={() => setView('write')} className="mt-5 text-primary text-[14px] font-semibold">Write your first entry →</button>}
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedEntry(entry)}
                    className="bg-surface2 border border-white/6 rounded-2xl p-4 cursor-pointer hover:border-white/15 hover:bg-surface3 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-white/50 text-[11px] font-semibold">{formatDate(entry.createdAt)}</p>
                      <div className="flex gap-1.5">
                        {entry.tags?.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] font-bold text-primary-light bg-primary/15 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-white text-[14px] leading-relaxed font-medium line-clamp-2">{entry.content}</p>
                    {entry.aiInsight?.text && (
                      <p className="text-white/35 text-[12px] italic mt-2 line-clamp-1">✨ {entry.aiInsight.text}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AI Insight Modal ── */}
      <AnimatePresence>
        {showInsight && aiInsight && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowInsight(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-x-5 bottom-8 bg-surface2/95 backdrop-blur-2xl border border-primary/30 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[51]"
            >
              <button onClick={() => { setShowInsight(false); setContent(''); setSelectedTags([]); }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all">
                <X size={14} />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">✨</span>
                <span className="text-white font-bold text-[15px]">AI noticed:</span>
              </div>
              <p className="text-white/85 text-[15px] font-medium leading-relaxed mb-5 pr-4">
                "{aiInsight.insight}"
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {aiInsight.emotions?.map((emotion) => (
                  <span key={emotion} className="bg-primary/20 border border-primary/30 text-primary-light text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {emotion}
                  </span>
                ))}
              </div>
              <button onClick={() => { setShowInsight(false); setContent(''); setSelectedTags([]); setView('history'); }}
                className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-[14px] btn-glow hover:opacity-90 transition-all">
                View all entries
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Entry Detail Modal ── */}
      <AnimatePresence>
        {selectedEntry && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedEntry(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-x-0 bottom-0 h-[75dvh] bg-surface2 border-t border-white/8 rounded-t-3xl z-[51] flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-center p-5 border-b border-white/5">
                <div>
                  <p className="text-white/40 text-[12px] font-semibold">{formatDate(selectedEntry.createdAt)}</p>
                  <p className="text-white/60 text-[11px]">{selectedEntry.wordCount} words</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDeleteEntry(selectedEntry._id)}
                    className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors">
                    <Trash2 size={15} />
                  </button>
                  <button onClick={() => setSelectedEntry(null)}
                    className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10">
                    <X size={15} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                {selectedEntry.prompt && (
                  <p className="text-primary-light/70 text-[12px] italic mb-4 leading-relaxed">"{selectedEntry.prompt}"</p>
                )}
                <p className="text-white text-[16px] leading-relaxed font-medium">{selectedEntry.content}</p>
                {selectedEntry.aiInsight?.text && (
                  <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                    <p className="text-[10px] font-black text-primary-light uppercase tracking-widest mb-2">✨ AI Insight</p>
                    <p className="text-white/80 text-[14px] italic leading-relaxed">"{selectedEntry.aiInsight.text}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
