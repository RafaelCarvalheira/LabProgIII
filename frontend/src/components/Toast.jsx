import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const DURATION = 3500;

const VARIANTS = {
  success: { icon: CheckCircle2, color: '#34D399', bar: '#10B981', border: 'rgba(16,185,129,0.25)' },
  error:   { icon: AlertCircle,  color: '#F87171', bar: '#EF4444', border: 'rgba(239,68,68,0.25)' },
  info:    { icon: Info,         color: '#818CF8', bar: '#6366F1', border: 'rgba(99,102,241,0.25)' },
};

function ToastItem({ toast, onDismiss }) {
  const { icon: Icon, color, bar, border } = VARIANTS[toast.tipo] || VARIANTS.info;

  return (
    <motion.div
      layout
      role="alert"
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className="relative overflow-hidden rounded-xl flex items-center gap-3 pl-4 pr-3 py-3 min-w-[260px] max-w-sm pointer-events-auto"
      style={{
        background: 'linear-gradient(145deg, #1A2235 0%, #141C2E 100%)',
        border: `1px solid ${border}`,
        boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
      }}
    >
      <Icon size={17} strokeWidth={2} style={{ color }} className="flex-shrink-0" />
      <p className="text-sm font-body text-slate-200 flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Fechar notificação"
        className="p-1 rounded-lg text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0"
      >
        <X size={13} strokeWidth={2} />
      </button>
      <div
        className="absolute bottom-0 left-0 h-[2px]"
        style={{ background: bar, animation: `toastbar ${DURATION}ms linear forwards` }}
      />
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((tipo, message) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev.slice(-2), { id, tipo, message }]);
    setTimeout(() => dismiss(id), DURATION);
  }, [dismiss]);

  const api = useMemo(() => ({
    success: (msg) => push('success', msg),
    error:   (msg) => push('error', msg),
    info:    (msg) => push('info', msg),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 items-end pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>');
  return ctx;
}
