import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowRight, Flame, Sparkles, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';

import { API_BASE, apiFetch } from '../lib/api';

const MOOD_STATES = [
  { score: 1, emoji: '😰', label: 'Struggling', color: '#F87171', bg: 'rgba(248,113,113,0.15)' },
  { score: 3, emoji: '😔', label: 'Low', color: '#FB923C', bg: 'rgba(251,146,60,0.15)' },
  { score: 5, emoji: '😐', label: 'Neutral', color: '#FBBF24', bg: 'rgba(251,191,36,0.15)' },
  { score: 7, emoji: '🙂', label: 'Good', color: '#34D399', bg: 'rgba(52,211,153,0.15)' },
  { score: 9, emoji: '🌟', label: 'Thriving', color: '#A899FF', bg: 'rgba(168,153,255,0.15)' },
];

const QUICK_ACTIONS = [
  { id: 'chat', label: 'AI Chat', icon: '🧠', path: '/chat', gradient: 'from-violet-500/25 to-indigo-500/15', border: 'border-violet-500/20' },
  { id: 'meditate', label: 'Meditate', icon: '🪴', path: '/meditate', gradient: 'from-teal/25 to-emerald-500/15', border: 'border-teal/20' },
  { id: 'journal', label: 'Journal', icon: '📔', path: '/journal', gradient: 'from-amber-500/25 to-orange-500/15', border: 'border-amber-500/20' },
  { id: 'healers', label: 'Healers', icon: '🧘‍♀️', path: '/healers', gradient: 'from-secondary/25 to-pink-500/15', border: 'border-secondary/20' },
  { id: 'sos', label: 'SOS', icon: '🆘', path: '/sos', gradient: 'from-red-500/20 to-rose-500/10', border: 'border-red-500/25', isAlert: true },
];

function getMoodState(score) {
  if (score <= 2) return MOOD_STATES[0];
  if (score <= 4) return MOOD_STATES[1];
  if (score <= 6) return MOOD_STATES[2];
  if (score <= 8) return MOOD_STATES[3];
  return MOOD_STATES[4];
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Still up?';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

export function Home() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useStore(s => s.user);
  const getDisplayName = useStore(s => s.getDisplayName);
  const getFirstName = useStore(s => s.getFirstName);
  const moodScore = useStore(s => s.moodScore);
  const setMood = useStore(s => s.setMood);
  const getAuthHeader = useStore(s => s.getAuthHeader);

  const firstName = getFirstName?.() || 'Wanderer';
  const streak = user?.currentStreak || 0;
  const [contextNote, setContextNote] = useState('');
  const [hasCheckedIn, setHasCheckedIn] = useState(!!moodScore);
  const [saving, setSaving] = useState(false);
  const [sliderVal, setSliderVal] = useState(5);
  const [anxietyProgress, setAnxietyProgress] = useState(null);

  const currentMoodState = getMoodState(sliderVal);
  const savedMoodState = moodScore ? getMoodState(moodScore) : null;

  // Fetch anxiety reset progress for the card
  useEffect(() => {
    if (!user) return;
    apiFetch('/api/anxiety-reset/progress').then(r => r.json()).then(d => {
      if (d.progress) setAnxietyProgress(d.progress);
    }).catch(() => {});
  }, [user]);

  const handleSaveMood = async () => {
    setSaving(true);
    try {
      const moodState = getMoodState(sliderVal);

      if (user) {
        const res = await apiFetch('/api/mood', {
          method: 'POST',
          body: JSON.stringify({ score: sliderVal, note: contextNote, emoji: moodState.emoji }),
        });
        if (!res.ok) throw new Error();
      }

      setMood(sliderVal);
      setHasCheckedIn(true);
      toast.success('Mood saved ✨');
    } catch {
      // Still save locally even if API fails
      setMood(sliderVal);
      setHasCheckedIn(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg pb-nav">


      {/* ── Hero Header ── */}
      <div className="px-5 pt-12 pb-2 flex justify-between items-start">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-white/40 text-[13px] font-medium mb-1">{getTimeGreeting()}</p>
          <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">
            {firstName}
          </h1>
          <div className="mt-2.5 inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
            <Flame size={13} className="text-amber-400" />
            <span className="text-[12px] text-amber-300 font-semibold">{streak} day streak</span>
          </div>
        </motion.div>

        <button
          onClick={() => navigate('/profile')}
          className="w-12 h-12 rounded-full overflow-hidden border border-white/10 flex items-center justify-center font-bold text-white text-lg shadow-glow-primary hover:scale-105 transition-transform"
          style={{ background: user?.photoUrl ? 'transparent' : 'linear-gradient(135deg, rgba(124,106,245,0.4), rgba(192,132,252,0.4))' }}
        >
          {user?.photoUrl
            ? <img src={user.photoUrl} alt="avatar" className="w-full h-full object-cover" />
            : (user?.name || user?.nickname || '?').charAt(0).toUpperCase()
          }
        </button>
      </div>

      {/* ── Mood Check-In ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-5 mt-5"
      >
        <Card variant="elevated" className="p-5 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!hasCheckedIn ? (
              <motion.div key="checkin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-white/50 text-[12px] font-semibold uppercase tracking-widest mb-4">Today's check-in</p>
                <h2 className="text-[17px] font-semibold text-white mb-6 tracking-tight">How are you feeling right now?</h2>

                {/* Emoji Row */}
                <div className="flex justify-between items-center mb-5 px-2">
                  {MOOD_STATES.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSliderVal(s.score)}
                      className={`text-[28px] transition-all duration-200 ${Math.abs(sliderVal - s.score) < 1.5 ? 'scale-125 opacity-100' : 'scale-90 opacity-40'}`}
                    >
                      {s.emoji}
                    </button>
                  ))}
                </div>

                {/* Animated label */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMoodState.label}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-center mb-4"
                  >
                    <span
                      className="text-[13px] font-semibold px-3 py-1 rounded-full"
                      style={{ color: currentMoodState.color, background: currentMoodState.bg }}
                    >
                      {currentMoodState.label}
                    </span>
                  </motion.div>
                </AnimatePresence>

                {/* Slider */}
                <input
                  type="range" min="1" max="10" step="0.5"
                  value={sliderVal}
                  onChange={(e) => setSliderVal(Number(e.target.value))}
                  className="w-full mb-5 cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${currentMoodState.color} ${(sliderVal - 1) * 11.1}%, rgba(255,255,255,0.08) ${(sliderVal - 1) * 11.1}%)`
                  }}
                />

                {/* Note + Save */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="What's on your mind? (optional)"
                    value={contextNote}
                    onChange={(e) => setContextNote(e.target.value)}
                    className="flex-1 bg-bg border border-white/6 rounded-2xl px-4 py-2.5 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:border-primary/40 transition-colors"
                    maxLength={100}
                  />
                  <button
                    onClick={handleSaveMood}
                    disabled={saving}
                    className="bg-primary text-white px-5 py-2.5 rounded-2xl text-[14px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5 btn-glow shrink-0"
                  >
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-5 py-2">
                <span className="text-[48px] drop-shadow-sm">{savedMoodState?.emoji}</span>
                <div>
                  <p className="text-white font-semibold text-[17px] tracking-tight mb-1">Check-in complete ✓</p>
                  <p className="text-white/40 text-[13px]">Feeling <span style={{ color: savedMoodState?.color }}>{savedMoodState?.label}</span> · {moodScore}/10</p>
                </div>
                <button onClick={() => setHasCheckedIn(false)} className="ml-auto text-white/20 hover:text-white/50 text-xs">Edit</button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-7 px-5"
      >
        <p className="text-white/30 text-[11px] font-bold uppercase tracking-widest mb-4">Quick Access</p>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {QUICK_ACTIONS.map((a, i) => (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 + i * 0.06 }}
              onClick={() => navigate(a.path)}
              className={`snap-center shrink-0 w-[88px] flex flex-col items-center justify-center bg-gradient-to-br ${a.gradient} border ${a.border} rounded-3xl py-5 px-2 transition-all duration-200 active:scale-95 hover:brightness-110`}
            >
              <span className="text-[28px] mb-2.5">{a.icon}</span>
              <span className={`text-[11px] font-semibold tracking-tight ${a.isAlert ? 'text-red-400' : 'text-white/80'}`}>{a.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── 21-Day Reset Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mx-5 mt-6"
      >
        <div
          onClick={() => navigate('/anxiety-reset')}
          className="relative rounded-3xl overflow-hidden cursor-pointer group border border-primary/25 bg-gradient-to-br from-primary/20 via-surface2 to-secondary/10"
          style={{ boxShadow: '0 8px 40px rgba(124,106,245,0.15)' }}
        >
          {/* Glow overlay */}
          <div className="absolute -right-12 -bottom-12 w-52 h-52 bg-secondary/20 rounded-full blur-3xl" />

          <div className="relative z-10 p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black text-primary-light uppercase tracking-[0.2em] bg-primary/20 px-2.5 py-0.5 rounded-full border border-primary/30">
                {anxietyProgress ? `Day ${anxietyProgress.currentDay} / 21` : '21 Days'}
              </span>
              {anxietyProgress?.planPurchased && (
                <span className="text-[10px] font-black text-gold uppercase tracking-wider bg-gold/15 px-2 py-0.5 rounded-full border border-gold/25">
                  ✦ Premium
                </span>
              )}
            </div>
            <h2 className="text-white font-bold text-[22px] tracking-tight leading-tight mb-4 max-w-[65%]">
              Anxiety Reset<br/>Program
            </h2>
            {anxietyProgress ? (
              <div className="mb-5">
                <div className="flex justify-between text-[11px] text-white/40 mb-1.5">
                  <span>Progress</span>
                  <span>{Math.round(((anxietyProgress.currentDay - 1) / 21) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((anxietyProgress.currentDay - 1) / 21) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  />
                </div>
              </div>
            ) : null}
            <button className="glass-light text-white rounded-full px-5 py-2.5 text-[13px] font-semibold flex items-center gap-2 hover:bg-white/10 transition-all group-hover:gap-3">
              {anxietyProgress ? 'Continue Journey' : 'Start Program'}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="absolute right-4 bottom-4 text-[80px] leading-none opacity-20 group-hover:opacity-30 transition-opacity">
            🌿
          </div>
        </div>
      </motion.div>

      {/* ── AI Insight Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mx-5 mt-5 mb-6"
      >
        <Card variant="elevated" className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-primary-light" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">AI Insight</span>
          </div>
          <p className="text-white text-[15px] leading-[1.65] mb-4 font-medium">
            "Your mood entries suggest you feel most centered in the mornings. Consider scheduling your most challenging tasks then."
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="text-primary text-[13px] font-semibold flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            Explore with AI <ChevronRight size={14} />
          </button>
        </Card>
      </motion.div>
    </div>
  );
}
