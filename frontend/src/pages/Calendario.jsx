import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';

const MESES     = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

const STATUS_COLORS = {
  confirmada: { event: 'rgba(16,185,129,0.20)',  text: '#6EE7B7', border: 'rgba(16,185,129,0.30)', dot: '#10B981', pill: 'rgba(16,185,129,0.15)', pillBorder: 'rgba(16,185,129,0.25)', pillText: '#34D399' },
  pendente:   { event: 'rgba(245,158,11,0.20)',  text: '#FCD34D', border: 'rgba(245,158,11,0.30)', dot: '#F59E0B', pill: 'rgba(245,158,11,0.15)', pillBorder: 'rgba(245,158,11,0.25)', pillText: '#FCD34D' },
  cancelada:  { event: 'rgba(244,63,94,0.18)',   text: '#FCA5A5', border: 'rgba(244,63,94,0.28)',  dot: '#F43F5E', pill: 'rgba(244,63,94,0.15)', pillBorder: 'rgba(244,63,94,0.25)', pillText: '#FCA5A5' },
};

function fmt(val)   { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0); }
function isoDate(d) { return d.toISOString().split('T')[0]; }

export default function Calendario() {
  const today = new Date();
  const [ano, setAno]               = useState(today.getFullYear());
  const [mes, setMes]               = useState(today.getMonth());
  const [locacoes, setLocacoes]     = useState([]);
  const [imoveis, setImoveis]       = useState([]);
  const [filterImovel, setFilterImovel] = useState('');
  const [selected, setSelected]     = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([api.get('/locacoes'), api.get('/imoveis')])
      .then(([l, i]) => { setLocacoes(l.data); setImoveis(i.data); })
      .finally(() => setLoading(false));
  }, []);

  function prevMes() { if (mes === 0) { setMes(11); setAno((a) => a - 1); } else setMes((m) => m - 1); }
  function nextMes() { if (mes === 11) { setMes(0); setAno((a) => a + 1); } else setMes((m) => m + 1); }

  const calDays = useMemo(() => {
    const firstDay  = new Date(ano, mes, 1).getDay();
    const totalDays = new Date(ano, mes + 1, 0).getDate();
    const prevTotal = new Date(ano, mes, 0).getDate();
    const days = [];
    for (let i = firstDay - 1; i >= 0; i--)
      days.push({ date: new Date(ano, mes - 1, prevTotal - i), outOfMonth: true });
    for (let d = 1; d <= totalDays; d++)
      days.push({ date: new Date(ano, mes, d), outOfMonth: false });
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++)
      days.push({ date: new Date(ano, mes + 1, d), outOfMonth: true });
    return days;
  }, [ano, mes]);

  const locacoesFiltradas = useMemo(() => {
    return locacoes.filter((l) => !filterImovel || String(l.imovel_id) === filterImovel);
  }, [locacoes, filterImovel]);

  function getLocacoesNoDia(date) {
    const d = isoDate(date);
    return locacoesFiltradas.filter((l) => {
      const inicio = l.data_inicio?.split('T')[0];
      const fim    = l.data_fim?.split('T')[0];
      if (!inicio) return false;
      if (!fim)    return d >= inicio;
      return d >= inicio && d <= fim;
    });
  }

  const isToday = (date) => isoDate(date) === isoDate(today);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-800 text-white">Agenda de Reservas</h1>
          <p className="text-sm text-slate-500 mt-0.5 font-body">Visualização mensal de todas as locações</p>
        </div>
        <select
          value={filterImovel}
          onChange={(e) => setFilterImovel(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm font-body"
          style={{ minWidth: 180 }}
        >
          <option value="">Todos os imóveis</option>
          {imoveis.map((i) => <option key={i.id} value={i.id}>{i.titulo}</option>)}
        </select>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-5">
        {Object.entries(STATUS_COLORS).map(([status, cfg]) => (
          <div key={status} className="flex items-center gap-1.5 text-sm text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: cfg.dot }} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        ))}
      </div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Nav */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={prevMes} className="p-2 rounded-lg text-slate-500 hover:text-slate-200 transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <h2 className="font-display text-base font-700 text-white">{MESES[mes]} {ano}</h2>
          <button onClick={nextMes} className="p-2 rounded-lg text-slate-500 hover:text-slate-200 transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="py-3 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-600 text-sm font-body">Carregando...</div>
        ) : (
          <div className="grid grid-cols-7">
            {calDays.map(({ date, outOfMonth }, idx) => {
              const locsNoDia = getLocacoesNoDia(date);
              const isT       = isToday(date);
              return (
                <div
                  key={idx}
                  className="min-h-[88px] p-1.5 transition-colors"
                  style={{
                    borderBottom: Math.floor(idx / 7) < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    borderRight:  idx % 7 < 6 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    background:   outOfMonth ? 'rgba(255,255,255,0.01)' : 'transparent',
                  }}
                >
                  {/* Day number */}
                  <div
                    className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mx-auto mb-1"
                    style={isT
                      ? { background: 'linear-gradient(135deg, #6366F1, #4F46E5)', color: '#fff' }
                      : { color: outOfMonth ? '#2D3748' : '#94A3B8' }
                    }
                  >
                    {date.getDate()}
                  </div>

                  {/* Events */}
                  <div className="space-y-0.5">
                    {locsNoDia.slice(0, 2).map((loc) => {
                      const cfg     = STATUS_COLORS[loc.status] || STATUS_COLORS.pendente;
                      const isStart = isoDate(date) === loc.data_inicio?.split('T')[0];
                      return (
                        <button
                          key={loc.id}
                          onClick={() => setSelected(loc)}
                          className="w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate transition-opacity hover:opacity-80"
                          style={{ background: cfg.event, color: cfg.text, border: `1px solid ${cfg.border}` }}
                        >
                          {isStart ? '▶ ' : ''}{loc.imovel_titulo}
                        </button>
                      );
                    })}
                    {locsNoDia.length > 2 && (
                      <div className="text-[10px] text-slate-600 px-1">+{locsNoDia.length - 2} mais</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Popup */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div
              className="absolute inset-0"
              style={{ background: 'rgba(5,8,18,0.70)', backdropFilter: 'blur(6px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              className="relative rounded-2xl p-6 w-full max-w-sm mx-4"
              style={{ background: 'linear-gradient(145deg, #1A2235 0%, #141C2E 100%)', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 30px 70px rgba(0,0,0,0.7)' }}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            >
              {(() => {
                const cfg = STATUS_COLORS[selected.status] || STATUS_COLORS.pendente;
                return (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-display text-base font-700 text-white">{selected.imovel_titulo}</h3>
                        <p className="text-sm text-slate-500">{selected.cliente_nome}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: cfg.pill, border: `1px solid ${cfg.pillBorder}`, color: cfg.pillText }}>
                        {selected.status}
                      </span>
                    </div>

                    <div className="space-y-3 text-sm">
                      {[
                        { label: 'Início',        val: new Date(String(selected.data_inicio).slice(0,10)+'T00:00:00').toLocaleDateString('pt-BR') },
                        { label: 'Fim',           val: selected.data_fim ? new Date(String(selected.data_fim).slice(0,10)+'T00:00:00').toLocaleDateString('pt-BR') : '—' },
                        { label: 'Valor mensal',  val: fmt(selected.valor_mensal), accent: true },
                        ...(selected.valor_total ? [{ label: 'Valor total', val: fmt(selected.valor_total), accent: true }] : []),
                      ].map(({ label: lbl, val, accent }) => (
                        <div key={lbl} className="flex justify-between" style={{ paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span className="text-slate-500">{lbl}</span>
                          <span className={accent ? 'font-semibold text-accent-400' : 'font-medium text-slate-200'}>{val}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setSelected(null)}
                      className="mt-5 w-full py-2.5 text-sm font-medium text-slate-400 rounded-xl transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    >
                      Fechar
                    </button>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
