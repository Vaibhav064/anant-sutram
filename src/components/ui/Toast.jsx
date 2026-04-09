import { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

// ─── Toast Context ─────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

let toastCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3500) => {
    const id = ++toastCounter;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error:   (msg, duration) => addToast(msg, 'error',   duration),
    info:    (msg, duration) => addToast(msg, 'info',    duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

// ─── Toast Container ───────────────────────────────────────────────────────────
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-28 left-0 right-0 z-[999] flex flex-col items-center gap-2 px-4 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Individual Toast ──────────────────────────────────────────────────────────
function Toast({ toast, onRemove }) {
  const configs = {
    success: {
      icon: <CheckCircle2 size={16} />,
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/30',
      text: 'text-emerald-300',
      icon_color: 'text-emerald-400',
    },
    error: {
      icon: <AlertCircle size={16} />,
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      text: 'text-red-200',
      icon_color: 'text-red-400',
    },
    warning: {
      icon: <AlertCircle size={16} />,
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/30',
      text: 'text-amber-200',
      icon_color: 'text-amber-400',
    },
    info: {
      icon: <Info size={16} />,
      bg: 'bg-primary/20',
      border: 'border-primary/30',
      text: 'text-white/90',
      icon_color: 'text-primary-light',
    },
  };

  const config = configs[toast.type] || configs.info;

  return (
    <motion.div
      layout
      initial={{ y: 30, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 10, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`pointer-events-auto w-full max-w-sm ${config.bg} ${config.border} border backdrop-blur-xl rounded-2xl px-4 py-3 flex items-center gap-3 shadow-card`}
    >
      <span className={config.icon_color}>{config.icon}</span>
      <p className={`flex-1 text-sm font-medium ${config.text}`}>{toast.message}</p>
      <button
        onClick={onRemove}
        className="text-white/30 hover:text-white/60 transition-colors p-0.5 rounded"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
