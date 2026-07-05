import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Overlay */}
        <motion.div
          className="absolute inset-0"
          style={{ background: 'rgba(5,8,18,0.75)', backdropFilter: 'blur(6px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        />

        {/* Modal panel */}
        <motion.div
          className={`relative rounded-2xl flex flex-col overflow-hidden ${
            wide ? 'w-full max-w-2xl' : 'w-full max-w-lg'
          } mx-4 max-h-[90vh]`}
          style={{
            background: 'linear-gradient(145deg, #1A2235 0%, #141C2E 100%)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 30px 70px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
          }}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{ opacity: 0, scale: 0.96, y: 8  }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-5 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <h2 className="font-display text-base font-700 text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 overflow-y-auto flex-1 text-slate-300">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
