import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function PageHeader({ title, subtitle, onBack, action, className = '' }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`sticky top-0 z-30 ${className}`}
      style={{
        background: 'var(--bg-app)',
        borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center gap-3 px-4 pt-safe pb-3">
        <button
          onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-95"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)' }}
        >
          <ArrowLeft size={18} strokeWidth={2.5} style={{ color: 'var(--text-main)' }} />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] font-black tracking-tight truncate" style={{ color: 'var(--text-main)' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-[12px] font-semibold truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </motion.div>
  );
}
