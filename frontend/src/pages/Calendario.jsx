import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Circle } from 'lucide-react';
import api from '../api/axios';

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

const STATUS_COLORS = {
  confirmada: { bg: 'bg-emerald-500', light: 'bg-emerald-50 border-emerald-200 text-emerald-800', dot: 'bg-emerald-500' },
  pendente:   { bg: 'bg-amber-400',   light: 'bg-amber-50   border-amber-200   text-amber-800',   dot: 'bg-amber-400'   },
  cancelada:  { bg: 'bg-rose-400',    light: 'bg-rose-50    border-rose-200    text-rose-800',    dot: 'bg-rose-400'    },
};

function formatCurrency(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}

function isoDate(d) {
  return d.toISOString().split('T')[0];
}

export default function Calendario() {
  const today = new Date();
  const [ano, setAno] = useState(today.getFullYear());
  const [mes, setMes] = useState(today.getMonth());
  const [locacoes, setLocacoes] = useState([]);
  const [imoveis, setImoveis] = useState([]);
  const [filterImovel, setFilterImovel] = useState('');
  const [selected, setSelected] = useState(null); // locação selecionada para popup
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/locacoes'), api.get('/imoveis')])
      .then(([l, i]) => { setLocacoes(l.data); setImoveis(i.data); })
      .finally(() => setLoading(false));
  }, []);

  function prevMes() {
    if (mes === 0) { setMes(11); setAno(a => a - 1); }
    else setMes(m => m - 1);
  }
  function nextMes() {
    if (mes === 11) { setMes(0); setAno(a => a + 1); }
    else setMes(m => m + 1);
  }

  // Dias do calendário (incluindo dias do mês anterior/próximo para completar a grade)
  const calDays = useMemo(() => {
    const firstDay = new Date(ano, mes, 1).getDay();
    const totalDays = new Date(ano, mes + 1, 0).getDate();
    const days = [];
    // dias do mês anterior
    const prevTotal = new Date(ano, mes, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ date: new Date(ano, mes - 1, prevTotal - i), outOfMonth: true });
    }
    // dias do mês atual
    for (let d = 1; d <= totalDays; d++) {
      days.push({ date: new Date(ano, mes, d), outOfMonth: false });
    }
    // dias do próximo mês
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: new Date(ano, mes + 1, d), outOfMonth: true });
    }
    return days;
  }, [ano, mes]);

  // Locações filtradas e mapeadas por data
  const locacoesFiltradas = useMemo(() => {
    return locacoes.filter(l => !filterImovel || String(l.imovel_id) === filterImovel);
  }, [locacoes, filterImovel]);

  // Mapeia quais locações ocupam cada dia
  function getLocacoesNoDia(date) {
    const d = isoDate(date);
    return locacoesFiltradas.filter(l => {
      const inicio = l.data_inicio?.split('T')[0];
      const fim = l.data_fim?.split('T')[0];
      if (!inicio) return false;
      if (!fim) return d >= inicio;
      return d >= inicio && d <= fim;
    });
  }

  const isToday = (date) => isoDate(date) === isoDate(today);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-800 text-slate-800">Agenda de Reservas</h1>
          <p className="text-sm text-slate-400 mt-0.5">Visualização mensal de todas as locações</p>
        </div>
        <select
          value={filterImovel}
          onChange={(e) => setFilterImovel(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        >
          <option value="">Todos os imóveis</option>
          {imoveis.map(i => <option key={i.id} value={i.id}>{i.titulo}</option>)}
        </select>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 mb-6">
        {Object.entries(STATUS_COLORS).map(([status, cfg]) => (
          <div key={status} className="flex items-center gap-1.5 text-sm text-slate-600">
            <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        ))}
      </div>

      {/* Calendário */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden animate-fade-in-up">
        {/* Nav */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <button onClick={prevMes} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <h2 className="font-display text-lg font-700 text-slate-800">
            {MESES[mes]} {ano}
          </h2>
          <button onClick={nextMes} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Cabeçalho dias da semana */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {DIAS_SEMANA.map(d => (
            <div key={d} className="py-3 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Grade de dias */}
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
            Carregando...
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {calDays.map(({ date, outOfMonth }, idx) => {
              const locsNoDia = getLocacoesNoDia(date);
              const isT = isToday(date);
              return (
                <div
                  key={idx}
                  className={`min-h-[90px] p-1.5 border-b border-r border-slate-50 last:border-r-0 transition-colors
                    ${outOfMonth ? 'bg-slate-50/50' : 'bg-white hover:bg-surface'}
                    ${idx % 7 === 6 ? 'border-r-0' : ''}
                  `}
                >
                  {/* Número do dia */}
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mb-1 mx-auto
                    ${isT ? 'bg-brand-600 text-white' : outOfMonth ? 'text-slate-300' : 'text-slate-600'}`}>
                    {date.getDate()}
                  </div>

                  {/* Eventos */}
                  <div className="space-y-0.5">
                    {locsNoDia.slice(0, 2).map(loc => {
                      const cfg = STATUS_COLORS[loc.status] || STATUS_COLORS.pendente;
                      const isStart = isoDate(date) === loc.data_inicio?.split('T')[0];
                      return (
                        <button
                          key={loc.id}
                          onClick={() => setSelected(loc)}
                          className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate border transition-all hover:opacity-80 ${cfg.light}`}
                        >
                          {isStart ? '▶ ' : ''}{loc.imovel_titulo}
                        </button>
                      );
                    })}
                    {locsNoDia.length > 2 && (
                      <div className="text-[10px] text-slate-400 px-1">
                        +{locsNoDia.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Popup da locação selecionada */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-2xl shadow-modal p-6 w-full max-w-sm mx-4 animate-modal-in">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display text-base font-700 text-slate-800">{selected.imovel_titulo}</h3>
                <p className="text-sm text-slate-500">{selected.cliente_nome}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[selected.status || 'pendente']?.light}`}>
                {selected.status || 'pendente'}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Início</span>
                <span className="font-medium text-slate-700">
                  {new Date(selected.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fim</span>
                <span className="font-medium text-slate-700">
                  {selected.data_fim
                    ? new Date(selected.data_fim + 'T00:00:00').toLocaleDateString('pt-BR')
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valor mensal</span>
                <span className="font-semibold text-brand-700">{formatCurrency(selected.valor_mensal)}</span>
              </div>
              {selected.valor_total && (
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-400">Valor total</span>
                  <span className="font-bold text-brand-800">{formatCurrency(selected.valor_total)}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-5 w-full py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}