import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ArrowRight } from 'lucide-react';

export function Splash() {
  const navigate = useNavigate();
  const user = useStore(s => s.user);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;

    // Check for token in localStorage first (fastest path)
    const token = localStorage.getItem('token');

    if (user && token) {
      // User is logged in — go straight to home, no splash animation needed
      hasRedirected.current = true;
      navigate('/home', { replace: true });
      return;
    }

    if (!token && !user) {
      // Definitely not logged in — show splash as normal
      return;
    }
  }, [user, navigate]);

  // If user is logged in, render nothing while redirecting
  const token = localStorage.getItem('token');
  if (user && token) return null;

  return (
    <div className="relative min-h-[100dvh] bg-bg flex flex-col items-center justify-center overflow-x-hidden px-8 py-12">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 flex items-center justify-center">
        {/* Blurry atmospheric backdrop image */}
        <div className="absolute inset-0 opacity-40 mix-blend-multiply flex items-center justify-center">
            <img 
               src="/lotus.png" 
               alt="" 
               className="w-[120%] h-[120%] object-cover blur-[100px] saturate-[1.5] animate-pulse-slow" 
               style={{ willChange: 'transform, filter' }}
            />
        </div>
        
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[20%] w-[80%] h-[80%] rounded-full bg-primary/40 blur-[120px]"
          style={{ willChange: 'transform, opacity' }}
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.25, 0.1],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -left-[20%] w-[80%] h-[80%] rounded-full bg-secondary/40 blur-[120px]"
          style={{ willChange: 'transform, opacity' }}
        />
      </div>

      <div className="z-10 flex flex-col items-center text-center w-full max-w-sm">
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1.2, cubicBezier: [0.16, 1, 0.3, 1] }}
           className="mb-12 relative"
        >
           <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
           <div className="relative w-32 h-32 rounded-[36px] bg-white border border-subtle flex items-center justify-center shadow-lg p-2 overflow-hidden">
              <span className="text-[64px] drop-shadow-sm">🪷</span>
           </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-[44px] font-black text-main tracking-[-0.04em] leading-none mb-4">
            ANANT<br/>SUTRAM
          </h1>
          <p className="text-[17px] font-bold text-primary uppercase tracking-[0.2em] opacity-90 mb-8">
            Talk · Heal · Grow
          </p>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-[16px] font-bold tracking-tight text-sub mb-16 leading-relaxed"
        >
          A sanctuary for your thoughts.<br/>Available whenever you need.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9, cubicBezier: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col items-center gap-6"
        >
          <button 
            onClick={() => navigate('/signin')} 
            className="w-full h-18 py-5 rounded-[24px] bg-primary text-white font-black text-[16px] uppercase tracking-[0.2em] btn-glow shadow-glow-primary flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            Begin Journey
            <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
