import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Building2 } from 'lucide-react';
import { useFilter } from '../context/FilterContext';
import { useAuth } from '../context/AuthContext';

export default function ImobiliariaFilterBar() {
  const { isSuperAdmin } = useAuth();
  const { imobiliariaId, setImobiliariaId, imobiliarias } = useFilter() || {};
  const scrollRef = useRef(null);

  if (!isSuperAdmin || !imobiliarias?.length) return null;

  function scroll(dir) {
    if (scrollRef.current) scrollRef.current.scrollLeft += dir * 220;
  }

  const selecionada = imobiliarias.find((i) => i.id === imobiliariaId);

  return (
    <div className="mb-6">
      {/* Label + clear */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <p className="text-[11px] font-body font-600 text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
          <Building2 size={11} strokeWidth={2} />
          Filtrar por Imobiliária
        </p>
        <AnimatePresence>
          {imobiliariaId && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setImobiliariaId(null)}
              className="flex items-center gap-1 text-[11px] font-body text-rose-400 hover:text-rose-300
                         transition-colors px-2 py-0.5 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.08)' }}
            >
              <X size={10} strokeWidth={2.5} />
              Limpar filtro
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Tab strip */}
      <div className="flex items-center gap-1.5">
        {/* Scroll left */}
        <button
          onClick={() => scroll(-1)}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                     text-slate-600 hover:text-slate-300 transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <ChevronLeft size={13} strokeWidth={2} />
        </button>

        {/* Tabs */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto flex-1 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* "Todas" pill */}
          <button
            onClick={() => setImobiliariaId(null)}
            className="flex-shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full
                       text-xs font-body font-medium transition-all duration-150 whitespace-nowrap"
            style={
              !imobiliariaId
                ? {
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(20,184,166,0.15))',
                    border: '1px solid rgba(99,102,241,0.35)',
                    color: '#c7d2fe',
                    boxShadow: '0 0 12px rgba(99,102,241,0.15)',
                  }
                : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#64748b',
                  }
            }
          >
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: !imobiliariaId ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)' }}
            >
              ∞
            </span>
            Todas as Imobiliárias
            <span
              className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}
            >
              {imobiliarias.length}
            </span>
          </button>

          {/* One pill per imobiliária */}
          {imobiliarias.map((i) => {
            const isActive = imobiliariaId === i.id;
            const initial = (i.nome || '?')[0].toUpperCase();
            return (
              <button
                key={i.id}
                onClick={() => setImobiliariaId(isActive ? null : i.id)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full
                           text-xs font-body font-medium transition-all duration-150 whitespace-nowrap"
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(20,184,166,0.12))',
                        border: '1px solid rgba(99,102,241,0.30)',
                        color: '#c7d2fe',
                        boxShadow: '0 0 10px rgba(99,102,241,0.12)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        color: '#64748b',
                      }
                }
              >
                {/* Avatar */}
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(20,184,166,0.3))'
                      : 'rgba(255,255,255,0.07)',
                    color: isActive ? '#e0e7ff' : '#94a3b8',
                  }}
                >
                  {initial}
                </span>
                <span className="max-w-[120px] truncate">{i.nome}</span>
              </button>
            );
          })}
        </div>

        {/* Scroll right */}
        <button
          onClick={() => scroll(1)}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                     text-slate-600 hover:text-slate-300 transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <ChevronRight size={13} strokeWidth={2} />
        </button>
      </div>

      {/* Active filter indicator */}
      <AnimatePresence>
        {selecionada && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-body text-indigo-300"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.12)' }}
            >
              <Building2 size={11} strokeWidth={2} className="text-indigo-400" />
              Exibindo dados de:
              <span className="font-semibold text-indigo-200">{selecionada.nome}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
