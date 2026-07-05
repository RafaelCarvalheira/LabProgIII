import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarSearch, Search, BedDouble, Bath, Car, Ruler,
  CheckCircle2, AlertCircle, Tag,
} from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

const GLASS = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' };

function fmt(val)   { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0); }
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(String(d).slice(0, 10) + 'T00:00:00');
  return isNaN(dt) ? '—' : dt.toLocaleDateString('pt-BR');
}

const today   = new Date().toISOString().split('T')[0];
const label   = 'block text-xs font-medium text-slate-500 mb-1.5';
const inputBase = 'w-full px-4 py-2.5 rounded-xl text-sm font-body';
const btnPrimary = 'inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all disabled:opacity-50';

const stagger     = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', duration: 0.4, bounce: 0.05 } },
};

export default function Disponibilidade() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim]       = useState('');
  const [imoveis, setImoveis]       = useState([]);
  const [clientes, setClientes]     = useState([]);
  const [searched, setSearched]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [searchError, setSearchError] = useState('');

  const [reservaModal, setReservaModal]           = useState(false);
  const [imovelSelecionado, setImovelSelecionado] = useState(null);
  const [clienteId, setClienteId]                 = useState('');
  const [valorMensal, setValorMensal]             = useState('');
  const [saving, setSaving]                       = useState(false);
  const [saveError, setSaveError]                 = useState('');
  const [successMsg, setSuccessMsg]               = useState('');

  useEffect(() => { api.get('/clientes').then((r) => setClientes(r.data)).catch(() => {}); }, []);

  async function handleBuscar(e) {
    e.preventDefault();
    if (!dataInicio || !dataFim) { setSearchError('Preencha as duas datas para buscar.'); return; }
    if (dataFim < dataInicio)    { setSearchError('A data de saída deve ser posterior à data de entrada.'); return; }
    setSearchError(''); setLoading(true); setSearched(false);
    try {
      const res = await api.get('/imoveis/disponibilidade', { params: { data_inicio: dataInicio, data_fim: dataFim } });
      setImoveis(res.data); setSearched(true);
    } catch (err) { setSearchError(err.response?.data?.erro || 'Erro ao buscar disponibilidade.'); }
    finally       { setLoading(false); }
  }

  function abrirReserva(im) {
    setImovelSelecionado(im); setClienteId(''); setValorMensal(im.valor_aluguel || '');
    setSaveError(''); setReservaModal(true);
  }

  async function handleConfirmarReserva(e) {
    e.preventDefault();
    if (!clienteId) { setSaveError('Selecione um cliente.'); return; }
    setSaving(true); setSaveError('');
    try {
      await api.post('/locacoes', {
        imovel_id: imovelSelecionado.id, cliente_id: parseInt(clienteId),
        data_inicio: dataInicio, data_fim: dataFim,
        valor_mensal: parseFloat(valorMensal) || 0,
      });
      setReservaModal(false);
      setSuccessMsg(`Reserva do imóvel "${imovelSelecionado.titulo}" criada com sucesso!`);
      setImoveis((prev) => prev.filter((i) => i.id !== imovelSelecionado.id));
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) { setSaveError(err.response?.data?.erro || 'Erro ao criar reserva.'); }
    finally       { setSaving(false); }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-800 text-white">Busca de Disponibilidade</h1>
        <p className="text-sm text-slate-500 mt-1 font-body">
          Informe o período desejado para ver os imóveis disponíveis e criar uma reserva.
        </p>
      </div>

      {/* Search form */}
      <motion.form
        onSubmit={handleBuscar}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 mb-6"
        style={GLASS}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className={label}>Data de Entrada</label>
            <input type="date" value={dataInicio} min={today} onChange={(e) => setDataInicio(e.target.value)} className={inputBase} />
          </div>
          <div className="flex-1">
            <label className={label}>Data de Saída</label>
            <input type="date" value={dataFim} min={dataInicio || today} onChange={(e) => setDataFim(e.target.value)} className={inputBase} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={btnPrimary}
            style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)', whiteSpace: 'nowrap' }}
          >
            <Search size={15} strokeWidth={2} />
            {loading ? 'Buscando...' : 'Buscar Disponíveis'}
          </button>
        </div>
        {searchError && (
          <div className="mt-4 flex items-center gap-2 p-3 text-rose-400 text-sm rounded-xl" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>
            <AlertCircle size={14} strokeWidth={2} /> {searchError}
          </div>
        )}
      </motion.form>

      {/* Success */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-2 p-4 text-emerald-400 text-sm rounded-xl"
            style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.20)' }}
          >
            <CheckCircle2 size={16} strokeWidth={2} /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {searched && !loading && (
        <div>
          <p className="text-sm text-slate-500 mb-5 font-body">
            {imoveis.length === 0
              ? 'Nenhum imóvel disponível para o período selecionado.'
              : `${imoveis.length} imóvel${imoveis.length > 1 ? 'is' : ''} disponível${imoveis.length > 1 ? 'is' : ''} de ${fmtDate(dataInicio)} até ${fmtDate(dataFim)}`}
          </p>

          {imoveis.length === 0 ? (
            <EmptyState message="Nenhum imóvel disponível para o período informado" icon={CalendarSearch} />
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {imoveis.map((im) => (
                <ImovelCard key={im.id} imovel={im} onReservar={() => abrirReserva(im)} />
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Modal reserva */}
      {reservaModal && imovelSelecionado && (
        <Modal title={`Reservar — ${imovelSelecionado.titulo}`} onClose={() => setReservaModal(false)}>
          <form onSubmit={handleConfirmarReserva} className="space-y-4">
            {saveError && (
              <div className="p-3 text-rose-400 text-sm rounded-xl" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>{saveError}</div>
            )}
            {/* Info resumida */}
            <div className="p-4 rounded-xl text-sm space-y-1" style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.20)' }}>
              <div className="font-medium text-white">{imovelSelecionado.titulo}</div>
              <div className="text-slate-400">{imovelSelecionado.cidade}{imovelSelecionado.estado ? `, ${imovelSelecionado.estado}` : ''}</div>
              <div className="text-accent-400 font-semibold">{fmt(imovelSelecionado.valor_aluguel)} / mês</div>
            </div>
            {/* Período */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Data de Entrada</label>
                <input type="date" value={dataInicio} readOnly className={`${inputBase} opacity-50 cursor-not-allowed`} />
              </div>
              <div>
                <label className={label}>Data de Saída</label>
                <input type="date" value={dataFim} readOnly className={`${inputBase} opacity-50 cursor-not-allowed`} />
              </div>
            </div>
            <div>
              <label className={label}>Cliente *</label>
              <select required value={clienteId} onChange={(e) => setClienteId(e.target.value)} className={inputBase}>
                <option value="">Selecione um cliente</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Valor Mensal (R$) *</label>
              <input required type="number" step="0.01" min="0" value={valorMensal} onChange={(e) => setValorMensal(e.target.value)} className={inputBase} />
            </div>
            <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button type="button" onClick={() => setReservaModal(false)} className="px-5 py-2.5 text-sm font-medium text-slate-400 rounded-xl transition-colors" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>Cancelar</button>
              <button type="submit" disabled={saving} className={btnPrimary} style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
                {saving ? 'Confirmando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function ImovelCard({ imovel, onReservar }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', duration: 0.4, bounce: 0.05 } } }}
      whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Gradient top bar */}
      <div className="h-1" style={{ background: 'linear-gradient(90deg, #6366F1, #14B8A6)' }} />

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-base font-700 text-white leading-snug mb-1">{imovel.titulo}</h3>
        {imovel.cidade && (
          <p className="text-xs text-slate-600 mb-3">{imovel.cidade}{imovel.estado ? `, ${imovel.estado}` : ''}</p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-slate-600 mb-4">
          {imovel.quartos > 0     && <span className="flex items-center gap-1"><BedDouble size={12} strokeWidth={1.8} />{imovel.quartos} quarto{imovel.quartos > 1 ? 's' : ''}</span>}
          {imovel.banheiros > 0   && <span className="flex items-center gap-1"><Bath      size={12} strokeWidth={1.8} />{imovel.banheiros} banheiro{imovel.banheiros > 1 ? 's' : ''}</span>}
          {imovel.vagas_garagem > 0 && <span className="flex items-center gap-1"><Car     size={12} strokeWidth={1.8} />{imovel.vagas_garagem} vaga{imovel.vagas_garagem > 1 ? 's' : ''}</span>}
          {imovel.area            && <span className="flex items-center gap-1"><Ruler     size={12} strokeWidth={1.8} />{imovel.area} m²</span>}
        </div>

        {Array.isArray(imovel.categorias) && imovel.categorias.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {imovel.categorias.map((cat) => (
              <span key={cat.id} className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#A5B4FC' }}>
                <Tag size={9} strokeWidth={2} />{cat.nome}
              </span>
            ))}
          </div>
        )}

        <div className="text-lg font-display font-700 text-accent-400 mt-auto mb-4">
          {fmt(imovel.valor_aluguel)}<span className="text-xs font-body font-normal text-slate-600 ml-1">/mês</span>
        </div>

        <button
          onClick={onReservar}
          className="w-full py-2.5 text-sm font-medium text-white rounded-xl transition-all"
          style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', boxShadow: '0 4px 14px rgba(99,102,241,0.25)' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Reservar
        </button>
      </div>
    </motion.div>
  );
}
