import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, Shield, Zap, ChevronLeft, Star, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';

const TIER_RANK = { free: 0, shakti: 1, moksha: 2 };

const PLANS = {
  free: {
    name: 'AURA',
    emoji: '🌱',
    price: { monthly: '₹0', yearly: '₹0' },
    color: '#6B7280',
    glowColor: 'rgba(107, 114, 128, 0.12)',
    features: [
      '5 AI Psychologist sessions/month',
      'Basic mood tracking',
      'Community reading',
    ],
  },
  shakti: {
    name: 'SHAKTI',
    emoji: '⚡',
    badge: 'Most Popular',
    price: { monthly: '₹99', yearly: '₹999' },
    color: '#7C3AED',
    glowColor: 'rgba(124, 58, 237, 0.22)',
    features: [
      'Unlimited AI Chat — Psychologist, Coach & Spiritual Guide',
      'Smart Journaling with Insights',
      'All Self-Assessments Unlocked',
      'Panic SOS & Breathing Sessions',
      '2 Free Healer Sessions/month',
      'All Anxiety Reset Plans',
    ],
  },
  moksha: {
    name: 'MOKSHA',
    emoji: '🌟',
    badge: 'Ultimate Healing',
    price: { monthly: '₹499', yearly: '₹2,499' },
    color: '#D97706',
    glowColor: 'rgba(217, 119, 6, 0.22)',
    features: [
      'Everything in Shakti',
      '5 Free Healer Sessions/month',
      'Voice AI Healer (Coming Soon)',
      'Priority Support',
      'Early Feature Access',
    ],
  },
};

export function Subscribe() {
  const navigate     = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading]   = useState(null);
  const [toast, setToast]       = useState(null);
  const setSubscription          = useStore(s => s.setSubscription);
  const currentTier              = useStore(s => s.user?.subscription || 'free');

  const showToast = (tier, type) => {
    setToast({ tier, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleAction = async (tier) => {
    if (tier === currentTier) return;
    setLoading(tier);
    await setSubscription(tier);
    setLoading(null);
    const type = TIER_RANK[tier] >= TIER_RANK[currentTier] ? 'upgrade' : 'downgrade';
    showToast(tier, type);
    if (type === 'upgrade') setTimeout(() => navigate('/home'), 2000);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: 'var(--bg-app)' }}>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (() => {
          const p = PLANS[toast.tier];
          return (
            <motion.div
              key="toast"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-white text-[13px] font-bold flex items-center gap-2 max-w-[88vw] text-center"
              style={{ background: p.color }}
            >
              {p.emoji}{' '}
              {toast.type === 'upgrade'
                ? `${p.name} activated! Heading home…`
                : `Downgraded to ${p.name}.`}
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ── Header ── */}
      <div
        className="sticky top-0 z-20 pt-12 pb-4 px-6 flex items-center gap-4"
        style={{ background: 'var(--bg-app)' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-surface border border-soft flex items-center justify-center text-sub active:scale-90 transition-all shadow-sm"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-[18px] font-bold text-main tracking-tight">Plans & Billing</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-16">
        {/* Hero */}
        <div className="px-6 pt-1 pb-6 text-center">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-4">
            <Sparkles size={13} className="text-primary" />
            <span className="text-[11px] font-black text-primary uppercase tracking-widest">
              Prototype · No Real Payment
            </span>
          </div>
          <h2 className="text-[28px] font-black text-main leading-tight tracking-tight mb-2">
            Choose Your Plan
          </h2>
          <p className="text-sub text-[14px] font-medium">
            Tap any plan to activate instantly.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-6 px-6">
          <div className="bg-surface border border-soft p-1 rounded-full flex shadow-sm">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all ${!isYearly ? 'bg-primary text-white shadow-md' : 'text-sub'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2.5 rounded-full text-[13px] font-bold transition-all flex items-center gap-2 ${isYearly ? 'bg-primary text-white shadow-md' : 'text-sub'}`}
            >
              Yearly
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-green-100 text-green-600 uppercase tracking-wider">
                -30%
              </span>
            </button>
          </div>
        </div>

        <div className="px-5 space-y-4 relative z-10">
          {['free', 'shakti', 'moksha'].map(tier => (
            <PlanCard
              key={tier}
              tier={tier}
              plan={PLANS[tier]}
              isYearly={isYearly}
              currentTier={currentTier}
              isLoading={loading === tier}
              onAction={handleAction}
            />
          ))}

          <div className="flex flex-col items-center pt-2 pb-2 gap-1.5 text-center">
            <Shield size={18} className="text-muted opacity-40" />
            <p className="text-[11px] font-bold text-muted tracking-wide">Prototype — no real charges</p>
          </div>
        </div>

        {/* Decorative Blurry Gradients */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[20%] -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute top-[50%] -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] left-[20%] w-72 h-72 bg-gold/5 rounded-full blur-[100px]" />
        </div>
      </div>
    </div>
  );
}

function PlanCard({ tier, plan, isYearly, currentTier, isLoading, onAction }) {
  const isCurrent   = currentTier === tier;
  const isUpgrade   = TIER_RANK[tier] > TIER_RANK[currentTier];
  const isDowngrade = TIER_RANK[tier] < TIER_RANK[currentTier];
  const isFree      = tier === 'free';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-[32px] overflow-hidden border backdrop-blur-md"
      style={{
        background: isCurrent
          ? `linear-gradient(145deg, ${plan.glowColor}, rgba(255,255,255,0.7))`
          : 'rgba(255,255,255,0.6)',
        borderColor: isCurrent ? `${plan.color}55` : 'rgba(255,255,255,0.5)',
        boxShadow: isCurrent ? `0 20px 40px ${plan.glowColor}` : '0 4px 20px rgba(0,0,0,0.03)',
      }}
    >
      {/* Internal Blurry Blobs */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: plan.color }} />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none" style={{ background: plan.color }} />
      {/* Top banner — full width, no overlap possible */}
      {isCurrent ? (
        <div
          className="w-full py-2 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white"
          style={{ background: plan.color }}
        >
          <CheckCircle2 size={12} />
          Activated — Current Plan
        </div>
      ) : plan.badge ? (
        <div
          className="w-full py-2 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white"
          style={{ background: plan.color }}
        >
          <Star size={10} className="fill-white" />
          {plan.badge}
        </div>
      ) : null}

      <div className="p-6">
        {/* Name + price row — always in a single row, no absolute badges */}
        <div className="flex items-center justify-between mb-5">
          <p
            className="text-[13px] font-black tracking-[0.18em]"
            style={{ color: plan.color }}
          >
            {plan.emoji} {plan.name}
          </p>
          <div className="text-right">
            <span className="text-main font-black text-[22px] leading-none">
              {isFree ? 'Free' : (isYearly ? plan.price.yearly : plan.price.monthly)}
            </span>
            {!isFree && (
              <span className="text-muted text-[12px] font-medium ml-0.5">
                /{isYearly ? 'yr' : 'mo'}
              </span>
            )}
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-6">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-start gap-3 text-[13px] text-sub font-medium leading-snug">
              <CheckCircle2 size={14} className="shrink-0 mt-0.5" style={{ color: plan.color }} />
              {f}
            </li>
          ))}
        </ul>

        {/* Action Button */}
        {isCurrent ? (
          <div
            className="w-full py-3.5 rounded-2xl text-center text-[13px] font-black tracking-wide border"
            style={{
              color: plan.color,
              borderColor: `${plan.color}33`,
              background: `${plan.color}0D`,
            }}
          >
            ✓ Activated
          </div>
        ) : isDowngrade ? (
          <button
            onClick={() => onAction(tier)}
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl text-[13px] font-semibold tracking-wide transition-all active:scale-[0.97] border flex items-center justify-center gap-2 text-sub disabled:opacity-60"
            style={{ borderColor: 'var(--border-soft)', background: 'var(--surface)' }}
          >
            {isLoading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"
              />
            ) : (
              <>
                <ChevronDown size={14} className="shrink-0" />
                Downgrade to {plan.name}
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => onAction(tier)}
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl text-white font-black text-[14px] uppercase tracking-wide transition-all active:scale-[0.97] disabled:opacity-70 flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(90deg, ${plan.color}, ${plan.color}AA)`,
              boxShadow: `0 4px 16px ${plan.glowColor}`,
            }}
          >
            {isLoading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                <Zap size={14} className="fill-white shrink-0" />
                Unlock {plan.name}
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
