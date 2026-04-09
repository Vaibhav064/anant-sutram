export function Card({ children, className = '', variant = 'default', onClick, ...props }) {
  const variants = {
    default: 'bg-surface2 border border-white/8',
    glass:   'glass',
    gradient: 'bg-gradient-to-br from-primary/15 via-surface2 to-surface2 border border-primary/20',
    'gradient-gold': 'bg-gradient-to-br from-gold/15 via-surface2 to-surface2 border border-gold/20',
    'gradient-teal': 'bg-gradient-to-br from-teal/15 via-surface2 to-surface2 border border-teal/20',
    elevated: 'bg-surface3 border border-white/10 shadow-card',
    surface: 'bg-surface border border-white/6',
  };

  const base = `rounded-3xl ${variants[variant] || variants.default}`;
  const interactive = onClick ? 'cursor-pointer hover:border-white/20 hover:bg-white/5 active:scale-[0.99] transition-all duration-200' : '';

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
