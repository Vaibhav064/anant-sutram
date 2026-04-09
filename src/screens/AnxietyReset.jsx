import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Lock, ChevronRight, Star, Flame, X, ArrowLeft, Play, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { ConfirmModal } from '../components/ui/Modal';
import { PageSkeleton } from '../components/ui/Skeleton';

import { API_BASE, apiFetch } from '../lib/api';

// ─── Support Plans ─────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'anxiety_reset_psychologist',
    key: 'psychologist',
    icon: '🧠',
    name: 'AI Psychologist',
    tagline: 'Evidence-based emotional support',
    price: 999,
    color: 'from-violet-500/25 to-indigo-500/15',
    border: 'border-violet-500/30',
    accent: 'text-violet-300',
    accentBg: 'bg-violet-500/15',
    features: [
      '21-day CBT-guided daily sessions',
      'Emotional regulation techniques',
      'Thought reframing exercises',
      'Unlimited AI chat support',
      'Mood pattern insights',
    ],
    style: 'Gentle, grounding, evidence-based',
  },
  {
    id: 'anxiety_reset_spiritual',
    key: 'spiritual',
    icon: '🪷',
    name: 'Spiritual Guide',
    tagline: 'Inner peace & soulful healing',
    price: 849,
    color: 'from-amber-500/25 to-orange-500/15',
    border: 'border-amber-500/30',
    accent: 'text-amber-300',
    accentBg: 'bg-amber-500/15',
    features: [
      '21-day spiritual wisdom journey',
      'Daily mantras & affirmations',
      'Breathwork & meditation guides',
      'Vedantic & mindfulness wisdom',
      'Soul-centered reflections',
    ],
    style: 'Peaceful, soulful, mindful',
  },
  {
    id: 'anxiety_reset_coach',
    key: 'coach',
    icon: '🧭',
    name: 'Life Coach',
    tagline: 'Clarity, momentum & transformation',
    price: 749,
    color: 'from-teal/25 to-emerald-500/15',
    border: 'border-teal/30',
    accent: 'text-teal',
    accentBg: 'bg-teal/15',
    features: [
      '21-day action-oriented program',
      'Daily micro-goals & habits',
      'Boundary & clarity exercises',
      'Empowerment coaching style',
      'Weekly momentum check-ins',
    ],
    style: 'Energizing, action-oriented',
    popular: true,
  },
];

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
function PlanCard({ plan, isSelected, onSelect, isPurchased, onPurchase }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-3xl border p-5 bg-gradient-to-br ${plan.color} ${plan.border} ${isPurchased ? 'ring-2 ring-offset-1 ring-offset-bg ring-teal/50' : ''} transition-all`}
    >
      {plan.popular && !isPurchased && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal to-emerald-500 text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}
      {isPurchased && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal to-emerald-500 text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
          <CheckCircle2 size={10} /> Active Plan
        </div>
      )}

      <div className="flex items-start gap-3 mb-4">
        <div className={`w-12 h-12 rounded-2xl ${plan.accentBg} flex items-center justify-center text-[24px] shrink-0`}>
          {plan.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-[17px] tracking-tight">{plan.name}</h3>
          <p className={`text-[12px] font-medium ${plan.accent} mt-0.5`}>{plan.tagline}</p>
        </div>
        <div className="text-right">
          <p className="text-white font-bold text-[20px]">₹{plan.price}</p>
          <p className="text-white/30 text-[11px]">one-time</p>
        </div>
      </div>

      <ul className="space-y-2 mb-5">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-[13px] text-white/75 font-medium">
            <CheckCircle2 size={14} className={`${plan.accent} mt-0.5 shrink-0`} />
            {f}
          </li>
        ))}
      </ul>

      <div className={`text-[11px] font-semibold ${plan.accent} ${plan.accentBg} px-3 py-2 rounded-xl mb-4 text-center border ${plan.border}`}>
        Style: {plan.style}
      </div>

      {isPurchased ? (
        <button
          onClick={() => onSelect(plan.key)}
          className={`w-full py-3.5 rounded-2xl border ${plan.border} text-white font-bold text-[14px] ${isSelected ? plan.accentBg : 'bg-white/5'} transition-all`}
        >
          {isSelected ? '✓ Currently Active' : 'Switch to this plan'}
        </button>
      ) : (
        <button
          onClick={() => onPurchase(plan)}
          className="w-full py-3.5 rounded-2xl bg-white text-bg font-bold text-[14px] hover:opacity-90 transition-all active:scale-95"
        >
          Unlock for ₹{plan.price}
        </button>
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
      className={`relative flex flex-col items-center p-4 rounded-2xl border transition-all duration-200 text-center
        ${isCompleted ? 'bg-primary/15 border-primary/30' :
          isCurrent ? 'bg-gradient-to-br from-primary/20 to-secondary/10 border-primary/40 shadow-glow-primary' :
          isUnlocked ? 'bg-surface2 border-white/8 hover:border-white/18' :
          'bg-surface2/50 border-white/4 opacity-40'}`}
    >
      {isCompleted && (
        <div className="absolute -top-2 -right-2">
          <CheckCircle2 size={18} className="text-primary fill-primary/20" />
        </div>
      )}
      {!isUnlocked && !isCompleted && (
        <div className="absolute top-2 right-2">
          <Lock size={12} className="text-white/20" />
        </div>
      )}

      <span className="text-[22px] mb-1.5">{DayThemeIcon(day.theme)}</span>
      <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isCurrent ? 'text-primary-light' : isCompleted ? 'text-primary' : 'text-white/30'}`}>
        Day {day.day}
      </span>
      <span className="text-white text-[11px] font-semibold leading-tight">{day.theme}</span>
    </motion.button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function AnxietyReset() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useStore(s => s.user);
  const getAuthHeader = useStore(s => s.getAuthHeader);

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [programDays, setProgramDays] = useState([]);

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
      const data = await res.json();

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
    return dayNum <= currentDay;
  };

  if (loading) return <PageSkeleton />;

  // ── Intro / Start Screen ──────────────────────────────────────────────────────
  if (!progress) {
    return (
      <div className="min-h-screen bg-bg flex flex-col pb-nav">
        <div className="px-5 pt-safe pt-12 pb-6 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col px-5"
        >
          {/* Hero */}
          <div className="relative rounded-3xl overflow-hidden mb-8 p-8"
            style={{ background: 'linear-gradient(135deg, rgba(124,106,245,0.2) 0%, rgba(192,132,252,0.15) 100%)', border: '1px solid rgba(124,106,245,0.25)' }}>
            <div className="absolute -right-8 -bottom-8 text-[120px] opacity-15">🌿</div>
            <span className="text-[11px] font-black text-primary-light uppercase tracking-[0.2em] mb-3 block">21-Day Program</span>
            <h1 className="text-[32px] font-bold text-white tracking-tight leading-tight mb-3">
              Anxiety Reset<br/>Journey
            </h1>
            <p className="text-white/60 text-[15px] leading-relaxed font-medium">
              A structured 21-day program combining mindfulness, CBT techniques, and daily reflection to transform your relationship with anxiety.
            </p>
          </div>

          {/* What you'll get */}
          <div className="mb-8">
            <h2 className="text-[15px] font-bold text-white/50 uppercase tracking-widest mb-4">What's included</h2>
            {[
              { icon: '📅', text: '21 structured daily sessions' },
              { icon: '🧘', text: 'Guided exercises & meditations' },
              { icon: '📝', text: 'Daily reflection prompts' },
              { icon: '✅', text: 'Actionable daily micro-tasks' },
              { icon: '📊', text: 'Progress tracking & streaks' },
              { icon: '🔒', text: 'Day-by-day content unlocking' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 mb-3">
                <span className="text-[20px]">{icon}</span>
                <p className="text-white/75 text-[15px] font-medium">{text}</p>
              </div>
            ))}
          </div>

          {/* Support plans preview */}
          <div className="bg-surface2 border border-white/6 rounded-2xl p-5 mb-8">
            <p className="text-[11px] font-black text-gold uppercase tracking-widest mb-3">✦ Optional Premium Support</p>
            <p className="text-white/70 text-[14px] leading-relaxed mb-4">
              Enhance your journey with a dedicated guide — AI Psychologist, Spiritual Guide, or Life Coach.
            </p>
            <div className="flex gap-2.5">
              {PLANS.map(p => (
                <div key={p.id} className={`flex-1 p-3 rounded-2xl bg-gradient-to-br ${p.color} ${p.border} border text-center`}>
                  <span className="text-[22px] block mb-1">{p.icon}</span>
                  <span className={`text-[10px] font-bold ${p.accent}`}>{p.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-[17px] btn-glow hover:opacity-90 transition-all active:scale-95 mb-4"
          >
            Begin My Journey 🌿
          </button>
          <button onClick={() => navigate(-1)} className="text-white/30 text-[14px] text-center py-2">Not now</button>
        </motion.div>
      </div>
    );
  }

  // ── Active Program View ───────────────────────────────────────────────────────
  const todayContent = programDays.find(d => d.day === currentDay);
  const completedDays = progress?.dailyEntries?.filter(e => e.completedAt)?.length || 0;
  const progressPct = Math.round((completedDays / 21) * 100);

  return (
    <div className="min-h-screen bg-bg pb-nav">
      {/* ── Header ── */}
      <div className="px-5 pt-12 pb-4 sticky top-0 ios-glass border-b border-white/5 z-20">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="text-center">
            <h1 className="text-[17px] font-bold text-white tracking-tight">Anxiety Reset</h1>
            <p className="text-[11px] text-white/40">Day {currentDay} of 21</p>
          </div>
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-full">
            <Flame size={12} className="text-amber-400" />
            <span className="text-[11px] text-amber-300 font-bold">{progress.streakCount}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-[11px] text-white/30 mb-1.5">
            <span>Progress</span>
            <span>{completedDays}/21 days · {progressPct}%</span>
          </div>
          <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 bg-surface2 p-1 rounded-2xl">
          {[{ id: 'today', label: "Today's Day" }, { id: 'journey', label: '21 Days' }, { id: 'plans', label: 'Support Plans' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-xl text-[12px] font-bold transition-all ${activeTab === tab.id ? 'bg-primary text-white' : 'text-white/40'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── TODAY TAB ── */}
        {activeTab === 'today' && todayContent && (
          <motion.div key="today" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 pt-6 pb-8">
            {isDayCompleted(currentDay) ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12">
                <div className="text-[64px] mb-4">🌟</div>
                <h2 className="text-[24px] font-bold text-white mb-2">Day {currentDay} Complete!</h2>
                <p className="text-white/50 text-[15px] mb-8">You're building something real. Come back tomorrow.</p>
                {currentDay < 21 && (
                  <div className="bg-surface2 border border-white/6 rounded-2xl p-5 text-left">
                    <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-2">Tomorrow — Day {currentDay + 1}</p>
                    <p className="text-white font-bold text-[17px]">{programDays[currentDay]?.title}</p>
                    <p className="text-white/50 text-[13px] mt-1">{programDays[currentDay]?.theme}</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <>
                {/* Plan badge */}
                {activePlan && (
                  <div className={`flex items-center gap-2 ${activePlan.accentBg} border ${activePlan.border} rounded-xl px-4 py-2.5 mb-5`}>
                    <span className="text-[18px]">{activePlan.icon}</span>
                    <p className={`text-[12px] font-bold ${activePlan.accent}`}>{activePlan.name} track active</p>
                  </div>
                )}

                {/* Day header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-black text-primary-light uppercase tracking-widest bg-primary/15 border border-primary/25 px-2.5 py-0.5 rounded-full">
                      Day {todayContent.day} · {todayContent.theme}
                    </span>
                  </div>
                  <h2 className="text-[26px] font-bold text-white tracking-tight mb-2">{todayContent.title}</h2>
                  <p className="text-white/55 text-[15px] leading-relaxed">{todayContent.desc}</p>
                </div>

                {/* Exercise */}
                <div className={`rounded-2xl border p-5 mb-4 transition-all ${exerciseDone ? 'bg-primary/15 border-primary/30' : 'bg-surface2 border-white/6'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Guided Exercise</p>
                      <h3 className="text-white font-bold text-[16px] mb-1">{todayContent.exercise}</h3>
                      <p className="text-white/50 text-[13px]">Complete this to mark the exercise done</p>
                    </div>
                    <button
                      onClick={() => setExerciseDone(!exerciseDone)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ml-3 shrink-0 transition-all ${exerciseDone ? 'bg-primary border-primary' : 'border-white/20 hover:border-primary/50'}`}
                    >
                      {exerciseDone && <CheckCircle2 size={16} className="text-white fill-white" />}
                    </button>
                  </div>
                  {!exerciseDone && (
                    <button
                      onClick={() => navigate('/meditate')}
                      className="mt-4 flex items-center gap-2 text-primary text-[13px] font-semibold"
                    >
                      <Play size={14} /> Open meditation player
                    </button>
                  )}
                </div>

                {/* Reflection */}
                <div className="bg-surface2 border border-white/6 rounded-2xl p-5 mb-4">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Daily Reflection</p>
                  <p className="text-white font-semibold text-[15px] leading-snug mb-4">"{todayContent.reflection}"</p>
                  <textarea
                    value={journalResponse}
                    onChange={(e) => setJournalResponse(e.target.value)}
                    placeholder="Write your thoughts here..."
                    className="w-full bg-bg/60 border border-white/6 rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 transition-colors resize-none"
                    rows={4}
                  />
                </div>

                {/* Task */}
                <div className={`rounded-2xl border p-5 mb-6 transition-all ${taskDone ? 'bg-success/10 border-success/25' : 'bg-surface2 border-white/6'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Today's Task</p>
                      <p className="text-white font-medium text-[14px] leading-relaxed">{todayContent.task}</p>
                    </div>
                    <button
                      onClick={() => setTaskDone(!taskDone)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ml-3 shrink-0 transition-all ${taskDone ? 'bg-success border-success' : 'border-white/20 hover:border-success/50'}`}
                    >
                      {taskDone && <CheckCircle2 size={16} className="text-white" />}
                    </button>
                  </div>
                </div>

                {/* Complete button */}
                <button
                  onClick={() => handleCompleteDay(currentDay)}
                  disabled={completing}
                  className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-[16px] btn-glow hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
          <motion.div key="journey" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 pt-6 pb-8">
            <p className="text-white/40 text-[13px] font-medium mb-5">Tap a day to see its content. Locked days unlock as you progress.</p>

            <div className="grid grid-cols-4 gap-2.5">
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
          <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 pt-6 pb-8">
            <div className="mb-6">
              <h2 className="text-[22px] font-bold text-white tracking-tight mb-2">Choose Your Guide</h2>
              <p className="text-white/50 text-[14px] leading-relaxed">
                Personalize your 21-day experience with expert daily support. Each plan tailors your reflections, guidance style, and daily insights.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {PLANS.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isSelected={selectedPlan === plan.key}
                  isPurchased={progress?.planPurchased && selectedPlan === plan.key}
                  onSelect={(key) => {/* switch plan */}}
                  onPurchase={(p) => {
                    setPurchasingPlan(p);
                    setShowPurchaseModal(true);
                  }}
                />
              ))}
            </div>

            {!progress?.planPurchased && (
              <div className="mt-4 p-4 bg-white/3 border border-white/5 rounded-2xl text-center">
                <p className="text-white/30 text-[12px] font-medium">The free program runs without a plan. Plans add personalized daily guidance.</p>
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
              onClick={() => setDayView(false)} className="fixed inset-0 bg-black/60 z-50" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-x-0 bottom-0 h-[70dvh] bg-surface2 border-t border-white/8 rounded-t-3xl z-[51] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-5 border-b border-white/5">
                <div>
                  <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider">Day {selectedDay.day} · {selectedDay.theme}</p>
                  <h3 className="text-white font-bold text-[18px] mt-0.5">{selectedDay.title}</h3>
                </div>
                <button onClick={() => setDayView(false)} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
                  <X size={16} className="text-white/50" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <p className="text-white/65 text-[15px] leading-relaxed">{selectedDay.desc}</p>
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                  <p className="text-[10px] font-black text-primary-light uppercase tracking-widest mb-2">Exercise</p>
                  <p className="text-white font-semibold text-[15px]">{selectedDay.exercise}</p>
                </div>
                <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4">
                  <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2">Reflection</p>
                  <p className="text-white/80 text-[14px] italic leading-relaxed">"{selectedDay.reflection}"</p>
                </div>
                <div className="bg-teal/10 border border-teal/20 rounded-xl p-4">
                  <p className="text-[10px] font-black text-teal uppercase tracking-widest mb-2">Task</p>
                  <p className="text-white/80 text-[14px] leading-relaxed">{selectedDay.task}</p>
                </div>
                {selectedDay.day === currentDay && !isDayCompleted(selectedDay.day) && (
                  <button onClick={() => { setDayView(false); setActiveTab('today'); }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-[15px] btn-glow">
                    Start Today's Work →
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
