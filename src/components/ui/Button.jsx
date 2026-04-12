export function Button({ children, onClick, variant = 'primary', className = '', ...props }) {
  const baseClasses = 'transition-all duration-300 min-h-[56px] px-8 py-4 font-bold text-[15px] uppercase tracking-widest flex items-center justify-center relative overflow-hidden active:scale-[0.97] rounded-[22px]';
  const variants = {
    primary: 'bg-primary text-white btn-glow transform shadow-glow-primary',
    secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10',
    ghost: 'bg-transparent text-white/50 hover:text-white hover:bg-white/5',
    outline: 'border border-primary/30 bg-primary/5 text-primary-light hover:bg-primary/10',
    danger: 'bg-alert text-white shadow-lg'
  }
  
  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
