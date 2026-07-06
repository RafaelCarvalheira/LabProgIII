import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title = 'Confirmar exclusão',
  message,
  confirmLabel = 'Excluir',
  loading = false,
  icon: Icon = Trash2,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="confirm-dialog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          style={{ background: 'rgba(5,8,18,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="w-full max-w-sm rounded-2xl p-6 text-center"
            style={{
              background: 'linear-gradient(145deg, #1A2235 0%, #141C2E 100%)',
              border: '1px solid rgba(239,68,68,0.2)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
            }}
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto mb-4">
              <Icon size={20} className="text-rose-400" strokeWidth={2} />
            </div>
            <h3 className="font-display font-700 text-white text-lg mb-2">{title}</h3>
            <div className="text-sm text-slate-500 font-body mb-6">{message}</div>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors font-body"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 font-body"
                style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}
              >
                {loading ? 'Excluindo…' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
