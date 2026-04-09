import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, Heart, X, ChevronRight } from 'lucide-react';

const STEPS = [
  { id: 'ground', title: '5-4-3-2-1 Grounding', desc: 'Name 5 things you can see right now', number: '5', icon: '👁️' },
  { id: 'feel', title: 'Feel Your Body', desc: 'Name 4 things you can physically touch or feel', number: '4', icon: '🤲' },
  { id: 'hear', title: 'Listen', desc: 'Name 3 things you can hear around you', number: '3', icon: '👂' },
  { id: 'smell', title: 'Notice Scents', desc: 'Name 2 things you can smell', number: '2', icon: '🌸' },
  { id: 'taste', title: 'Stay Present', desc: 'Name 1 thing you\'re grateful for right now', number: '1', icon: '💙' },
];

export function SOS() {
  const navigate = useNavigate();
  const [breatheIn, setBreatheIn] = useState(true);
  const [phase, setPhase] = useState('breathe'); // 'breathe' | 'ground' | 'done'
  const [stepIdx, setStepIdx] = useState(0);
  const [breathCount, setBreathCount] = useState(0);

  const BREATHE_DURATION = 4000; // 4s in, 4s out

  useEffect(() => {
    const interval = setInterval(() => {
      setBreatheIn(prev => {
        if (!prev) setBreathCount(c => c + 1);
        return !prev;
      });
    }, BREATHE_DURATION);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance from breathe to ground after 3 full cycles
  useEffect(() => {
    if (breathCount >= 3 && phase === 'breathe') {
      // Don't auto-advance — let user choose
    }
  }, [breathCount, phase]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#050010] flex flex-col h-[100dvh] overflow-hidden">
      {/* Dismiss button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-12 right-5 z-20 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
      >
        <X size={18} />
      </button>

      <AnimatePresence mode="wait">
        {phase === 'breathe' && (
          <motion.div
            key="breathe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-between h-full py-16 px-6"
          >
            {/* Title */}
            <div className="text-center pt-4">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[30px] font-bold text-white tracking-tight mb-2"
              >
                You are safe.
              </motion.h1>
              <p className="text-white/40 text-[14px]">Let's breathe together.</p>
            </div>

            {/* Breathing orb */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                {/* Outer glow rings */}
                <motion.div
                  animate={{ scale: breatheIn ? 1.6 : 0.8, opacity: breatheIn ? 0.15 : 0 }}
                  transition={{ duration: BREATHE_DURATION / 1000, ease: 'easeInOut' }}
                  className="absolute w-64 h-64 rounded-full bg-secondary"
                />
                <motion.div
                  animate={{ scale: breatheIn ? 1.3 : 0.85, opacity: breatheIn ? 0.25 : 0.05 }}
                  transition={{ duration: BREATHE_DURATION / 1000, ease: 'easeInOut' }}
                  className="absolute w-52 h-52 rounded-full bg-primary"
                />
                {/* Main orb */}
                <motion.div
                  animate={{ scale: breatheIn ? 1.2 : 0.75 }}
                  transition={{ duration: BREATHE_DURATION / 1000, ease: 'easeInOut' }}
                  className="w-44 h-44 rounded-full bg-gradient-to-br from-primary/60 to-secondary/60 border border-primary/30 flex items-center justify-center"
                  style={{ boxShadow: '0 0 60px rgba(124,106,245,0.4)' }}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={breatheIn ? 'in' : 'out'}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                      className="text-white text-[16px] font-semibold tracking-widest"
                    >
                      {breatheIn ? 'Breathe In' : 'Breathe Out'}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>

            {/* Breath counter */}
            <div className="text-center mb-4">
              <p className="text-white/25 text-[12px] font-medium tracking-wider mb-6">
                {breathCount < 3 ? `${3 - breathCount} more breath${3 - breathCount === 1 ? '' : 's'} to start grounding` : 'Ready when you are'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                <button
                  onClick={() => setPhase('ground')}
                  className="w-full py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl text-[15px] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  Start Grounding Exercise <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => navigate('/chat')}
                  className="w-full py-3.5 bg-primary/20 border border-primary/30 text-primary-light font-semibold rounded-2xl text-[14px] hover:bg-primary/30 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} /> Talk to AI now
                </button>
              </div>
            </div>

            {/* Emergency */}
            <div className="text-center pb-2">
              <a
                href="tel:9152987821"
                className="text-[12px] text-red-400/70 font-semibold tracking-wider hover:text-red-400 transition-colors flex items-center justify-center gap-2"
              >
                <Phone size={13} /> iCall Helpline: 9152987821
              </a>
            </div>
          </motion.div>
        )}

        {phase === 'ground' && (
          <motion.div
            key="ground"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="flex flex-col h-full px-6 py-16"
          >
            <div className="pt-4 mb-8">
              <p className="text-primary-light text-[12px] font-bold uppercase tracking-widest mb-2">Grounding Technique</p>
              <h2 className="text-[26px] font-bold text-white tracking-tight">5-4-3-2-1 Method</h2>
              <p className="text-white/40 text-[14px] mt-1">Take your time with each step.</p>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2 mb-8">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i <= stepIdx ? 'bg-primary flex-1' : 'bg-white/10 w-6'}`}
                />
              ))}
            </div>

            {/* Step card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={stepIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <div className="w-24 h-24 rounded-3xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-6 text-[40px]">
                  {STEPS[stepIdx].icon}
                </div>
                <div className="text-[64px] font-black gradient-text mb-2 leading-none">
                  {STEPS[stepIdx].number}
                </div>
                <h3 className="text-[22px] font-bold text-white mb-3 tracking-tight">
                  {STEPS[stepIdx].title}
                </h3>
                <p className="text-white/60 text-[16px] leading-relaxed max-w-xs">
                  {STEPS[stepIdx].desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3 mt-8 mb-2">
              {stepIdx > 0 && (
                <button
                  onClick={() => setStepIdx(i => i - 1)}
                  className="flex-1 py-4 bg-white/5 border border-white/8 text-white/60 font-semibold rounded-2xl text-[15px] hover:bg-white/10 transition-all"
                >
                  Back
                </button>
              )}
              {stepIdx < STEPS.length - 1 ? (
                <button
                  onClick={() => setStepIdx(i => i + 1)}
                  className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl text-[15px] btn-glow hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  Next Step <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setPhase('done')}
                  className="flex-1 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-2xl text-[15px] btn-glow hover:opacity-90 transition-all"
                >
                  I feel more grounded ✓
                </button>
              )}
            </div>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
              className="text-[72px] mb-6"
            >
              💙
            </motion.div>
            <h2 className="text-[28px] font-bold text-white tracking-tight mb-3">
              You did it.
            </h2>
            <p className="text-white/50 text-[16px] leading-relaxed max-w-xs mb-12">
              That took courage. You're still here, and that matters. Take this peace with you.
            </p>

            <div className="w-full max-w-xs flex flex-col gap-3">
              <button onClick={() => navigate('/chat')}
                className="w-full py-4 bg-primary/20 border border-primary/30 text-primary-light font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/30 transition-all">
                <MessageCircle size={17} /> Talk to your AI guide
              </button>
              <button onClick={() => navigate('/meditate')}
                className="w-full py-4 bg-white/5 border border-white/8 text-white/70 font-semibold rounded-2xl hover:bg-white/10 transition-all">
                🪴 Try a meditation
              </button>
              <button onClick={() => navigate('/home')}
                className="w-full py-3 text-white/30 text-[14px] hover:text-white/50 transition-colors">
                Return home
              </button>
            </div>

            <div className="absolute bottom-8">
              <a href="tel:9152987821" className="text-[12px] text-red-400/60 font-semibold tracking-wider hover:text-red-400 transition-colors flex items-center gap-2">
                <Phone size={12} /> If you need immediate help · 9152987821
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
