import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE } from '../lib/api';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }

    fetch(`${API_BASE}/api/auth/verify/${token}`)
      .then(async (res) => {
        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#0F0A1E] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background orbs */}
      <motion.div
        animate={{ opacity: [0.1, 0.22, 0.1], scale: [1, 1.12, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute w-[420px] h-[420px] bg-primary rounded-full blur-3xl opacity-20 pointer-events-none -top-20 -left-20"
      />
      <motion.div
        animate={{ opacity: [0.08, 0.16, 0.08], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute w-[320px] h-[320px] bg-secondary rounded-full blur-3xl opacity-15 pointer-events-none -bottom-20 -right-20"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-sm text-center"
      >
        {status === 'loading' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-14 h-14 border-4 border-white/10 border-t-primary rounded-full mx-auto mb-6"
            />
            <h1 className="text-[28px] text-white font-bold tracking-tighter mb-3">
              Verifying your email...
            </h1>
            <p className="text-white/50 text-[14px]">Just a moment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
              className="text-6xl mb-6"
            >
              ✅
            </motion.div>
            <h1 className="text-[30px] text-white font-bold tracking-tighter mb-3">
              Email Verified!
            </h1>
            <p className="text-white/60 text-[15px] leading-relaxed mb-8">
              Your account is now active. Welcome to your healing journey.
            </p>
            <button
              onClick={() => navigate('/signin')}
              className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-[16px] hover:bg-primary/90 transition-all active:scale-95"
            >
              Sign In Now
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
              className="text-6xl mb-6"
            >
              ⏰
            </motion.div>
            <h1 className="text-[30px] text-white font-bold tracking-tighter mb-3">
              Link Expired
            </h1>
            <p className="text-white/60 text-[15px] leading-relaxed mb-8">
              This verification link is invalid or has expired. Sign up again to get a new link.
            </p>
            <button
              onClick={() => navigate('/signin')}
              className="w-full py-4 rounded-2xl bg-surface2 text-white/80 font-semibold text-[15px] border border-white/5 hover:bg-white/10 transition-all active:scale-95"
            >
              Back to Sign In
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
