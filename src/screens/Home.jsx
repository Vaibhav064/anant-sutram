import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Flame, PenLine, ChevronRight } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../lib/api';
import { RadarChart, RadarLegend } from '../components/ui/RadarChart';
import { EmojiBubbleTimeline } from '../components/ui/EmojiBubbleTimeline';
import { ASSESSMENTS } from '../lib/assessmentData';

/* ─── Premium SVG Icon Components ─────────────────────────────── */

function JournalIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Book shadow/depth */}
      <rect x="10" y="7" width="24" height="31" rx="4" fill="rgba(109,40,217,0.10)" />
      {/* Book cover */}
      <rect x="8" y="5" width="24" height="31" rx="4" fill="rgba(167,139,250,0.18)" stroke="rgba(139,92,246,0.52)" strokeWidth="1.4" />
      {/* Spine */}
      <rect x="8" y="5" width="5.5" height="31" rx="4" fill="rgba(139,92,246,0.35)" />
      <rect x="11" y="5" width="2.5" height="31" fill="rgba(109,40,217,0.15)" />
      {/* Page lines */}
      <rect x="17" y="13" width="12" height="1.6" rx="0.8" fill="rgba(109,40,217,0.55)" />
      <rect x="17" y="18" width="9" height="1.6" rx="0.8" fill="rgba(109,40,217,0.42)" />
      <rect x="17" y="23" width="11" height="1.6" rx="0.8" fill="rgba(109,40,217,0.36)" />
      <rect x="17" y="28" width="7" height="1.6" rx="0.8" fill="rgba(109,40,217,0.28)" />
      {/* Ribbon bookmark */}
      <path d="M26 5 L33 5 L33 16 L29.5 13 L26 16 Z" fill="rgba(167,139,250,0.88)" />
      {/* Small star on ribbon */}
      <circle cx="29.5" cy="9" r="1.2" fill="rgba(255,255,255,0.75)" />
    </svg>
  );
}

function LuminaIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Outer glow ring */}
      <circle cx="22" cy="21" r="14" fill="rgba(52,211,153,0.08)" stroke="rgba(52,211,153,0.22)" strokeWidth="1.2" />
      {/* Leaf - main */}
      <path d="M22 7 C15 7 10 14 13 21 C16 28 22 30 22 30 C22 30 28 28 31 21 C34 14 29 7 22 7 Z"
        fill="rgba(52,211,153,0.30)" stroke="rgba(16,185,129,0.68)" strokeWidth="1.4" />
      {/* Central vein */}
      <path d="M22 9 L22 29.5" stroke="rgba(16,185,129,0.58)" strokeWidth="1.2" strokeLinecap="round" />
      {/* Side veins */}
      <path d="M22 16 C22 16 17 17.5 15 20" stroke="rgba(16,185,129,0.38)" strokeWidth="1" strokeLinecap="round" />
      <path d="M22 16 C22 16 27 17.5 29 20" stroke="rgba(16,185,129,0.38)" strokeWidth="1" strokeLinecap="round" />
      <path d="M22 22 C22 22 17 23 15 25" stroke="rgba(16,185,129,0.28)" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M22 22 C22 22 27 23 29 25" stroke="rgba(16,185,129,0.28)" strokeWidth="0.9" strokeLinecap="round" />
      {/* Stem */}
      <path d="M22 30 L22 36" stroke="rgba(16,185,129,0.55)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 36 C22 36 19 38 17 37" stroke="rgba(16,185,129,0.38)" strokeWidth="1.2" strokeLinecap="round" />
      {/* Sparkles */}
      <circle cx="33" cy="9" r="2.2" fill="rgba(52,211,153,0.90)" />
      <circle cx="10" cy="11" r="1.6" fill="rgba(52,211,153,0.72)" />
      <circle cx="34" cy="27" r="1.2" fill="rgba(52,211,153,0.58)" />
      {/* Small cross sparkle */}
      <path d="M7 20 L7 24 M5 22 L9 22" stroke="rgba(52,211,153,0.45)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function MeditationIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Outer aura ring */}
      <circle cx="22" cy="16" r="13" fill="rgba(251,113,133,0.06)" stroke="rgba(244,63,94,0.16)" strokeWidth="1.2" strokeDasharray="2.5 3.5" />
      {/* Inner aura */}
      <circle cx="22" cy="16" r="9" fill="rgba(251,113,133,0.08)" />
      {/* Head */}
      <circle cx="22" cy="11" r="4.5" fill="rgba(251,113,133,0.48)" stroke="rgba(244,63,94,0.58)" strokeWidth="1.3" />
      {/* Body in lotus */}
      <path d="M22 15.5 C22 15.5 16 20 15 26 C15 28 17.5 29.5 22 29.5 C26.5 29.5 29 28 29 26 C28 20 22 15.5 22 15.5Z"
        fill="rgba(251,113,133,0.32)" stroke="rgba(244,63,94,0.52)" strokeWidth="1.3" />
      {/* Left arm + knee */}
      <path d="M15 24 C10 22.5 8 27 14 29" stroke="rgba(244,63,94,0.58)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Right arm + knee */}
      <path d="M29 24 C34 22.5 36 27 30 29" stroke="rgba(244,63,94,0.58)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Ground shadow */}
      <ellipse cx="22" cy="33" rx="11" ry="2.5" fill="rgba(251,113,133,0.18)" />
      {/* Lotus petals */}
      <path d="M15 31 C12 29 13 26 16.5 28.5" fill="rgba(251,113,133,0.40)" />
      <path d="M29 31 C32 29 31 26 27.5 28.5" fill="rgba(251,113,133,0.40)" />
      {/* Crown dot */}
      <circle cx="22" cy="5.5" r="1.5" fill="rgba(244,63,94,0.55)" />
    </svg>
  );
}

function AssessmentIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Brain wave at top */}
      <path d="M7 9 C9 7 11 11 13 9 C15 7 17 11 19 9 C21 7 23 11 25 9 C27 7 29 11 31 9 C33 7 35 11 37 9"
        stroke="rgba(99,102,241,0.30)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Chart bars */}
      <rect x="7" y="28" width="7" height="11" rx="2.5" fill="rgba(99,102,241,0.32)" />
      <rect x="18" y="18" width="7" height="21" rx="2.5" fill="rgba(99,102,241,0.62)" />
      <rect x="29" y="22" width="8" height="17" rx="2.5" fill="rgba(99,102,241,0.48)" />
      {/* Trend line */}
      <path d="M10.5 30 L21.5 18.5 L33 23" stroke="rgba(99,102,241,0.92)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Dots on trend */}
      <circle cx="10.5" cy="30" r="2.5" fill="white" stroke="rgba(99,102,241,0.92)" strokeWidth="1.6" />
      <circle cx="21.5" cy="18.5" r="2.5" fill="white" stroke="rgba(99,102,241,0.92)" strokeWidth="1.6" />
      <circle cx="33" cy="23" r="2.5" fill="white" stroke="rgba(99,102,241,0.92)" strokeWidth="1.6" />
    </svg>
  );
}

function HealerIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Left person */}
      <circle cx="13" cy="10" r="4.5" fill="rgba(251,146,60,0.48)" stroke="rgba(234,88,12,0.58)" strokeWidth="1.3" />
      <path d="M8 24 C8 18 13 16 13 16 C13 16 18 18 18 24" fill="rgba(251,146,60,0.28)" stroke="rgba(234,88,12,0.48)" strokeWidth="1.2" />
      {/* Right person */}
      <circle cx="31" cy="10" r="4.5" fill="rgba(251,146,60,0.48)" stroke="rgba(234,88,12,0.58)" strokeWidth="1.3" />
      <path d="M26 24 C26 18 31 16 31 16 C31 16 36 18 36 24" fill="rgba(251,146,60,0.28)" stroke="rgba(234,88,12,0.48)" strokeWidth="1.2" />
      {/* Hands reaching toward center heart */}
      <path d="M18 23 C19.5 25.5 21 25.5 22 25.5" stroke="rgba(234,88,12,0.60)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M26 23 C24.5 25.5 23 25.5 22 25.5" stroke="rgba(234,88,12,0.60)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Heart center */}
      <path d="M22 30 C22 30 16 26.5 16 23 C16 21 18 20 22 22.5 C26 20 28 21 28 23 C28 26.5 22 30 22 30Z"
        fill="rgba(234,88,12,0.78)" />
      {/* Glow under heart */}
      <ellipse cx="22" cy="31" rx="6" ry="1.5" fill="rgba(234,88,12,0.14)" />
    </svg>
  );
}

function SOSIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Shield bg glow */}
      <path d="M22 4 L36 10 L36 26 C36 34 22 40 22 40 C22 40 8 34 8 26 L8 10 Z"
        fill="rgba(239,68,68,0.10)" />
      {/* Shield */}
      <path d="M22 5 L35.5 10.5 L35.5 25.5 C35.5 33 22 39 22 39 C22 39 8.5 33 8.5 25.5 L8.5 10.5 Z"
        fill="rgba(239,68,68,0.16)" stroke="rgba(239,68,68,0.72)" strokeWidth="1.5" />
      {/* Pulse / heartbeat line */}
      <path d="M9 23 L13 23 L16.5 17 L19.5 29 L22.5 19.5 L25.5 23 L29 23 L35 23"
        stroke="rgba(239,68,68,0.92)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function AnxietyResetIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Outer breathing ring */}
      <circle cx="22" cy="24" r="17" fill="none" stroke="rgba(20,184,166,0.18)" strokeWidth="1.5" />
      {/* Mid ring */}
      <circle cx="22" cy="24" r="12" fill="none" stroke="rgba(20,184,166,0.32)" strokeWidth="1.5" />
      {/* Inner filled circle */}
      <circle cx="22" cy="24" r="7" fill="rgba(20,184,166,0.20)" stroke="rgba(20,184,166,0.62)" strokeWidth="1.5" />
      {/* Wind curls at top */}
      <path d="M9 11 C11 7 17 6 19 10 C20 12.5 18 14.5 15.5 13.5 C13 12.5 14 9 17 9"
        stroke="rgba(20,184,166,0.70)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M23 7.5 C25 4.5 30 4.5 31.5 8.5 C32.5 12 30 14 28 13"
        stroke="rgba(20,184,166,0.52)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      {/* Small leaf at center */}
      <path d="M22 24 C22 24 19 22 20.5 19 C22 16 25 18 23.5 21 C22 24 22 24 22 24Z"
        fill="rgba(20,184,166,0.65)" />
    </svg>
  );
}

/* ─── Feature Cards ───────────────────────────────────────────── */
const FEATURE_CARDS = [
  {
    id: 'journal',
    title: 'Daily\nJournal',
    path: '/journal',
    tileColor: 'rgba(221,213,255,0.72)',
    iconBg: 'rgba(196,181,253,0.50)',
    iconBorder: 'rgba(167,139,250,0.35)',
    Icon: JournalIcon,
  },
  {
    id: 'chat',
    title: 'Lumina\nAI',
    path: '/chat',
    tileColor: 'rgba(178,245,212,0.72)',
    iconBg: 'rgba(141,236,194,0.55)',
    iconBorder: 'rgba(52,211,153,0.35)',
    Icon: LuminaIcon,
  },
  {
    id: 'meditate',
    title: 'Meditation\n& Calm',
    path: '/meditate',
    tileColor: 'rgba(255,211,211,0.72)',
    iconBg: 'rgba(255,179,179,0.55)',
    iconBorder: 'rgba(251,113,133,0.35)',
    Icon: MeditationIcon,
  },
];

/* ─── Recommendation Cards ────────────────────────────────────── */
const RECOMMENDATION_CARDS = [
  {
    id: 'assessments',
    label: 'Self-\nAssessment',
    path: '/assessments',
    iconBg: 'rgba(238,242,255,0.90)',
    iconBorder: 'rgba(99,102,241,0.20)',
    Icon: AssessmentIcon,
  },
  {
    id: 'healers',
    label: 'Connect\nHealer',
    path: '/healers',
    iconBg: 'rgba(255,247,237,0.90)',
    iconBorder: 'rgba(251,146,60,0.22)',
    Icon: HealerIcon,
  },
  {
    id: 'sos',
    label: 'SOS\nCrisis Help',
    path: '/sos',
    iconBg: 'rgba(255,241,241,0.90)',
    iconBorder: 'rgba(239,68,68,0.22)',
    Icon: SOSIcon,
  },
  {
    id: 'reset',
    label: 'Anxiety\nReset',
    path: '/anxiety-reset',
    iconBg: 'rgba(236,253,250,0.90)',
    iconBorder: 'rgba(20,184,166,0.22)',
    Icon: AnxietyResetIcon,
  },
];

/* ─── Mood States ────────────────────────────────────────────── */
const MOOD_STATES = [
  { score: 1,  emoji: '😰', label: 'Struggling', color: '#FF6B6B' },
  { score: 3,  emoji: '😔', label: 'Low',        color: '#FFA94D' },
  { score: 5,  emoji: '😐', label: 'Neutral',    color: '#FAB005' },
  { score: 7,  emoji: '🙂', label: 'Good',       color: '#51CF66' },
  { score: 9,  emoji: '🌟', label: 'Thriving',   color: '#5C7CFA' },
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
  if (h < 5)  return 'Good Night';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 21) return 'Good Evening';
  return       'Good Night';
}

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

const CATEGORY_TO_KEY = {
  'Depression': 'bdi', 'Anxiety': 'gad7', 'Stress': 'pss',
  'Self-Esteem': 'rses', 'Work Burnout': 'mbi', 'Social Anxiety': 'spin',
  'Loneliness': 'ucla', 'Emotional Wellbeing': 'wemwbs',
};
const CATEGORY_ICON = {
  'Depression': '😔', 'Anxiety': '😰', 'Stress': '🤯',
  'Self-Esteem': '💪', 'Work Burnout': '🔥', 'Social Anxiety': '👥',
  'Loneliness': '🫂', 'Emotional Wellbeing': '🌈',
};

/* ─── Shared glass card style ──────────────────────────────────── */
const glassCard = {
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(20px) saturate(1.8)',
  WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
  border: '1px solid rgba(255,255,255,0.90)',
  boxShadow: '0 4px 24px rgba(80,60,180,0.08), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.95)',
};

export function Home() {
  const navigate = useNavigate();
  const toast    = useToast();
  const user           = useStore(s => s.user);
  const moodScore      = useStore(s => s.moodScore);
  const todayMoodEntry = useStore(s => s.todayMoodEntry);
  const setMood        = useStore(s => s.setMood);
  const getFirstName   = useStore(s => s.getFirstName);

  const greeting  = getTimeGreeting();
  const firstName = getFirstName?.() || 'Friend';
  const streak    = user?.currentStreak || 0;

  const [contextNote,       setContextNote]      = useState('');
  const [hasCheckedIn,      setHasCheckedIn]     = useState(() => isToday(useStore.getState().todayMoodEntry?.createdAt));
  const [saving,            setSaving]            = useState(false);
  const [sliderVal,         setSliderVal]         = useState(7);
  const [assessmentSummary, setAssessmentSummary] = useState([]);
  const [moodHistory,       setMoodHistory]       = useState([]);

  const currentMoodState = getMoodState(sliderVal);
  const savedMoodState   = moodScore ? getMoodState(moodScore) : null;

  useEffect(() => {
    if (!user) return;
    apiFetch('/api/assessments/user/summary')
      .then(r => r.json())
      .then(d => { if (d.summary) setAssessmentSummary(d.summary); })
      .catch(() => {});
    apiFetch('/api/mood/history?days=14')
      .then(r => r.json())
      .then(d => { if (d.entries) setMoodHistory(d.entries); })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    apiFetch('/api/mood/today')
      .then(r => r.json())
      .then(d => {
        if (d.entry?.createdAt && isToday(d.entry.createdAt)) {
          setMood(d.entry.score, d.entry);
          setHasCheckedIn(true);
        }
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    setHasCheckedIn(isToday(todayMoodEntry?.createdAt));
  }, [todayMoodEntry]);

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
        const data = await res.json();
        setMood(sliderVal, data.entry);
      } else {
        setMood(sliderVal, { createdAt: new Date().toISOString(), score: sliderVal });
      }
      setHasCheckedIn(true);
      toast.success('Mood saved ✨');
    } catch {
      setMood(sliderVal, { createdAt: new Date().toISOString(), score: sliderVal });
      setHasCheckedIn(true);
    } finally {
      setSaving(false);
    }
  };

  const toRadarItem = (item) => {
    const key      = CATEGORY_TO_KEY[item._id] || 'bdi';
    const test     = ASSESSMENTS[key];
    const severity = test?.getSeverity?.(item.latestScore);
    return {
      id:       item._id,
      title:    item._id,
      score:    item.latestScore,
      maxScore: test?.maxScore || 30,
      color:    severity?.color || '#5C7CFA',
      icon:     CATEGORY_ICON[item._id] || '🌈',
    };
  };

  return (
    <div className="flex flex-col min-h-screen pb-nav" style={{ background: 'transparent' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-5 pt-14 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          {/* Left: Avatar + Greeting */}
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate('/profile')}
              className="w-[50px] h-[50px] rounded-full overflow-hidden shrink-0"
              style={{
                border: '2.5px solid rgba(255,255,255,0.95)',
                boxShadow: '0 2px 16px rgba(80,60,180,0.18), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              {user?.photoUrl
                ? <img src={user.photoUrl} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#DDD5FF] to-[#C5B8FF] text-[22px]">👤</div>
              }
            </motion.button>

            <div>
              <p className="text-[13.5px] font-700 leading-none mb-0.5" style={{ color: 'var(--text-sub)' }}>{greeting},</p>
              <h1 className="text-[22px] font-black leading-none tracking-tight" style={{ color: 'var(--text-main)' }}>{firstName}</h1>
            </div>
          </div>

          {/* Right: Streak badge */}
          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="streak-badge"
            >
              <Flame size={15} className="text-orange-500 fill-orange-400" />
              <span className="text-[12.5px] font-black text-orange-600">{streak} Day Streak</span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Mood Card (Premium) ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.07 }}
        className="mx-5 mt-1"
      >
        <div className="mood-card-gradient p-5 relative overflow-hidden">
          {/* Inner highlight */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '22px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.28) 0%, transparent 55%)',
            pointerEvents: 'none',
          }} />

          <AnimatePresence mode="wait">
            {!hasCheckedIn ? (
              <motion.div key="checkin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-[10.5px] font-black uppercase tracking-[0.24em] mb-1" style={{ color: 'rgba(74,42,140,0.65)' }}>
                  Daily Check-In
                </p>
                <h2 className="text-[17px] font-black tracking-tight mb-4" style={{ color: '#1A103A' }}>
                  How are you feeling?
                </h2>

                {/* Emoji selector */}
                <div className="flex justify-around items-center mb-4">
                  {MOOD_STATES.map((s, idx) => {
                    const isActive = Math.abs(sliderVal - s.score) < 1.2;
                    return (
                      <motion.button
                        key={idx}
                        onClick={() => setSliderVal(s.score)}
                        animate={{ scale: isActive ? 1.28 : 0.78, opacity: isActive ? 1 : 0.32 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                        className="text-[28px] w-10 h-10 flex items-center justify-center"
                      >
                        {s.emoji}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Slider */}
                <div className="mb-4 px-1">
                  <input
                    type="range" min="1" max="10" step="0.5"
                    value={sliderVal}
                    onChange={(e) => setSliderVal(Number(e.target.value))}
                    className="mood-slider"
                    style={{
                      accentColor: 'rgba(92,60,200,0.7)',
                      background: `linear-gradient(to right, rgba(92,60,200,0.6) ${(sliderVal - 1) * 11.1}%, rgba(255,255,255,0.45) ${(sliderVal - 1) * 11.1}%)`,
                    }}
                  />
                </div>

                {/* Note + save */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a note…"
                    value={contextNote}
                    onChange={(e) => setContextNote(e.target.value)}
                    className="flex-1 rounded-[14px] px-3 py-2.5 text-[13px] font-semibold focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.45)',
                      border: '1px solid rgba(255,255,255,0.60)',
                      color: '#1A103A',
                    }}
                    maxLength={80}
                  />
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={handleSaveMood}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-[14px] font-black text-[13px] text-white disabled:opacity-50 transition-all"
                    style={{
                      background: 'rgba(80,50,180,0.62)',
                      backdropFilter: 'blur(8px)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
                    }}
                  >
                    {saving ? '…' : 'Save'}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
                <span className="text-[56px] leading-none">{savedMoodState?.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10.5px] font-black uppercase tracking-[0.22em] mb-0.5" style={{ color: 'rgba(74,42,140,0.65)' }}>Today's Mood</p>
                  <p className="text-[26px] font-black leading-none tracking-tight" style={{ color: '#1A103A' }}>{savedMoodState?.label}</p>
                  <p className="text-[14px] font-black mt-0.5" style={{ color: '#1A103A' }}>
                    <span className="text-[22px] font-black">{moodScore}</span>
                    <span style={{ opacity: 0.45 }}>/10</span>
                  </p>
                </div>
                <button
                  onClick={() => setHasCheckedIn(false)}
                  className="w-9 h-9 rounded-[14px] flex items-center justify-center transition-all active:scale-90"
                  style={{ background: 'rgba(255,255,255,0.32)', color: '#4A2A8C' }}
                >
                  <PenLine size={15} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Feature Tiles — 3-col glassmorphism ─────────────────── */}
      <div className="px-5 mt-5">
        <div className="grid grid-cols-3 gap-3">
          {FEATURE_CARDS.map((card, idx) => {
            const { Icon } = card;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.13 + idx * 0.07 }}
              >
                <button
                  onClick={() => navigate(card.path)}
                  className="w-full text-left relative overflow-hidden active:scale-[0.96] transition-transform glass-tile"
                  style={{
                    background: card.tileColor,
                    borderRadius: '22px',
                    paddingTop: '14px', paddingBottom: '14px',
                    paddingLeft: '13px', paddingRight: '13px',
                    minHeight: '122px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  }}
                >
                  {/* Inner highlight */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 100%)',
                    borderRadius: '22px 22px 0 0', pointerEvents: 'none',
                  }} />

                  {/* Top row: icon + chevron */}
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="w-[40px] h-[40px] rounded-[14px] flex items-center justify-center p-2"
                      style={{
                        backgroundColor: card.iconBg,
                        border: `1px solid ${card.iconBorder}`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.70)',
                      }}
                    >
                      <Icon />
                    </div>
                    <ChevronRight size={13} style={{ color: 'rgba(0,0,0,0.28)', marginTop: '3px' }} />
                  </div>

                  {/* Title */}
                  <p
                    className="text-[12.5px] font-black leading-tight tracking-tight"
                    style={{ color: '#1A1F36', whiteSpace: 'pre-line' }}
                  >
                    {card.title}
                  </p>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Recommendations — 4 glass cards ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.30 }}
        className="mt-6 px-5"
      >
        <h2 className="font-black text-[18px] tracking-tight mb-3" style={{ color: 'var(--text-main)' }}>
          Recommendations
        </h2>
        <div className="grid grid-cols-4 gap-2.5">
          {RECOMMENDATION_CARDS.map((card, idx) => {
            const { Icon } = card;
            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.34 + idx * 0.05 }}
                onClick={() => navigate(card.path)}
                className="flex flex-col items-center py-3.5 px-1 active:scale-[0.95] transition-transform"
                style={{ ...glassCard, borderRadius: '20px' }}
              >
                {/* Icon container */}
                <div
                  className="w-[48px] h-[48px] rounded-[16px] flex items-center justify-center mb-2 p-2.5"
                  style={{
                    backgroundColor: card.iconBg,
                    border: `1px solid ${card.iconBorder}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.80)',
                  }}
                >
                  <Icon />
                </div>
                <p
                  className="text-center font-bold leading-tight"
                  style={{ fontSize: '10px', color: 'var(--text-sub)', whiteSpace: 'pre-line' }}
                >
                  {card.label}
                </p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Mood Timeline ─────────────────────────────────────────── */}
      {moodHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44 }}
          className="mx-5 mt-5"
        >
          <div style={{ ...glassCard, borderRadius: '22px' }}>
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-[17px] tracking-tight" style={{ color: 'var(--text-main)' }}>
                  Mood Timeline
                </h3>
                <span className="text-[12px] font-bold" style={{ color: 'var(--text-muted)' }}>Last 7 days</span>
              </div>
              <EmojiBubbleTimeline entries={moodHistory} maxVisible={7} />
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Psychological Portrait (Radar) ──────────────────────── */}
      {assessmentSummary.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.50 }}
          className="mx-5 mt-4"
        >
          <div style={{ ...glassCard, borderRadius: '22px' }}>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] mb-0.5" style={{ color: 'var(--color-primary)' }}>
                    Psychological Tests
                  </p>
                  <h3 className="font-black text-[16px] tracking-tight" style={{ color: 'var(--text-main)' }}>
                    Health Analysis
                  </h3>
                </div>
                <button
                  onClick={() => navigate('/assessments')}
                  className="text-xs font-black uppercase tracking-widest transition-opacity hover:opacity-75"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Details →
                </button>
              </div>
              <div className="flex justify-center py-3">
                <RadarChart data={assessmentSummary.map(toRadarItem)} size={220} />
              </div>
              <RadarLegend data={assessmentSummary.map(toRadarItem)} />
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Self-Assessments CTA (no history) ───────────────────── */}
      {assessmentSummary.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.50 }}
          className="mx-5 mt-4 mb-4"
        >
          <button
            onClick={() => navigate('/assessments')}
            className="w-full p-5 cursor-pointer active:scale-[0.98] transition-transform text-left flex items-center gap-4"
            style={{ ...glassCard, borderRadius: '22px' }}
          >
            <div
              className="w-12 h-12 rounded-[16px] flex items-center justify-center p-2.5"
              style={{
                background: 'rgba(238,242,255,0.90)',
                border: '1px solid rgba(99,102,241,0.20)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.80)',
              }}
            >
              <AssessmentIcon />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-[15px] tracking-tight mb-0.5" style={{ color: 'var(--text-main)' }}>
                Self-Assessments
              </h3>
              <p className="text-[12px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                Track anxiety, depression & burnout
              </p>
            </div>
            <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </motion.div>
      )}

    </div>
  );
}
