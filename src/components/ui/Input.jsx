export function Input({ className = '', ...props }) {
  return (
    <input 
      className={`bg-surface border border-subtle rounded-[20px] px-5 py-4 w-full text-main font-medium placeholder-muted focus:outline-none focus:border-primary/50 focus:bg-surface2 shadow-sm transition-all ${className}`}
      {...props}
    />
  );
}
