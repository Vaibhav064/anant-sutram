import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`fixed inset-x-4 z-[201] top-1/2 -translate-y-1/2 ${sizes[size]} mx-auto`}
          >
            <div className="bg-surface2 border border-white/10 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.7)] overflow-hidden">
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                  <h3 className="text-white font-bold text-[18px]">{title}</h3>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Body */}
              <div className={title ? 'px-6 pb-6' : 'p-6'}>
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="px-6 pb-6 flex gap-3">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Confirm Dialog ────────────────────────────────────────────────────────────
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', confirmVariant = 'primary', isLoading = false }) {
  const btnStyles = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    danger: 'bg-red-500 text-white hover:bg-red-500/90',
    gold: 'bg-gold text-black hover:bg-gold/90',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-white/60 text-[15px] leading-relaxed mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-2xl bg-white/5 text-white/70 font-semibold text-[14px] hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`flex-1 py-3 rounded-2xl font-semibold text-[14px] transition-all disabled:opacity-50 ${btnStyles[confirmVariant]}`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Loading...
            </span>
          ) : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
