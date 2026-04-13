import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, X, Trash2, Tag, BookOpen, PenTool, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { apiFetch } from '../lib/api';

/* ─── Data ────────────────────────────────────────────────────── */
const PROMPT_SETS = [
  { text: "What's one thing that drained your energy today — and what restored it?", emoji: '🔋', color: '#E0F2FE', accent: '#0284C7' },
  { text: "Describe your mood right now as if it were weather.", emoji: '🌦️', color: '#FEF3C7', accent: '#D97706' },
  { text: "What would you tell a close friend feeling exactly what you feel?", emoji: '💌', color: '#FCE7F3', accent: '#DB2777' },
  { text: "What's something you've been avoiding thinking about?", emoji: '🪞', color: '#EDE9FE', accent: '#7C3AED' },
  { text: "If today were a chapter title in your life story, what would you call it?", emoji: '📖', color: '#D1FAE5', accent: '#059669' },
  { text: "What are three small things that made you feel grateful today?", emoji: '🌱', color: '#ECFDF5', accent: '#10B981' },
  { text: "Name an emotion you felt today you didn't expect.", emoji: '💫', color: '#FDF4FF', accent: '#9333EA' },
  { text: "What boundary do you need to set that you keep ignoring?", emoji: '🛡️', color: '#FFF7ED', accent: '#EA580C' },
];

const TAG_CONFIG = [
  { id: 'anxiety',      emoji: '😰', color: '#FEE2E2', textColor: '#991B1B' },
  { id: 'gratitude',    emoji: '🙏', color: '#D1FAE5', textColor: '#065F46' },
  { id: 'growth',       emoji: '🌱', color: '#ECFDF5', textColor: '#047857' },
  { id: 'relationships',emoji: '💕', color: '#FCE7F3', textColor: '#9D174D' },
  { id: 'self-care',    emoji: '🛁', color: '#EDE9FE', textColor: '#5B21B6' },
  { id: 'work',         emoji: '💼', color: '#FEF3C7', textColor: '#92400E' },
  { id: 'stress',       emoji: '🔥', color: '#FFF7ED', textColor: '#C2410C' },
  { id: 'healing',      emoji: '✨', color: '#F0FDF4', textColor: '#166534' },
];

const WORD_MILESTONES = [
  { words: 25,  label: 'Warming Up',    icon: '✍️' },
  { words: 50,  label: 'In the Flow',   icon: '🌊' },
  { words: 100, label: 'Deep Dive',     icon: '🌑' },
  { words: 200, label: 'Zone Unlocked', icon: '⚡' },
];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatDateLong(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

/* ─── Confetti burst ──────────────────────────────────────────── */
function ConfettiBurst({ show }) {
  if (!show) return null;
  const pieces = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 280,
    y: -(Math.random() * 260 + 80),
    rotate: Math.random() * 720 - 360,
    color: ['#7C3AED','#059669','#D97706','#DB2777','#0284C7','#F59E0B'][i % 6],
    size: Math.random() * 8 + 5,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-[100]">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate, scale: 0.3 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: p.size, height: p.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Word Progress Ring ─────────────────────────────────────── */
function WordRing({ words, target = 100 }) {
  const pct    = Math.min(words / target, 1);
  const r      = 22;
  const circ   = 2 * Math.PI * r;
  const milestone = [...WORD_MILESTONES].reverse().find(m => words >= m.words);
  const color  = words >= 200 ? '#7C3AED' : words >= 100 ? '#059669' : words >= 50 ? '#0284C7' : words >= 25 ? '#D97706' : '#CBD5E1';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-14 h-14">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={r} fill="none" stroke="#F1F5F9" strokeWidth="4" />
          <motion.circle
            cx="28" cy="28" r={r}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circ}
            animate={{ strokeDashoffset: circ * (1 - pct) }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[12px] font-black" style={{ color }}>{words}</span>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {milestone && (
          <motion.span
            key={milestone.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-[9px] font-black uppercase tracking-widest mt-1 text-center"
            style={{ color }}
          >
            {milestone.icon} {milestone.label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export function Journal() {
  const navigate = useNavigate();
  const toast    = useToast();
  const user     = useStore(s => s.user);

  const [view,          setView]          = useState('write');
  const [content,       setContent]       = useState('');
  const [promptIdx,     setPromptIdx]     = useState(() => Math.floor(Math.random() * PROMPT_SETS.length));
  const [selectedTags,  setSelectedTags]  = useState([]);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [aiInsight,     setAiInsight]     = useState(null);
  const [showInsight,   setShowInsight]   = useState(false);
  const [showConfetti,  setShowConfetti]  = useState(false);
  const [entries,       setEntries]       = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [search,        setSearch]        = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isFocused,     setIsFocused]     = useState(false);
  const [generatingInsightId, setGeneratingInsightId] = useState(null);
  const textareaRef = useRef(null);

  const generateRetroactiveInsight = async (entryId, entryContent) => {
    try {
      setGeneratingInsightId(entryId);
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key missing');

      const promptText = `Analyze this journal entry: "${entryContent}". Give a max 2-sentence empathetic insight (as 'text' property) and a 3-item array of primary emotions detected (as 'emotions' property). Return ONLY valid JSON in format: {"text":"...", "emotions":["...","...","..."]}. Do not use markdown blocks.`;
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: promptText }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 200, responseMimeType: "application/json" },
          }),
        }
      );
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Gemini API Error:', errorBody);
        throw new Error(`Google API returned ${response.status}`);
      }
      
      const resultData = await response.json();
      const rawText = resultData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (rawText) {
        let parsed;
        try {
          const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          parsed = JSON.parse(cleanedText);
        } catch (parseErr) {
          throw new Error('Failed to parse JSON response from AI');
        }

        const insightObj = { 
          text: parsed.text || 'A quiet moment of reflection.', 
          insight: parsed.text || 'A quiet moment of reflection.', 
          emotions: Array.isArray(parsed.emotions) ? parsed.emotions : [] 
        };

        const patchRes = await apiFetch(`/api/journal/${entryId}`, {
          method: 'PATCH',
          body: JSON.stringify({ aiInsight: insightObj })
        });
        
        if (patchRes.ok) {
          setEntries(prev => prev.map(e => e._id === entryId ? { ...e, aiInsight: insightObj } : e));
          if (selectedEntry?._id === entryId) {
            setSelectedEntry(prev => ({ ...prev, aiInsight: insightObj }));
          }
          toast.success("AI Insight generated ✨");
        } else {
          throw new Error('Failed to save insight to database');
        }
      } else {
         throw new Error('AI returned an empty response');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to generate insight');
    } finally {
      setGeneratingInsightId(null);
    }
  };

  const prompt    = PROMPT_SETS[promptIdx];
  const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
  const charCount = content.length;
  const today     = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  /* ── Fetch history ── */
  const fetchEntries = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const path = search.trim() ? `/api/journal?tab=search&q=${encodeURIComponent(search)}` : '/api/journal';
      const res  = await apiFetch(path);
      if (res.ok) { const d = await res.json(); setEntries(d.entries); }
    } catch { toast.error('Failed to load history'); }
    finally  { setLoading(false); }
  };

  useEffect(() => {
    if (view === 'history') {
      const t = setTimeout(fetchEntries, 350);
      return () => clearTimeout(t);
    }
  }, [view, search, user]);

  /* ── Save ── */
  const handleSave = async () => {
    if (wordCount < 5 || !user) return;
    setSaving(true);
    try {
      let generatedInsight = null;
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (apiKey) {
          const promptText = `Analyze this journal entry: "${content}". Give a max 2-sentence empathetic insight (as 'text' property) and a 3-item array of primary emotions detected (as 'emotions' property). Return ONLY valid JSON in format: {"text":"...", "emotions":["...","...","..."]}. Do not use markdown blocks.`;
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: promptText }] }],
                generationConfig: { 
                  temperature: 0.7, 
                  maxOutputTokens: 200,
                  responseMimeType: "application/json"
                },
              }),
            }
          );
          if (response.ok) {
            const resultData = await response.json();
            const rawText = resultData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              try {
                const parsed = JSON.parse(rawText.trim());
                // Store as both 'text' and 'insight' so existing UI code reads it safely
                generatedInsight = { text: parsed.text, insight: parsed.text, emotions: Array.isArray(parsed.emotions) ? parsed.emotions : [] };
              } catch (parseError) {
                console.error('Failed to parse Gemini JSON:', rawText, parseError);
              }
            } else {
              console.error('Gemini returned empty text structure', resultData);
            }
          } else {
            console.error('Gemini API call failed status:', response.status);
          }
        }
      } catch (err) {
        console.error('AI insight generation threw an error', err);
      }

      const res = await apiFetch('/api/journal', {
        method: 'POST',
        body: JSON.stringify({ content, tags: selectedTags, currentPrompt: prompt.text, aiInsight: generatedInsight }),
      });
      
      if (res.ok) {
        const data = await res.json();
        // The backend returns it in `data.entry.aiInsight`
        const finalInsight = data.entry?.aiInsight?.text ? data.entry.aiInsight : generatedInsight;
        // Make sure `insight` key exists for the modal UI
        if (finalInsight && !finalInsight.insight) finalInsight.insight = finalInsight.text;

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1400);
        toast.success('Entry saved ✨');
        
        if (finalInsight && finalInsight.text) {
          setAiInsight(finalInsight);
          setTimeout(() => setShowInsight(true), 600);
        } else {
          setTimeout(() => { setContent(''); setSelectedTags([]); setView('history'); }, 700);
        }
      }
    } catch { toast.error('Failed to save'); }
    finally  { setSaving(false); }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      const res = await apiFetch(`/api/journal/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Entry removed'); setSelectedEntry(null); fetchEntries(); }
    } catch { toast.error('Failed to delete'); }
  };

  /* ── Next prompt ── */
  const cyclePrompt = () => setPromptIdx(i => (i + 1) % PROMPT_SETS.length);

  /* ── Tag toggle ── */
  const toggleTag = (tagId) => {
    setSelectedTags(t => t.includes(tagId) ? t.filter(x => x !== tagId) : [...t, tagId]);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <ConfettiBurst show={showConfetti} />

      {/* ── Header ── */}
      <div
        className="sticky top-0 z-30 px-5 pt-12 pb-3 flex items-center justify-between"
        style={{ background: 'var(--bg-app)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/home')}
            className="w-9 h-9 rounded-[12px] bg-white border border-gray-200 flex items-center justify-center text-gray-500 active:scale-90 transition-all shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-[17px] font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
              Daily Journal
            </h1>
            <p className="text-[10px] font-bold" style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{today}</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-100 rounded-[12px] p-1 gap-1">
          {['write', 'history'].map(tab => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-[11px] font-black uppercase tracking-wider transition-all"
              style={{
                background: view === tab ? 'white' : 'transparent',
                color: view === tab ? '#1A1F36' : '#9CA3AF',
                boxShadow: view === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {tab === 'write' ? <PenTool size={11} /> : <BookOpen size={11} />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ═══════════════════════════════════════════════════════
            WRITE VIEW
        ═══════════════════════════════════════════════════════ */}
        {view === 'write' && (
          <motion.div
            key="write"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="flex-1 flex flex-col px-5 pt-4"
            style={{ paddingBottom: 'calc(200px + env(safe-area-inset-bottom, 0px))' }}
          >

            {/* ── Prompt card (tappable to cycle) ── */}
            <motion.button
              layout
              onClick={cyclePrompt}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left p-5 rounded-[24px] mb-5 relative overflow-hidden"
              style={{ background: prompt.color }}
            >
              <div className="absolute -right-5 -top-5 w-24 h-24 rounded-full opacity-20" style={{ background: prompt.accent }} />
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles size={10} style={{ color: prompt.accent }} />
                    <span className="text-[9px] font-black uppercase tracking-[0.15em]" style={{ color: prompt.accent }}>
                      Today's Prompt
                    </span>
                  </div>
                  <p className="text-[14px] font-semibold leading-snug pr-8" style={{ color: '#1A1F36' }}>
                    {prompt.text}
                  </p>
                </div>
                <div className="text-[26px] shrink-0 mt-0.5">{prompt.emoji}</div>
              </div>
              {/* Tap to refresh hint */}
              <div className="flex items-center gap-1.5 mt-3">
                <RefreshCw size={11} style={{ color: prompt.accent, opacity: 0.6 }} />
                <span className="text-[10px] font-bold opacity-60" style={{ color: prompt.accent }}>
                  Tap for new prompt
                </span>
              </div>
            </motion.button>

            {/* ── Text editor ── */}
            <motion.div
              layout
              animate={{
                boxShadow: isFocused
                  ? '0 0 0 2px rgba(124,58,237,0.25), 0 4px 20px rgba(0,0,0,0.06)'
                  : '0 1px 6px rgba(0,0,0,0.04)',
              }}
              className="flex-1 flex flex-col bg-white rounded-[28px] p-5 border mb-4 min-h-[240px]"
              style={{ borderColor: isFocused ? 'rgba(124,58,237,0.35)' : 'rgba(0,0,0,0.06)' }}
            >
              <textarea
                ref={textareaRef}
                value={content}
                onChange={e => setContent(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Let your thoughts flow freely…"
                className="w-full flex-1 min-h-[200px] bg-transparent resize-none outline-none text-[16px] leading-relaxed font-medium placeholder:text-gray-300"
                style={{ color: 'var(--text-sub)' }}
                spellCheck={false}
              />

              {/* Tag chips inside editor */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 mt-3">
                  {selectedTags.map(id => {
                    const cfg = TAG_CONFIG.find(t => t.id === id);
                    return (
                      <motion.button
                        key={id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={() => toggleTag(id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[11px] font-black active:scale-90 transition-all"
                        style={{ background: cfg.color, color: cfg.textColor }}
                      >
                        {cfg.emoji} #{id} <X size={9} className="opacity-60" />
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* ── Tag picker row ── */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2.5">
                <Tag size={11} className="text-gray-400" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tags</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {TAG_CONFIG.filter(t => !selectedTags.includes(t.id)).map(tag => (
                  <motion.button
                    key={tag.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleTag(tag.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[11px] font-bold border"
                    style={{
                      background: 'white',
                      borderColor: 'rgba(0,0,0,0.08)',
                      color: '#6B7280',
                    }}
                  >
                    {tag.emoji} {tag.id}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── Bottom action bar (sticky) ── */}
            <div
              className="fixed bottom-0 left-0 right-0 px-5 pt-3 z-20"
              style={{
                background: 'linear-gradient(to top, var(--bg-app) 70%, transparent)',
                paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))',
              }}
            >
              <div
                className="flex items-center gap-4 px-4 py-3.5 rounded-[22px] border"
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(16px)',
                  borderColor: 'rgba(0,0,0,0.07)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                }}
              >
                {/* Word count ring */}
                <WordRing words={wordCount} target={100} />

                {/* Chars */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Characters</p>
                  <p className="text-[15px] font-black" style={{ color: 'var(--text-main)' }}>{charCount}</p>
                </div>

                {/* Save button */}
                <AnimatePresence mode="wait">
                  {wordCount >= 5 ? (
                    <motion.button
                      key="save"
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.85, opacity: 0 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 rounded-[16px] text-white font-black text-[13px] disabled:opacity-60 shadow-md transition-all"
                      style={{
                        background: saving
                          ? '#9CA3AF'
                          : 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                        minWidth: 100,
                        justifyContent: 'center',
                      }}
                    >
                      {saving ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        >
                          <RefreshCw size={14} />
                        </motion.div>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          Save
                        </>
                      )}
                    </motion.button>
                  ) : (
                    <motion.div
                      key="hint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-right"
                    >
                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Keep going</p>
                      <p className="text-[13px] font-black text-gray-400">{5 - wordCount} more words</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════
            HISTORY VIEW
        ═══════════════════════════════════════════════════════ */}
        {view === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="flex-1 px-5 pt-4 pb-28"
          >

            {/* Search bar */}
            <div className="relative mb-5">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search your thoughts…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-[18px] pl-11 pr-10 py-3.5 text-[14px] font-medium focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all shadow-sm"
                style={{ color: 'var(--text-sub)' }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X size={12} className="text-gray-500" />
                </button>
              )}
            </div>

            {/* Content */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-28 bg-white rounded-[24px] animate-pulse border border-gray-100" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-[32px] mt-4"
              >
                <div className="text-[48px] mb-4">📔</div>
                <p className="font-black text-[17px] mb-1" style={{ color: 'var(--text-main)' }}>
                  {search ? 'No Match Found' : 'Your Story Starts Here'}
                </p>
                <p className="text-gray-400 text-[13px] font-medium px-12 mb-6">
                  {search ? 'Try different keywords.' : 'Start writing and this wall will fill with your journey.'}
                </p>
                {!search && (
                  <button
                    onClick={() => setView('write')}
                    className="text-white font-black px-6 py-3 rounded-[16px] text-[13px] shadow-md"
                    style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' }}
                  >
                    Write First Entry ✨
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry, idx) => {
                  const tags = entry.tags || [];
                  const preview = entry.content?.slice(0, 110);
                  return (
                    <motion.div
                      key={entry._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                      onClick={() => setSelectedEntry(entry)}
                      className="bg-white border border-gray-100 rounded-[24px] p-5 cursor-pointer active:scale-[0.98] transition-all"
                      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
                    >
                      {/* Top row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: '#7C3AED' }} />
                          <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                            {formatDate(entry.createdAt)}
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          {tags.slice(0, 2).map(id => {
                            const cfg = TAG_CONFIG.find(t => t.id === id) || { color: '#F3F4F6', textColor: '#6B7280', emoji: '' };
                            return (
                              <span
                                key={id}
                                className="text-[9px] font-black px-2 py-1 rounded-[7px] uppercase tracking-wider"
                                style={{ background: cfg.color, color: cfg.textColor }}
                              >
                                {cfg.emoji} {id}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Preview */}
                      <p className="text-[14px] font-medium leading-relaxed line-clamp-2" style={{ color: 'var(--text-sub)' }}>
                        {preview}{entry.content?.length > 110 ? '…' : ''}
                      </p>

                      {/* Word count + AI insight */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                            <Zap size={10} /> {entry.wordCount || 0} words
                          </span>
                          {entry.aiInsight?.text ? (
                            <span className="text-[10px] font-bold text-purple-400 flex items-center gap-1">
                              <Sparkles size={10} /> AI Insight
                            </span>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); generateRetroactiveInsight(entry._id, entry.content); }}
                              disabled={generatingInsightId === entry._id}
                              className={`text-[10px] font-bold flex items-center gap-1 transition-all ${
                                generatingInsightId === entry._id
                                  ? 'text-gray-300'
                                  : 'text-gray-400 hover:text-purple-500'
                              }`}
                            >
                              {generatingInsightId === entry._id ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                  <RefreshCw size={10} />
                                </motion.div>
                              ) : (
                                <Sparkles size={10} className="opacity-50" />
                              )}
                              {generatingInsightId === entry._id ? 'Generating...' : 'Get Insight'}
                            </button>
                          )}
                        </div>
                        <ChevronLeft size={14} className="rotate-180 text-gray-300" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
          AI INSIGHT MODAL
      ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showInsight && aiInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-end justify-center pb-8 px-4"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
            onClick={() => { setShowInsight(false); setContent(''); setSelectedTags([]); setView('history'); }}
          >
            <motion.div
              initial={{ y: 80, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-[36px] p-8 relative overflow-hidden"
              style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.20)' }}
            >
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full" style={{ background: 'rgba(124,58,237,0.08)' }} />

              {/* Icon */}
              <div className="w-16 h-16 rounded-[20px] flex items-center justify-center text-[30px] mx-auto mb-5"
                style={{ background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)' }}>
                ✨
              </div>

              <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] text-center mb-3">
                AI Reflection
              </p>
              <p className="text-[17px] font-semibold text-center leading-snug mb-6" style={{ color: 'var(--text-sub)' }}>
                "{aiInsight.insight}"
              </p>

              {/* Emotion chips */}
              {aiInsight.emotions?.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-7">
                  {aiInsight.emotions.map(emo => (
                    <span key={emo} className="bg-purple-50 text-purple-700 text-[10px] font-black px-3 py-1.5 rounded-[10px] uppercase tracking-wider">
                      {emo}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => { setShowInsight(false); setContent(''); setSelectedTags([]); setView('history'); }}
                className="w-full py-4 rounded-[20px] text-white font-black text-[14px] active:scale-[0.98] transition-all"
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' }}
              >
                View My Journal 📔
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
          ENTRY DETAIL SHEET
      ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex flex-col justify-end"
            style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-t-[40px] flex flex-col"
              style={{ maxHeight: '88dvh', boxShadow: '0 -8px 48px rgba(0,0,0,0.18)' }}
            >
              {/* Drag indicator */}
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-1 shrink-0" />

              {/* Sheet header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
                <div>
                  <p className="font-black text-[16px]" style={{ color: 'var(--text-main)' }}>
                    {formatDateLong(selectedEntry.createdAt)}
                  </p>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    {selectedEntry.wordCount} words
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteEntry(selectedEntry._id)}
                    className="w-10 h-10 rounded-[14px] bg-red-50 text-red-400 flex items-center justify-center active:scale-90 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="w-10 h-10 rounded-[14px] bg-gray-100 text-gray-500 flex items-center justify-center active:scale-90 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Sheet body */}
              <div className="flex-1 overflow-y-auto px-7 py-6">

                {/* Tags */}
                {selectedEntry.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {selectedEntry.tags.map(id => {
                      const cfg = TAG_CONFIG.find(t => t.id === id) || { color: '#F3F4F6', textColor: '#6B7280', emoji: '' };
                      return (
                        <span key={id} className="text-[11px] font-black px-3 py-1.5 rounded-[10px] uppercase tracking-wide"
                          style={{ background: cfg.color, color: cfg.textColor }}>
                          {cfg.emoji} {id}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Prompt */}
                {selectedEntry.prompt && (
                  <div className="rounded-[18px] p-5 mb-6" style={{ background: '#F5F3FF', border: '1px solid #EDE9FE' }}>
                    <p className="text-[9px] font-black text-purple-400 uppercase tracking-[0.15em] mb-2">Prompt</p>
                    <p className="text-[14px] font-medium italic leading-relaxed" style={{ color: '#5B21B6' }}>
                      "{selectedEntry.prompt}"
                    </p>
                  </div>
                )}

                {/* Content */}
                <p className="text-[16px] leading-relaxed font-medium mb-8 whitespace-pre-line" style={{ color: 'var(--text-sub)' }}>
                  {selectedEntry.content}
                </p>

                {/* AI Insight block */}
                {selectedEntry.aiInsight?.text ? (
                  <div className="rounded-[24px] p-6 mb-4" style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 100%)', border: '1px solid #DDD6FE' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[18px]">✨</span>
                      <p className="text-[10px] font-black text-purple-700 uppercase tracking-[0.15em]">AI Insight</p>
                    </div>
                    <p className="text-[15px] font-medium italic leading-relaxed mb-4" style={{ color: '#4C1D95' }}>
                      "{selectedEntry.aiInsight.text}"
                    </p>
                    {selectedEntry.aiInsight?.emotions?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.aiInsight.emotions.map(emo => (
                          <span key={emo} className="bg-white/70 text-purple-700 border border-purple-100 text-[10px] font-black px-2.5 py-1 rounded-[8px] uppercase tracking-wide">
                            {emo}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => generateRetroactiveInsight(selectedEntry._id, selectedEntry.content)}
                    disabled={generatingInsightId === selectedEntry._id}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-[20px] mb-4 text-[#5B21B6] font-bold border border-dashed border-[#DDD6FE] hover:bg-[#F5F3FF] transition-all disabled:opacity-50"
                  >
                    {generatingInsightId === selectedEntry._id ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                          <RefreshCw size={16} />
                        </motion.div>
                        Generating AI Insight...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Reveal AI Insight
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
