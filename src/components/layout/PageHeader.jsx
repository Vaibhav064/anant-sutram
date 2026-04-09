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
      className={`sticky top-0 z-30 ios-glass border-b border-white/5 ${className}`}
    >
      <div className="flex items-center gap-3 px-4 pt-safe pb-3">
        <button
          onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] font-semibold text-white tracking-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-[12px] text-white/40 font-medium truncate mt-0.5">{subtitle}</p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </motion.div>
  );
}
