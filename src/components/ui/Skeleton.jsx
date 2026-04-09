export function Skeleton({ className = '', variant = 'line', count = 1 }) {
  const base = 'skeleton rounded-xl';

  const variants = {
    line:   'h-4 w-full',
    title:  'h-7 w-3/4',
    avatar: 'w-16 h-16 rounded-full',
    card:   'w-full h-32',
    button: 'h-12 w-32 rounded-full',
    text:   'h-3.5 w-full',
  };

  const shape = variants[variant] || variants.line;

  if (count === 1) {
    return <div className={`${base} ${shape} ${className}`} />;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${base} ${shape}`} style={{ width: i % 3 === 2 ? '60%' : '100%' }} />
      ))}
    </div>
  );
}

// ─── Card Skeleton ─────────────────────────────────────────────────────────────
export function CardSkeleton({ className = '' }) {
  return (
    <div className={`bg-surface2 border border-white/5 rounded-2xl p-5 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="skeleton w-16 h-16 rounded-full shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-4 w-2/3 rounded-xl" />
          <div className="skeleton h-3 w-full rounded-xl" />
          <div className="skeleton h-3 w-4/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Page Skeleton ─────────────────────────────────────────────────────────────
export function PageSkeleton() {
  return (
    <div className="px-5 pt-8 space-y-5">
      <div className="skeleton h-8 w-1/2 rounded-xl" />
      <div className="skeleton h-4 w-3/4 rounded-xl" />
      <div className="skeleton h-36 w-full rounded-2xl" />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
