export function Card({ children, className = '', variant = 'default', onClick, ...props }) {
  const variants = {
    default: 'bg-surface2 border border-white/8',
    glass:   'glass',
    premium: 'premium-card shadow-card',
    gradient: 'bg-gradient-to-br from-primary/20 via-surface2 to-surface2 border border-primary/25',
    'gradient-gold': 'bg-gradient-to-br from-gold/15 via-surface2 to-surface2 border border-gold/20',
    'gradient-teal': 'bg-gradient-to-br from-teal/20 via-surface2 to-surface2 border border-teal/25',
    elevated: 'bg-surface3 border border-white/10 shadow-card',
    surface: 'bg-surface border border-white/6',
    'glass-morphism': 'glass-morphism',
  };

  const base = `rounded-[28px] ${variants[variant] || variants.default}`;
  const interactive = onClick ? 'cursor-pointer hover:border-white/20 active:scale-[0.98] transition-all duration-300' : '';

  return (
    <div
      className={`${base} ${interactive} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
