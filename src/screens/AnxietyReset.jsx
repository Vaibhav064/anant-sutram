import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Lock, ChevronRight, Star, Flame, X, ArrowLeft, Play, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { ConfirmModal } from '../components/ui/Modal';
import { PageSkeleton } from '../components/ui/Skeleton';

import { API_BASE, apiFetch } from '../lib/api';

import { HEALERS_DATA } from './Healers';

// ─── Support Plans ─────────────────────────────────────────────────────────────
const PLANS = HEALERS_DATA.map((h, i) => ({
  id: `healer_${h.id}`,
  key: `healer_${h.id}`,
  icon: h.emoji,
  photo: h.photo,
  name: h.name,
  tagline: h.tagline,
  color: h.category === 'spiritual' ? 'bg-[rgba(213,200,240,0.3)]' : 'bg-[rgba(194,232,216,0.3)]',
  border: h.category === 'spiritual' ? 'border-[rgba(213,200,240,0.5)]' : 'border-[rgba(194,232,216,0.5)]',
  accent: h.category === 'spiritual' ? 'text-secondary' : 'text-teal',
  accentBg: h.category === 'spiritual' ? 'bg-secondary/10' : 'bg-teal/10',
  features: h.specialties,
  style: h.experience,
  popular: i === 1, // Make the second one popular
  packages: h.sessionTypes,
}));

function DayThemeIcon(theme) {
  const map = {
    Awareness: '👁️', Grounding: '🌿', Breath: '💨', Body: '🤲', Thoughts: '💭',
    Reframing: '🔄', Rest: '🌙', 'Self-Compassion': '💙', Triggers: '🔍', Boundaries: '🛡️',
    Connection: '🤝', 'Inner Child': '🧒', Nature: '🌸', Halfway: '🏆', Sleep: '😴',
    Purpose: '🌟', Surrender: '🕊️', Identity: '🪞', Forgiveness: '🌅', Integration: '🧩',
    Emergence: '✨',
  };
  return map[theme] || '🌿';
}

// ─── Plan Card Component ───────────────────────────────────────────────────────
function PlanCard({ plan, isSelected, onSelect, isPurchased, onPurchase, subscriptionTier }) {
  const isUnlockedBySub = subscriptionTier === 'moksha' || (subscriptionTier === 'shakti' && plan.key === 'psychologist');
  const effectivelyPurchased = isPurchased || isUnlockedBySub;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-[24px] border p-5 ${effectivelyPurchased ? `bg-surface ${plan.border}` : 'bg-surface border-subtle'} shadow-sm transition-all overflow-hidden`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${plan.color}  rounded-full blur-2xl -mr-16 -mt-16`} />
      
      {plan.popular && !effectivelyPurchased && (
        <div className="absolute top-4 right-4 bg-teal/20 text-teal text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-[6px] shadow-sm">
          Most Popular
        </div>
      )}
      {effectivelyPurchased && (
        <div className="absolute top-4 right-4 bg-success/10 border border-success/30 text-success text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-[6px] flex items-center gap-1 shadow-sm">
          <CheckCircle2 size={10} /> Active
        </div>
      )}

      <div className="flex items-start gap-3 mb-5 relative z-10">
        <div className={`w-14 h-14 rounded-[18px] ${plan.accentBg} flex items-center justify-center text-[28px] shrink-0 shadow-sm border border-soft overflow-hidden relative`}>
          <img
            src={plan.photo}
            alt={plan.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden w-full h-full items-center justify-center">{plan.icon}</div>
        </div>
        <div className="flex-1 mt-0.5 min-w-0">
          <h3 className={`font-bold text-[18px] tracking-tight ${plan.accent} pr-20`}>{plan.name}</h3>
          <p className={`text-[12px] font-medium text-sub mt-0.5 leading-snug pr-20`}>{plan.tagline}</p>
        </div>
      </div>

      <div className="mb-4">
         {effectivelyPurchased ? (
           <div className="flex items-center gap-2">
             <Star size={16} className="text-gold fill-gold" />
             <p className="text-[12px] font-bold text-gold uppercase tracking-wider">Unlocked via Pro</p>
           </div>
         ) : null}
      </div>

      <ul className="space-y-2 mb-6">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-[13px] text-sub font-medium leading-snug">
            <CheckCircle2 size={14} className={`${plan.accent} mt-0.5 shrink-0`} />
            {f}
          </li>
        ))}
      </ul>

      <div className={`text-[11px] font-bold ${plan.accent} ${plan.accentBg} px-3 py-2.5 rounded-xl mb-5 text-center border ${plan.border}`}>
        Experience: {plan.style}
      </div>

      {effectivelyPurchased ? (
         <button
           onClick={() => onSelect(plan.key)}
           className={`w-full py-4 rounded-xl text-[14px] font-bold transition-all shadow-sm ${isSelected ? `${plan.accentBg} ${plan.accent} border ${plan.border}` : 'bg-surface2 border border-subtle text-muted'}`}
         >
           {isSelected ? '✓ Currently Active' : 'Switch to this plan'}
         </button>
      ) : (
        <div className="space-y-2">
          <p className="text-muted text-[10px] uppercase font-bold tracking-widest mb-2 border-b border-soft pb-1">Available Packages</p>
          {plan.packages?.map((pkg, idx) => (
            <button
              key={idx}
              onClick={() => onPurchase({ ...plan, price: pkg.price, name: `${plan.name} - ${pkg.type}` })}
              className={`w-full py-3 px-4 rounded-xl ${plan.accentBg} border ${plan.border} ${plan.accent} font-bold text-[13px] hover:scale-[0.98] transition-transform shadow-sm flex justify-between items-center`}
            >
              <div className="flex flex-col items-start gap-0.5">
                <span>{pkg.type}</span>
                <span className={`text-[10px] font-medium opacity-80`}>{pkg.duration}</span>
              </div>
              <span className="text-[15px] font-black">₹{pkg.price}</span>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Day Card Component ────────────────────────────────────────────────────────
function DayCard({ day, isUnlocked, isCompleted, isCurrent, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={!isUnlocked}
      className={`relative flex flex-col items-center p-4 rounded-2xl transition-all duration-200 text-center border shadow-sm
        ${isCompleted ? 'bg-surface border-success/40' :
          isCurrent ? 'bg-surface border-gold/50 shadow-md scale-105 z-10' :
          isUnlocked ? 'bg-surface border-subtle hover:border-soft' :
          'bg-surface2 border-subtle opacity-60'}`}
    >
      {isCompleted && (
        <div className="absolute -top-1.5 -right-1.5">
          <CheckCircle2 size={16} className="text-success bg-surface rounded-full" />
        </div>
      )}
      {!isUnlocked && !isCompleted && (
        <div className="absolute top-2.5 right-2.5">
          <Lock size={12} className="text-muted" />
        </div>
      )}

      <span className={`text-[24px] mb-2 ${!isUnlocked && !isCompleted ? 'grayscale opacity-60' : ''}`}>{DayThemeIcon(day.theme)}</span>
      <span className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${isCurrent ? 'text-gold' : isCompleted ? 'text-success' : 'text-muted'}`}>
        Day {day.day}
      </span>
      <span className="text-main text-[11px] font-bold leading-tight">{day.theme}</span>
    </motion.button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function AnxietyReset() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useStore(s => s.user);
  const subscriptionTier = useStore(s => s.subscriptionTier);

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [programDays, setProgramDays] = useState([]);
  const [isNextDayLocked, setIsNextDayLocked] = useState(false);

  const [activeTab, setActiveTab] = useState('journey'); // 'journey' | 'plans' | 'today'
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayView, setDayView] = useState(false);

  // Day completion state
  const [journalResponse, setJournalResponse] = useState('');
  const [taskDone, setTaskDone] = useState(false);
  const [exerciseDone, setExerciseDone] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Plan purchase
  const [purchasingPlan, setPurchasingPlan] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => { fetchProgress(); }, []);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/anxiety-reset/progress');
      const data = await res.json();
      setProgress(data.progress);
      setProgramDays(data.programDays || []);
      setIsNextDayLocked(data.isNextDayLocked || false);
    } catch {
      toast.error('Failed to load program data');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      const res = await apiFetch('/api/anxiety-reset/start', {
        method: 'POST',
      });
      const data = await res.json();
      setProgress(data.progress);
      toast.success("Your 21-day journey begins today! 🌿");
    } catch {
      toast.error('Failed to start program');
    }
  };

  const handleCompleteDay = async (dayNumber) => {
    if (!journalResponse.trim() && !taskDone && !exerciseDone) {
      toast.error('Complete at least one activity first');
      return;
    }
    setCompleting(true);
    try {
      const res = await apiFetch('/api/anxiety-reset/complete-day', {
        method: 'POST',
        body: JSON.stringify({ day: dayNumber, journalResponse, taskDone, exerciseDone }),
      });
      const data = await res.json();
      setProgress(data.progress);
      toast.success(`Day ${dayNumber} complete! 🌟`);
      setDayView(false);
      setJournalResponse('');
      setTaskDone(false);
      setExerciseDone(false);
    } catch {
      toast.error('Failed to save progress');
    } finally {
      setCompleting(false);
    }
  };

  const handlePurchase = async () => {
    if (!purchasingPlan) return;
    setPurchasing(true);
    setShowPurchaseModal(false);
    try {
      const res = await apiFetch('/api/anxiety-reset/purchase', {
        method: 'POST',
        body: JSON.stringify({ planId: purchasingPlan.id, planName: purchasingPlan.name, amount: purchasingPlan.price }),
      });

      // Refresh progress
      await fetchProgress();
      toast.success(`${purchasingPlan.name} plan activated! ✨`);
    } catch {
      toast.error('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
      setPurchasingPlan(null);
    }
  };

  const currentDay = progress?.currentDay || 1;
  const selectedPlan = progress?.selectedPlan;
  const activePlan = PLANS.find(p => p.key === selectedPlan);

  const isDayCompleted = (dayNum) => {
    return progress?.dailyEntries?.some(e => e.day === dayNum && e.completedAt) || false;
  };

  const isDayUnlocked = (dayNum) => {
    if (!progress) return false;
    if (isDayCompleted(dayNum)) return true;
    if (dayNum === currentDay && !isNextDayLocked) return true;
    return false;
  };

  if (loading) return <PageSkeleton />;

  // ── Intro / Start Screen ──────────────────────────────────────────────────────
  if (!progress) {
    return (
      <div className="min-h-[100dvh] flex flex-col pb-nav" style={{ background: 'var(--bg-app)' }}>
        <div className="px-6 pt-12 pb-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-surface border border-subtle flex items-center justify-center text-muted hover:bg-surface2 transition-colors shadow-sm active:scale-95">
            <ArrowLeft size={20} />
          </button>
          <div className="w-10 h-10" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col px-6 pb-8"
        >
          {/* Hero */}
          <div className="relative rounded-[32px] overflow-hidden mb-8 p-8 bg-surface border border-teal/20 shadow-sm">
            <div className="absolute top-0 right-0 w-48 h-48 bg-teal/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute -right-6 -bottom-6 text-[100px] opacity-10">🌿</div>
            
            <span className="text-[10px] font-bold text-teal bg-teal/10 inline-block px-2.5 py-1 rounded-[6px] uppercase tracking-widest mb-4">21-Day Program</span>
            
            <h1 className="text-[32px] font-bold text-main tracking-tight leading-none mb-4">
              Anxiety Reset<br/>Journey
            </h1>
            <p className="text-sub text-[15px] leading-relaxed font-medium relative z-10">
              A structured 21-day program combining mindfulness, CBT techniques, and daily reflection to transform your relationship with anxiety.
            </p>
          </div>

          {/* What you'll get */}
          <div className="mb-10 bg-surface rounded-[28px] p-6 border border-subtle shadow-sm">
            <h2 className="text-[11px] font-bold text-muted uppercase tracking-widest mb-5">What's included</h2>
            {[
              { icon: '📅', text: '21 structured daily sessions' },
              { icon: '🧘', text: 'Guided exercises & meditations' },
              { icon: '📝', text: 'Daily reflection prompts' },
              { icon: '✅', text: 'Actionable daily micro-tasks' },
              { icon: '📊', text: 'Progress tracking & streaks' },
              { icon: '🔒', text: 'Day-by-day content unlocking' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-4 mb-4 last:mb-0">
                <span className="w-10 h-10 bg-surface2 rounded-[12px] flex items-center justify-center text-[18px] shrink-0 border border-subtle">{icon}</span>
                <p className="text-main text-[14px] font-bold">{text}</p>
              </div>
            ))}
          </div>

          {/* Support plans preview */}
          <div className="bg-surface border border-subtle rounded-[28px] p-6 mb-8 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
            <p className="text-[10px] font-bold text-gold bg-gold/10 inline-block px-2 py-0.5 rounded-[4px] uppercase tracking-widest mb-3">✦ Optional Premium Support</p>
            <p className="text-sub text-[14px] font-medium leading-relaxed mb-5">
              Enhance your journey with a dedicated guide — AI Psychologist, Spiritual Guide, or Life Coach.
            </p>
            <div className="flex gap-2">
              {PLANS.map(p => (
                <div key={p.id} className={`flex-1 pt-3 pb-2.5 rounded-2xl ${p.color} border ${p.border} border-opacity-30 text-center`}>
                  <span className="text-[20px] block mb-0.5">{p.icon}</span>
                  <span className={`text-[9px] font-bold ${p.accent}`}>{p.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-5 rounded-[20px] bg-primary text-white font-bold text-[16px] shadow-glow-primary hover:opacity-90 transition-all active:scale-95 mb-4"
          >
            Begin My Journey 🌿
          </button>
          <button onClick={() => navigate(-1)} className="text-muted font-bold text-[13px] uppercase tracking-widest text-center py-2 w-full hover:text-sub transition-colors">Not now</button>
        </motion.div>
      </div>
    );
  }

  // ── Active Program View ───────────────────────────────────────────────────────
  const todayContent = programDays.find(d => d.day === currentDay);
  const completedDays = progress?.dailyEntries?.filter(e => e.completedAt)?.length || 0;
  const progressPct = Math.round((completedDays / 21) * 100);

  return (
    <div className="min-h-[100dvh] pb-nav flex flex-col" style={{ background: 'var(--bg-app)' }}>
      {/* ── Header ── */}
      <div className="px-6 pt-12 pb-4 sticky top-0 backdrop-blur-xl z-20" style={{ background: 'rgba(232,238,247,0.92)' }}>
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-surface border border-subtle flex items-center justify-center text-muted shadow-sm transition-transform active:scale-95">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h1 className="text-[17px] font-bold text-main tracking-tight">Anxiety Reset</h1>
            <p className="text-[11px] text-muted font-bold uppercase tracking-widest">Day {currentDay} of 21</p>
          </div>
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-[10px] shadow-sm">
            <Flame size={12} className="text-amber-500" />
            <span className="text-[11px] text-amber-600 font-bold">{progress.streakCount}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-surface p-3 rounded-2xl shadow-sm border border-subtle">
          <div className="flex justify-between items-center text-[10px] font-bold text-muted uppercase tracking-widest mb-2 px-1">
            <span>Overall Progress</span>
            <span className="text-main">{completedDays}/21 days · {progressPct}%</span>
          </div>
          <div className="h-2 bg-surface2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-teal"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 bg-surface2 p-1 rounded-[16px] border border-subtle">
          {[{ id: 'today', label: "Today" }, { id: 'journey', label: 'Journey' }, { id: 'plans', label: 'Guides' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-xl text-[12px] font-bold transition-all ${activeTab === tab.id ? 'bg-surface text-main shadow-sm' : 'text-sub hover:bg-surface/50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── TODAY TAB ── */}
        {activeTab === 'today' && todayContent && (
          <motion.div key="today" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="px-6 pt-4 pb-8">
            {isDayCompleted(currentDay) || (isNextDayLocked && currentDay > 1) ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12">
                <div className="w-24 h-24 bg-surface border border-teal/30 text-[48px] rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-sm">
                  {isNextDayLocked ? '⏳' : '🌟'}
                </div>
                <h2 className="text-[26px] font-bold text-main tracking-tight leading-tight mb-2">{isNextDayLocked ? 'Coming Tomorrow' : `Day ${currentDay} Complete!`}</h2>
                <p className="text-sub text-[15px] font-medium mb-8">
                  {isNextDayLocked 
                    ? `You've done great today. Day ${currentDay} will unlock at midnight.` 
                    : "You're building something real. Come back tomorrow."}
                </p>
                {currentDay < 21 && (
                  <div className="bg-surface border border-subtle rounded-[28px] p-6 text-left shadow-sm">
                    <p className="text-teal bg-teal/10 inline-block px-2 py-0.5 rounded-[6px] text-[10px] uppercase tracking-widest font-bold mb-3 border border-teal/20">Next Step: Day {currentDay}</p>
                    <p className="text-main font-bold text-[18px] mb-1">{todayContent.title}</p>
                    <p className="text-sub font-medium text-[13px]">{todayContent.theme}</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <>
                {/* Plan badge */}
                {activePlan && (
                  <div className={`flex items-center gap-3 bg-surface ${activePlan.border} border rounded-[20px] px-4 py-3 mb-6 shadow-sm`}>
                    <span className={`w-8 h-8 rounded-[10px] ${activePlan.accentBg} flex items-center justify-center text-[16px]`}>{activePlan.icon}</span>
                    <p className={`text-[13px] font-bold text-main`}>{activePlan.name} track active</p>
                  </div>
                )}

                {/* Day header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold text-teal bg-teal/10 border border-teal/20 uppercase tracking-widest px-3 py-1 rounded-[8px]">
                      Day {todayContent.day} · {todayContent.theme}
                    </span>
                  </div>
                  <h2 className="text-[28px] font-bold text-main tracking-tight leading-tight mb-3">{todayContent.title}</h2>
                  <p className="text-sub text-[15px] leading-relaxed font-medium">{todayContent.desc}</p>
                </div>

                {/* Exercise */}
                <div className={`rounded-[24px] border p-5 mb-4 transition-all shadow-sm ${exerciseDone ? 'bg-surface border-teal/40' : 'bg-surface border-subtle'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Guided Exercise</p>
                      <h3 className="text-main font-bold text-[16px] mb-1 leading-snug">{todayContent.exercise}</h3>
                      <p className="text-sub font-medium text-[13px]">Complete this to mark the exercise done</p>
                    </div>
                    <button
                      onClick={() => setExerciseDone(!exerciseDone)}
                      className={`w-10 h-10 rounded-[14px] border flex items-center justify-center shrink-0 transition-all ${exerciseDone ? 'bg-teal border-teal' : 'bg-surface2 border-soft active:scale-95'}`}
                    >
                      {exerciseDone && <CheckCircle2 size={18} className="text-white" />}
                    </button>
                  </div>
                  {!exerciseDone && (
                    <button
                      onClick={() => navigate('/meditate')}
                      className="mt-5 flex items-center gap-2 text-teal bg-teal/10 border border-teal/20 px-4 py-2.5 rounded-[12px] text-[13px] font-bold w-fit active:scale-95 transition-transform"
                    >
                      <Play size={14} className="fill-teal" /> Open player
                    </button>
                  )}
                </div>

                {/* Reflection */}
                <div className="bg-surface border border-subtle rounded-[28px] p-6 mb-4 shadow-sm">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3 border-b border-soft pb-2">Daily Reflection</p>
                  <p className="text-main font-bold text-[16px] leading-relaxed italic mb-4">"{todayContent.reflection}"</p>
                  <textarea
                    value={journalResponse}
                    onChange={(e) => setJournalResponse(e.target.value)}
                    placeholder="Write your thoughts here..."
                    className="w-full rounded-[16px] px-4 py-4 text-[14px] font-medium bg-surface2 border border-soft focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none mb-2 placeholder:text-muted text-main"
                    rows={4}
                  />
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest text-right">Private & Secured</p>
                </div>

                {/* Task */}
                <div className={`rounded-[24px] border p-5 mb-8 transition-all shadow-sm ${taskDone ? 'bg-success/10 border-success/30' : 'bg-surface border-subtle'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Today's Micro-Task</p>
                      <p className="text-main font-bold text-[15px] leading-relaxed">{todayContent.task}</p>
                    </div>
                    <button
                      onClick={() => setTaskDone(!taskDone)}
                      className={`w-10 h-10 rounded-[14px] border flex items-center justify-center shrink-0 transition-all ${taskDone ? 'bg-success border-success' : 'bg-surface2 border-soft active:scale-95'}`}
                    >
                      {taskDone && <CheckCircle2 size={18} className="text-white" />}
                    </button>
                  </div>
                </div>

                {/* Complete button */}
                <button
                  onClick={() => handleCompleteDay(currentDay)}
                  disabled={completing}
                  className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-[15px] uppercase tracking-widest shadow-md hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4 active:scale-95"
                >
                  {completing ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                    <>Complete Day {currentDay} <Sparkles size={16} /></>
                  )}
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* ── JOURNEY TAB ── */}
        {activeTab === 'journey' && (
          <motion.div key="journey" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="px-6 pt-4 pb-8">
            <p className="text-sub text-[13px] font-medium mb-6">Tap a day to view its content. Locked days unlock sequentially.</p>

            <div className="grid grid-cols-4 gap-3">
              {programDays.map(day => (
                <DayCard
                  key={day.day}
                  day={day}
                  isUnlocked={isDayUnlocked(day.day)}
                  isCompleted={isDayCompleted(day.day)}
                  isCurrent={day.day === currentDay}
                  onClick={() => {
                    if (isDayUnlocked(day.day)) {
                      setSelectedDay(day);
                      setDayView(true);
                    }
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── PLANS TAB ── */}
        {activeTab === 'plans' && (
          <motion.div key="plans" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="px-5 pt-4 pb-8">
            <div className="mb-6 px-1">
              <h2 className="text-[24px] font-bold text-main tracking-tight leading-tight mb-2">Choose Your Guide</h2>
              <p className="text-sub text-[14px] leading-relaxed font-medium">
                Personalize your 21-day experience with expert daily support. Each plan tailors reflections and insights.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {PLANS.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isSelected={selectedPlan === plan.key}
                  isPurchased={progress?.planPurchased && selectedPlan === plan.key}
                  subscriptionTier={subscriptionTier}
                  onSelect={(key) => {/* switch plan */}}
                  onPurchase={(p) => {
                    setPurchasingPlan(p);
                    setShowPurchaseModal(true);
                  }}
                />
              ))}
            </div>

            {!progress?.planPurchased && subscriptionTier === 'aura' && (
              <div className="mt-6 p-4 bg-surface border border-subtle rounded-2xl text-center shadow-sm">
                <p className="text-muted text-[11px] font-bold uppercase tracking-widest">The free program runs without a plan. Plans add personalized daily guidance.</p>
              </div>
            )}
            {(subscriptionTier === 'shakti' || subscriptionTier === 'moksha') && (
              <div className="mt-6 p-4 bg-gold/10 border border-gold/30 rounded-2xl text-center shadow-sm">
                <p className="text-gold text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                  <Star size={12} className="fill-gold" /> Pro Packages Unlocked</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Day Detail Drawer ── */}
      <AnimatePresence>
        {dayView && selectedDay && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDayView(false)} className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-x-0 bottom-0 h-[75dvh] bg-surface border-t border-subtle rounded-t-[36px] z-[51] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-soft bg-surface">
                <div>
                  <p className="text-muted text-[10px] font-bold uppercase tracking-widest">Day {selectedDay.day} · {selectedDay.theme}</p>
                  <h3 className="text-main font-bold text-[20px] tracking-tight leading-tight mt-0.5">{selectedDay.title}</h3>
                </div>
                <button onClick={() => setDayView(false)} className="w-10 h-10 rounded-[14px] bg-surface2 flex items-center justify-center border border-soft active:scale-95 transition-transform">
                  <X size={18} className="text-sub" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-bg">
                <p className="text-main text-[15px] leading-relaxed font-bold bg-surface p-5 rounded-[24px] shadow-sm border border-subtle">{selectedDay.desc}</p>
                <div className="bg-surface border border-teal/30 rounded-[24px] p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-teal uppercase tracking-widest mb-2 border-b border-soft pb-2">Exercise</p>
                  <p className="text-main font-bold text-[16px] leading-snug">{selectedDay.exercise}</p>
                </div>
                <div className="bg-surface border border-secondary/30 rounded-[24px] p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 border-b border-soft pb-2">Reflection</p>
                  <p className="text-main text-[15px] italic leading-relaxed font-bold">"{selectedDay.reflection}"</p>
                </div>
                <div className="bg-surface border border-gold/30 rounded-[24px] p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-2 border-b border-soft pb-2">Task</p>
                  <p className="text-main text-[15px] leading-relaxed font-bold">{selectedDay.task}</p>
                </div>
                {selectedDay.day === currentDay && !isDayCompleted(selectedDay.day) && (
                  <button onClick={() => { setDayView(false); setActiveTab('today'); }}
                    className="w-full py-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-[15px] uppercase tracking-widest shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform mt-8">
                    Start Today's Work <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Purchase Confirm Modal ── */}
      <ConfirmModal
        isOpen={showPurchaseModal}
        onClose={() => { setShowPurchaseModal(false); setPurchasingPlan(null); }}
        onConfirm={handlePurchase}
        isLoading={purchasing}
        title={`Unlock ${purchasingPlan?.name}`}
        message={`Activate the ${purchasingPlan?.name} plan for your 21-day journey for ₹${purchasingPlan?.price}? This is a one-time payment.`}
        confirmLabel={`Unlock for ₹${purchasingPlan?.price}`}
        confirmVariant="primary"
      />
    </div>
  );
}
