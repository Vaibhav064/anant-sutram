export function Button({ children, onClick, variant = 'primary', className = '', ...props }) {
  const baseClasses = 'transition-all duration-200 min-h-[56px] px-10 py-4 font-semibold text-lg flex items-center justify-center relative overflow-hidden';
  const variants = {
    primary: 'bg-gradient-to-r from-primary to-secondary rounded-full border-none text-white',
    ghost: 'bg-transparent text-white/60 hover:text-white',
    outline: 'border border-white/10 bg-white/5 rounded-full text-white'
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
