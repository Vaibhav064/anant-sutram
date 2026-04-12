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

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      {/* Dismiss button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-12 left-6 z-20 w-10 h-10 rounded-[14px] bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
      >
        <X size={20} />
      </button>

      <AnimatePresence mode="wait">
        {phase === 'breathe' && (
          <motion.div
            key="breathe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full overflow-y-auto"
          >
            {/* Title Section */}
            <div className="text-center relative z-10 pt-16 px-6 pb-4 shrink-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1.5 bg-white border border-[#F0C2C2] px-4 py-1.5 rounded-[12px] mb-5 shadow-sm"
              >
                <Heart size={14} className="text-[#D4A1A1] fill-[#F0C2C2]" />
                <span className="text-[10px] font-bold text-[#D4A1A1] uppercase tracking-widest">Safe Space</span>
              </motion.div>
              <h1 className="text-[36px] font-bold text-gray-900 tracking-tight leading-none mb-3">
                You are safe.
              </h1>
              <p className="text-gray-500 text-[16px] font-medium tracking-tight">Let's find your center together.</p>
            </div>

            {/* Breathing orb */}
            <div className="flex items-center justify-center py-4 relative shrink-0">
              <div className="relative">
                {/* Layered Pulsing Backgrounds */}
                <motion.div
                  animate={{ scale: breatheIn ? 1.6 : 0.7, opacity: breatheIn ? 0.3 : 0 }}
                  transition={{ duration: BREATHE_DURATION / 1000, ease: 'easeInOut' }}
                  className="absolute inset-[15%] rounded-full bg-[#F0C2C2] blur-3xl pointer-events-none"
                />
                
                <motion.div
                  animate={{ 
                    scale: breatheIn ? 1.8 : 0.8, 
                    opacity: breatheIn ? 0.4 : 0,
                    rotate: [0, 90]
                  }}
                  transition={{ duration: BREATHE_DURATION / 1000, ease: 'linear', rotate: { duration: 16, repeat: Infinity } }}
                  className="absolute inset-[-40%] rounded-full border border-[#F0C2C2] border-dashed pointer-events-none"
                />
                
                {/* Main Orb */}
                <motion.div
                  animate={{ scale: breatheIn ? 1.25 : 0.85 }}
                  transition={{ duration: BREATHE_DURATION / 1000, ease: 'easeInOut' }}
                  className="w-52 h-52 rounded-full bg-white border border-[#F0C2C2] flex flex-col items-center justify-center shadow-xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#F0C2C2]/30 to-transparent opacity-50" />
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={breatheIn ? 'in' : 'out'}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center relative z-10"
                    >
                       <p className="text-[#D4A1A1] text-[10px] font-bold uppercase tracking-widest mb-1">
                         {breatheIn ? 'Inhale' : 'Exhale'}
                       </p>
                       <span className="text-[#A36B6B] text-[24px] font-bold tracking-tight uppercase">
                         {breatheIn ? 'Breathe' : 'Release'}
                       </span>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full px-6 pb-10 shrink-0">
              <div className="mb-6 text-center">
                 <div className="inline-flex gap-1.5 justify-center mb-3">
                    {[1,2,3].map(i => (
                       <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${breathCount >= i ? 'bg-[#D4A1A1] scale-125' : 'bg-gray-200'}`} />
                    ))}
                 </div>
                 <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    {breathCount < 3 ? `${3 - breathCount} Breaths Remaining` : 'Center Found'}
                 </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setPhase('ground')}
                  className="h-14 rounded-2xl bg-white border border-gray-200 text-gray-800 font-bold text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                >
                  Grounding Exercise
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
                
                <button
                  onClick={() => navigate('/chat')}
                  className="h-14 rounded-2xl bg-[#D4A1A1] text-white font-bold text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md hover:bg-[#C48C8C]"
                >
                  <MessageCircle size={18} />
                  Talk to Guide
                </button>
              </div>

              <div className="mt-6 text-center">
                <a href="tel:9152987821" className="inline-flex items-center gap-2 bg-red-50 px-5 py-2.5 rounded-xl border border-red-100 text-red-500 font-bold text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95">
                  <Phone size={12} strokeWidth={3} />
                  Emergency Helpline
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'ground' && (
          <motion.div
            key="ground"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full px-6 py-20"
          >
            <div className="pt-4 mb-8">
              <p className="text-[#D4A1A1] text-[10px] font-bold uppercase tracking-widest mb-2 border border-[#F0C2C2] bg-white inline-block px-3 py-1 rounded-lg shadow-sm">Grounding Protocol</p>
              <h2 className="text-[32px] font-bold text-gray-900 tracking-tight leading-none mt-2">5-4-3-2-1 Method</h2>
              <p className="text-gray-500 text-[15px] mt-2 font-medium">Take a moment with each realization.</p>
            </div>

            {/* Progress indicators */}
            <div className="flex gap-2.5 mb-10">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === stepIdx ? 'bg-[#D4A1A1] flex-1' : i < stepIdx ? 'bg-[#F0C2C2] w-4' : 'bg-gray-200 w-4'}`}
                />
              ))}
            </div>

            {/* Step card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={stepIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col items-center justify-center text-center px-4"
              >
                <div className="relative mb-6">
                   <div className="absolute inset-0 bg-[#F0C2C2]/40 blur-2xl rounded-full" />
                   <div className="relative w-28 h-28 rounded-3xl bg-white border border-gray-100 flex items-center justify-center text-[48px] shadow-lg">
                     {STEPS[stepIdx].icon}
                   </div>
                   <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[20px] font-black text-[#D4A1A1] shadow-md">
                      {STEPS[stepIdx].number}
                   </div>
                </div>
                
                <h3 className="text-[26px] font-bold text-gray-900 mb-3 tracking-tight leading-tight">
                  {STEPS[stepIdx].title}
                </h3>
                <p className="text-gray-500 text-[16px] leading-relaxed font-medium">
                  {STEPS[stepIdx].desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button
                disabled={stepIdx === 0}
                onClick={() => setStepIdx(i => i - 1)}
                className={`h-14 rounded-2xl flex items-center justify-center font-bold text-[13px] uppercase tracking-widest transition-all ${stepIdx === 0 ? 'opacity-0 pointer-events-none' : 'bg-white border border-gray-200 text-gray-500 shadow-sm active:scale-95 hover:bg-gray-50'}`}
              >
                Back
              </button>
              
              {stepIdx < STEPS.length - 1 ? (
                <button
                  onClick={() => setStepIdx(i => i + 1)}
                  className="h-14 rounded-2xl bg-[#1E2A4A] text-white font-bold text-[13px] uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                >
                  Next <ChevronRight size={16} className="text-white/70" />
                </button>
              ) : (
                <button
                  onClick={() => setPhase('done')}
                  className="h-14 rounded-2xl bg-[#D4A1A1] text-white font-bold text-[13px] uppercase tracking-widest shadow-md transform active:scale-95 transition-all"
                >
                  Complete
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
            className="flex flex-col items-center justify-center h-full text-center px-6 relative"
          >
            <div className="absolute top-[20%] w-64 h-64 bg-[#C5D5F7] opacity-20 rounded-full blur-3xl pointer-events-none" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
              className="w-24 h-24 bg-white border border-gray-100 shadow-lg rounded-3xl flex items-center justify-center text-[40px] mb-8 relative z-10"
            >
              💙
            </motion.div>
            <h2 className="text-[32px] font-bold text-gray-900 tracking-tight mb-3 relative z-10">
              You did it.
            </h2>
            <p className="text-gray-500 text-[15px] leading-relaxed max-w-xs mb-10 font-medium relative z-10">
              That took courage. You're still here, and that matters. Take this peace with you.
            </p>

            <div className="w-full max-w-sm flex flex-col gap-3 relative z-10">
              <button onClick={() => navigate('/chat')}
                className="w-full py-4 bg-white border border-gray-200 text-[#1E2A4A] font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 hover:bg-gray-50">
                <MessageCircle size={16} /> Talk to your AI guide
              </button>
              <button onClick={() => navigate('/meditate')}
                className="w-full py-4 bg-white border border-[#C2E8D8] text-[#1A3D2E] font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 hover:bg-gray-50">
                🪴 Try a meditation
              </button>
              <button onClick={() => navigate('/home')}
                className="w-full py-4 text-gray-400 font-bold text-[13px] uppercase tracking-widest hover:text-gray-600 transition-colors">
                Return home
              </button>
            </div>

            <div className="absolute bottom-10 w-full px-8 flex justify-center pb-safe">
               <a href="tel:9152987821" className="bg-red-50 border border-red-100 shadow-sm px-5 py-3.5 rounded-2xl flex items-center gap-3 w-full max-w-sm justify-center active:scale-95 transition-transform">
                 <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                 <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
                    Emergency Helpline · 9152987821
                 </span>
               </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
