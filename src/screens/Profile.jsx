import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import {
  LogOut, Settings, ChevronRight, Diamond, Flame, Star,
  Mail, Shield, Clock, Trophy
} from 'lucide-react';

function Avatar({ user, size = 'lg' }) {
  const dim = size === 'lg' ? 'w-24 h-24 text-[36px]' : 'w-14 h-14 text-[20px]';
  const initial = (user?.name || user?.nickname || '?').charAt(0).toUpperCase();

  if (user?.photoUrl) {
    return (
      <img
        src={user.photoUrl}
        alt={initial}
        referrerPolicy="no-referrer"
        className={`${dim} rounded-[32px] object-cover border-2 border-white/10 shadow-2xl transition-transform hover:scale-105`}
        onError={(e) => { 
          e.target.style.display = 'none'; 
          const parent = e.target.parentElement;
          if (parent) {
            const fallback = parent.querySelector('.avatar-fallback');
            if (fallback) fallback.classList.remove('hidden');
          }
        }}
      />
    );
  }
  return (
    <div className={`${dim} avatar-fallback hidden rounded-[32px] bg-white/5 border-2 border-white/10 flex items-center justify-center font-black text-white shadow-2xl select-none`}>
      {initial}
    </div>
  );
}

function StatCard({ icon, label, value, color = 'text-primary-light' }) {
  return (
    <div className="flex-1 bg-surface border border-soft rounded-[24px] p-5 flex flex-col items-center gap-2 shadow-sm group hover:border-primary/20 transition-all">
      <div className="w-10 h-10 rounded-xl bg-surface2 flex items-center justify-center transition-transform group-hover:scale-110">
        <span className={`${color} text-[20px]`}>{icon}</span>
      </div>
      <div className="text-center">
        <p className="text-main font-black text-[20px] leading-tight tracking-tighter">{value}</p>
        <p className="text-muted text-[9px] font-black uppercase tracking-widest mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, sub, onClick, danger = false, chevron = true }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 py-5 px-1 text-left border-b border-soft last:border-0 active:opacity-60 transition-opacity group
        ${danger ? 'text-alert' : 'text-main'}`}
    >
      <div className={`w-11 h-11 rounded-[16px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105
        ${danger ? 'bg-alert/10 border border-alert/20' : 'bg-surface2 border border-soft'}`}>
        <span className={danger ? 'text-alert' : 'text-primary-light'}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-bold tracking-tight ${danger ? 'text-alert' : 'text-main'}`}>{label}</p>
        {sub && <p className="text-[12px] text-muted font-medium truncate mt-0.5">{sub}</p>}
      </div>
      {chevron && <ChevronRight size={18} className="text-muted/40 group-hover:text-muted transition-colors shrink-0" />}
    </button>
  );
}

export function Profile() {
  const navigate = useNavigate();
  const user = useStore(s => s.user);
  const clearUser = useStore(s => s.clearUser);
  const getDisplayName = useStore(s => s.getDisplayName);
  const getFirstName = useStore(s => s.getFirstName);

  const displayName = getDisplayName?.() || user?.name || user?.nickname || 'Wanderer';
  const firstName = getFirstName?.() || displayName.split(' ')[0];
  const email = user?.email || '';
  const streak = user?.currentStreak || 0;
  const longest = user?.longestStreak || 0;
  const provider = user?.authProvider || 'email';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'Recently';

  const handleLogout = () => {
    clearUser();
    navigate('/');
  };

  return (
    <div className="min-h-screen pb-nav" style={{ background: 'var(--bg-app)' }}>

      {/* ── Hero ── */}
      <div className="relative pt-12 pb-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        
        {/* Header button */}
        <div className="flex justify-between items-center px-6 mb-8 relative z-10">
          <h1 className="text-[32px] font-black text-main tracking-tighter">Identity</h1>
          <button
            onClick={() => navigate('/settings')}
            className="w-12 h-12 rounded-[18px] bg-surface border border-soft flex items-center justify-center text-muted hover:text-main hover:bg-surface2 transition-all shadow-sm"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Avatar + name */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center px-6 relative z-10"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110" />
            <div className="relative">
               <Avatar user={user} size="lg" />
               {provider === 'google' && (
                 <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-xl border-4 border-[#120F20] flex items-center justify-center shadow-xl">
                   <svg viewBox="0 0 24 24" className="w-4 h-4">
                     <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                     <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                     <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                     <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                   </svg>
                 </div>
               )}
            </div>
          </div>

          <h2 className="text-[32px] font-black text-main tracking-tighter leading-none mb-2">{displayName}</h2>
          <div className="flex items-center gap-1.5">
             <Mail size={12} className="text-muted" />
             <p className="text-[14px] text-sub font-bold tracking-tight">{email || 'anonymous-wanderer'}</p>
          </div>
          
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-soft shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-light shadow-glow-primary animate-pulse" />
            <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">
               {provider} Verification Active
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Stats Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-6 flex gap-4 mb-8"
      >
        <StatCard icon={<Flame size={20} />} label="Streak" value={streak} />
        <StatCard icon={<Trophy size={20} />} label="Best" value={longest} />
        <StatCard icon={<Star size={20} />} label="Tier" value={user?.subscription || 'Standard'} />
      </motion.div>

      {/* ── Subscription Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mx-6 mb-8"
      >
        <div
          onClick={() => navigate('/subscribe')}
          className="relative bg-surface border border-soft rounded-[28px] p-6 cursor-pointer overflow-hidden group shadow-sm"
        >
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
          <div className="flex items-center gap-5 relative z-10 transition-transform group-hover:translate-x-1 duration-300">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center shadow-sm">
              <Diamond size={24} className="text-gold" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-main font-black text-[18px] tracking-tight">Access Pro Features</p>
              <p className="text-[11px] text-gold font-black uppercase tracking-[0.2em] mt-1">
                Advance to {(user?.subscription || 'Zen').toUpperCase()} Tier
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-muted group-hover:text-main transition-colors">
               <ChevronRight size={20} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Account Info ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-6 mb-8 glass border border-white/5 rounded-[28px] px-6 py-2 shadow-inner"
      >
        <MenuItem
          icon={<Shield size={18} />}
          label="Privacy & Security"
          sub="Locked with End-to-End Encryption"
          onClick={() => {}}
        />
        <MenuItem
          icon={<Settings size={18} />}
          label="App Experience"
          sub="Theme, Language, Notifications"
          onClick={() => navigate('/settings')}
        />
        <MenuItem
          icon={<Clock size={18} />}
          label="History & Data"
          sub={`Member since ${memberSince}`}
          onClick={() => {}}
        />
      </motion.div>

      {/* ── Sign Out ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mx-5 mb-8"
      >
        <button
          onClick={handleLogout}
          className="w-full h-16 flex items-center justify-center gap-3 rounded-[24px] border border-alert/20 bg-alert/5 text-alert font-black text-[14px] uppercase tracking-[0.2em] hover:bg-alert/10 transition-all active:scale-[0.98] shadow-lg"
        >
          <LogOut size={18} strokeWidth={3} />
          End Session
        </button>

        <p className="text-center text-[var(--text-muted)] text-[11px] mt-6 font-medium tracking-wider">
          ANANT SUTRAM · v1.2.0
        </p>
      </motion.div>
    </div>
  );
}
