import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';

export function Splash() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-bg flex flex-col items-center justify-center overflow-hidden px-6">

      <div className="z-10 flex flex-col items-center text-center w-full max-w-sm">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[40px] font-bold text-white tracking-tighter"
        >
          ANANT SUTRAM
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-[17px] font-medium text-white mt-1 tracking-tight"
        >
          Talk. Heal. Grow.
        </motion.p>
        
        <div className="h-10"></div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-[15px] font-medium tracking-tight text-white/50"
        >
          Someone to talk to, anytime.
        </motion.p>
        
        <div className="h-12"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="w-full flex flex-col items-center space-y-6"
        >
          <Button onClick={() => navigate('/onboarding')} className="w-full">
            Begin Your Journey &rarr;
          </Button>

          <button 
            onClick={() => navigate('/signin')}
            className="text-[13px] text-white/40 hover:text-white/70 transition-colors bg-transparent border-none outline-none cursor-pointer"
          >
            I already have an account
          </button>
        </motion.div>
      </div>
    </div>
  );
}
