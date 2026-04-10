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
        className={`${dim} rounded-full object-cover border-2 border-white/20 shadow-glow-primary`}
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
    <div className={`${dim} avatar-fallback hidden rounded-full bg-gradient-to-br from-primary/60 to-secondary/60 border-2 border-white/15 flex items-center justify-center font-bold text-white shadow-glow-primary select-none`}>
      {initial}
    </div>
  );
}

function StatCard({ icon, label, value, color = 'text-primary' }) {
  return (
    <div className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col items-center gap-1.5">
      <span className={`${color} text-[20px]`}>{icon}</span>
      <span className="text-[var(--text-main)] font-bold text-[18px] leading-none">{value}</span>
      <span className="text-[var(--text-muted)] text-[10px] font-semibold uppercase tracking-widest">{label}</span>
    </div>
  );
}

function MenuItem({ icon, label, sub, onClick, danger = false, chevron = true }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 py-4 px-1 text-left border-b border-[var(--border-subtle)] last:border-0 active:opacity-60 transition-opacity
        ${danger ? 'text-[var(--color-alert)]' : 'text-[var(--text-main)]'}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
        ${danger ? 'bg-[var(--color-alert)]/12' : 'bg-[var(--bg-elevated)]'}`}>
        <span className={danger ? 'text-[var(--color-alert)]' : 'text-[var(--color-primary)]'}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-semibold ${danger ? 'text-[var(--color-alert)]' : 'text-[var(--text-main)]'}`}>{label}</p>
        {sub && <p className="text-[12px] text-[var(--text-muted)] mt-0.5 truncate">{sub}</p>}
      </div>
      {chevron && <ChevronRight size={16} className="text-[var(--text-muted)] shrink-0" />}
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
    <div className="min-h-screen bg-[var(--bg-deep)] pb-nav">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-b from-primary/15 via-[var(--bg-elevated)] to-[var(--bg-deep)] pb-0 pt-12">
        {/* Settings button */}
        <div className="flex justify-between items-center px-5 mb-6">
          <h1 className="text-[24px] font-bold text-[var(--text-main)] tracking-tight">Profile</h1>
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 transition-all"
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
        </div>

        {/* Avatar + name */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center pb-8"
        >
          <div className="relative mb-4 flex items-center justify-center">
            <Avatar user={user} size="lg" />
            {provider === 'google' && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full border border-white/20 flex items-center justify-center shadow">
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
            )}
          </div>

          <h2 className="text-[26px] font-bold text-[var(--text-main)] tracking-tight mb-1">{displayName}</h2>
          <p className="text-[13px] text-[var(--text-muted)] mb-1">{email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--color-primary)]/12 text-[var(--color-primary-light)] border border-[var(--color-primary)]/20`}>
              {provider === 'google' ? 'Google' : provider === 'both' ? 'Google + Email' : 'Email'} account
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Stats Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-5 mt-2 flex gap-3 mb-6"
      >
        <StatCard icon={<Flame size={20} className="text-amber-400" />} label="Streak" value={streak} color="text-amber-400" />
        <StatCard icon={<Trophy size={20} className="text-gold" />} label="Best" value={longest} color="text-gold" />
        <StatCard icon={<Star size={20} className="text-[var(--color-primary)]" />} label="Plan" value={(user?.subscription || 'free').charAt(0).toUpperCase() + (user?.subscription || 'free').slice(1)} color="text-[var(--color-primary)]" />
      </motion.div>

      {/* ── Subscription Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mx-5 mb-6"
      >
        <div
          onClick={() => navigate('/subscribe')}
          className="relative bg-gradient-to-br from-[var(--color-gold)]/15 via-[var(--bg-elevated)] to-[var(--color-secondary)]/10 border border-[var(--color-gold)]/25 rounded-2xl p-5 cursor-pointer overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(245,158,11,0.10)' }}
        >
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-[var(--color-gold)]/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/25 flex items-center justify-center">
              <Diamond size={20} className="text-[var(--color-gold)]" />
            </div>
            <div className="flex-1">
              <p className="text-[var(--text-main)] font-bold text-[15px]">Subscription</p>
              <p className="text-[11px] text-[var(--color-gold)] font-black uppercase tracking-widest mt-0.5">
                {(user?.subscription || 'free').toUpperCase()} TIER
              </p>
            </div>
            <ChevronRight size={18} className="text-[var(--text-muted)]" />
          </div>
        </div>
      </motion.div>

      {/* ── Account Info ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-5 mb-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl px-5 py-1"
      >
        <MenuItem
          icon={<Mail size={17} />}
          label="Email"
          sub={email || 'Not set'}
          onClick={() => {}}
          chevron={false}
        />
        <MenuItem
          icon={<Shield size={17} />}
          label="Auth Method"
          sub={provider === 'google' ? 'Google Sign-In' : provider === 'both' ? 'Google + Email' : 'Email / Password'}
          onClick={() => {}}
          chevron={false}
        />
        <MenuItem
          icon={<Clock size={17} />}
          label="Member Since"
          sub={memberSince}
          onClick={() => {}}
          chevron={false}
        />
        <MenuItem
          icon={<Settings size={17} />}
          label="Settings"
          sub="Theme, notifications, privacy"
          onClick={() => navigate('/settings')}
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
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-[var(--color-alert)]/20 bg-[var(--color-alert)]/8 text-[var(--color-alert)] font-bold text-[15px] hover:bg-[var(--color-alert)]/15 transition-all active:scale-[0.98]"
        >
          <LogOut size={18} />
          Sign Out
        </button>

        <p className="text-center text-[var(--text-muted)] text-[11px] mt-6 font-medium tracking-wider">
          ANANT SUTRAM · v1.2.0
        </p>
      </motion.div>
    </div>
  );
}
