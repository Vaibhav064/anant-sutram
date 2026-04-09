export function Input({ className = '', ...props }) {
  return (
    <input 
      className={`bg-white/5 border border-white/10 rounded-xl px-4 py-3 w-full text-white placeholder-white/35 focus:outline-none focus:border-secondary transition-colors ${className}`}
      {...props}
    />
  );
}
