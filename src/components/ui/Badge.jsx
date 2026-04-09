export function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const variants = {
    default:    'bg-white/10 text-white/70 border-white/10',
    primary:    'bg-primary/20 text-primary-light border-primary/30',
    secondary:  'bg-secondary/20 text-secondary border-secondary/30',
    teal:       'bg-teal/20 text-teal border-teal/30',
    gold:       'bg-gold/20 text-gold border-gold/30',
    success:    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    alert:      'bg-red-500/20 text-red-400 border-red-500/30',
    verified:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    premium:    'bg-gradient-to-r from-gold/20 to-amber-500/20 text-gold border-gold/30',
    available:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  const sizes = {
    xs: 'text-[9px] px-2 py-0.5',
    sm: 'text-[10px] px-2.5 py-0.5',
    md: 'text-[11px] px-3 py-1',
    lg: 'text-[12px] px-3.5 py-1.5',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-bold uppercase tracking-wider ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}

// ─── Verified badge ────────────────────────────────────────────────────────────
export function VerifiedBadge({ className = '' }) {
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white ${className}`} title="Verified Professional">
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
}

// ─── Online indicator ──────────────────────────────────────────────────────────
export function OnlineDot({ size = 'sm', animated = true, className = '' }) {
  const sizes = { xs: 'w-2 h-2', sm: 'w-2.5 h-2.5', md: 'w-3 h-3' };
  return (
    <span className={`relative inline-flex ${sizes[size]} ${className}`}>
      <span className={`relative z-10 rounded-full bg-emerald-400 ${sizes[size]} border-2 border-bg`} />
      {animated && (
        <span className={`absolute inset-0 rounded-full bg-emerald-400 opacity-40 animate-ping`} />
      )}
    </span>
  );
}
