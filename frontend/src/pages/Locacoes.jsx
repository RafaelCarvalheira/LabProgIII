import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileKey2, XCircle, Pencil, CheckCircle2, Clock, Ban } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/Skeleton';

const GLASS = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' };

function fmt(val)  { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0); }
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(String(d).slice(0, 10) + 'T00:00:00');
  return isNaN(dt) ? '—' : dt.toLocaleDateString('pt-BR');
}
function calcTotal(inicio, fim, mensal) {
  if (!inicio || !fim || !mensal) return null;
  const dias = Math.max(1, Math.ceil((new Date(fim) - new Date(inicio)) / 86400000));
  return parseFloat(mensal) * (dias / 30);
}

const STATUS_CFG = {
  pendente:   { icon: Clock,        cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  confirmada: { icon: CheckCircle2, cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  cancelada:  { icon: Ban,          cls: 'bg-rose-500/15 text-rose-400 border-rose-500/25' },
};

function StatusPill({ status }) {
  const cfg  = STATUS_CFG[status] || STATUS_CFG.pendente;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${cfg.cls}`}>
      <Icon size={11} strokeWidth={2} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

const emptyForm = { imovel_id: '', cliente_id: '', data_inicio: '', data_fim: '', valor_mensal: '', status: 'pendente' };
const label      = 'block text-xs font-medium text-slate-500 mb-1.5';
const inputBase  = 'w-full px-4 py-2.5 rounded-xl text-sm font-body';
const btnPrimary = 'inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all disabled:opacity-50';
const btnGhost   = 'px-5 py-2.5 text-sm font-medium text-slate-400 rounded-xl transition-colors hover:text-slate-200';

export default function Locacoes() {
  const [locacoes, setLocacoes] = useState([]);
  const [imoveis, setImoveis]   = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError]       = useState('');

  const valorTotal = calcTotal(form.data_inicio, form.data_fim, form.valor_mensal);

  async function fetchAll() {
    try {
      const [locRes, imRes, clRes] = await Promise.all([
        api.get('/locacoes'), api.get('/imoveis'), api.get('/clientes'),
      ]);
      setLocacoes(locRes.data); setImoveis(imRes.data); setClientes(clRes.data);
    } catch { setError('Erro ao carregar dados'); }
    finally  { setLoading(false); }
  }

  useEffect(() => { fetchAll(); }, []);

  const filtered = filterStatus ? locacoes.filter((l) => l.status === filterStatus) : locacoes;

  function openNew() { setEditing(null); setForm(emptyForm); setError(''); setModalOpen(true); }
  function openEdit(loc) {
    setEditing(loc);
    setForm({
      imovel_id: loc.imovel_id, cliente_id: loc.cliente_id,
      data_inicio: loc.data_inicio?.split('T')[0] || '',
      data_fim:    loc.data_fim?.split('T')[0]    || '',
      valor_mensal: loc.valor_mensal || '', status: loc.status || 'pendente',
    });
    setError(''); setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...form, valor_mensal: parseFloat(form.valor_mensal) || 0 };
      if (editing) await api.put(`/locacoes/${editing.id}`, payload);
      else          await api.post('/locacoes', payload);
      setModalOpen(false); fetchAll();
    } catch (err) { setError(err.response?.data?.erro || 'Erro ao salvar locação'); }
    finally       { setSaving(false); }
  }

  async function handleChangeStatus(id, status) {
    try { await api.patch(`/locacoes/${id}/status`, { status }); fetchAll(); }
    catch (err) { setError(err.response?.data?.erro || 'Erro ao alterar status'); }
  }

  function handleChange(f, v) { setForm((p) => ({ ...p, [f]: v })); }

  const filterOpts = [
    { val: '',           label: 'Todas' },
    { val: 'pendente',   label: 'Pendente' },
    { val: 'confirmada', label: 'Confirmada' },
    { val: 'cancelada',  label: 'Cancelada' },
  ];

  if (loading) {
    return (
      <div>
        <div className="skeleton h-7 w-32 mb-8 rounded-xl" />
        <SkeletonTable rows={6} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-800 text-white">Locações</h1>
          <p className="text-sm text-slate-500 mt-0.5 font-body">Gerencie reservas e verifique disponibilidade</p>
        </div>
        <button
          onClick={openNew}
          className={btnPrimary}
          style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}
        >
          <Plus size={17} strokeWidth={2} /> Nova Locação
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterOpts.map((opt) => {
          const count = opt.val === '' ? locacoes.length : locacoes.filter((l) => l.status === opt.val).length;
          const active = filterStatus === opt.val;
          return (
            <button
              key={opt.val}
              onClick={() => setFilterStatus(opt.val)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150"
              style={active
                ? { background: 'linear-gradient(135deg, #6366F1, #4F46E5)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }
              }
            >
              {opt.label}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-white/05'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-5 p-3 text-rose-400 text-sm rounded-xl" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState message="Nenhuma locação encontrada" icon={FileKey2} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl overflow-hidden"
          style={GLASS}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Imóvel</th>
                  <th>Cliente</th>
                  <th>Período</th>
                  <th>Mensal / Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((loc) => (
                  <tr key={loc.id}>
                    <td className="font-medium text-slate-200 max-w-[160px] truncate">{loc.imovel_titulo}</td>
                    <td className="text-slate-400">{loc.cliente_nome}</td>
                    <td className="text-slate-400 whitespace-nowrap text-sm">
                      {fmtDate(loc.data_inicio)} → {fmtDate(loc.data_fim)}
                    </td>
                    <td>
                      <div className="text-sm font-semibold text-accent-400">
                        {fmt(loc.valor_mensal)}<span className="text-xs font-normal text-slate-600">/mês</span>
                      </div>
                      {loc.valor_total && (
                        <div className="text-xs text-slate-600">Total: {fmt(loc.valor_total)}</div>
                      )}
                    </td>
                    <td><StatusPill status={loc.status || 'pendente'} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="inline-flex items-center gap-1">
                        {loc.status === 'pendente' && (
                          <button onClick={() => handleChangeStatus(loc.id, 'confirmada')} title="Confirmar"
                            className="p-1.5 rounded-lg text-emerald-500 transition-colors"
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16,185,129,0.12)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            <CheckCircle2 size={15} strokeWidth={2} />
                          </button>
                        )}
                        {loc.status !== 'cancelada' && (
                          <button onClick={() => handleChangeStatus(loc.id, 'cancelada')} title="Cancelar"
                            className="p-1.5 rounded-lg text-rose-400 transition-colors"
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            <XCircle size={15} strokeWidth={2} />
                          </button>
                        )}
                        {loc.status === 'cancelada' && (
                          <button onClick={() => handleChangeStatus(loc.id, 'pendente')} title="Reabrir"
                            className="p-1.5 rounded-lg text-amber-400 transition-colors"
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245,158,11,0.12)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            <Clock size={15} strokeWidth={2} />
                          </button>
                        )}
                        <button onClick={() => openEdit(loc)} title="Editar"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-200 transition-colors"
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <Pencil size={14} strokeWidth={1.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Modal */}
      {modalOpen && (
        <Modal title={editing ? 'Editar Locação' : 'Nova Locação'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-rose-400 text-sm rounded-xl" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>{error}</div>
            )}
            <div>
              <label className={label}>Imóvel *</label>
              <select required value={form.imovel_id} onChange={(e) => handleChange('imovel_id', e.target.value)} className={inputBase}>
                <option value="">Selecione um imóvel</option>
                {imoveis.map((i) => <option key={i.id} value={i.id}>{i.titulo} — {i.cidade}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Cliente *</label>
              <select required value={form.cliente_id} onChange={(e) => handleChange('cliente_id', e.target.value)} className={inputBase}>
                <option value="">Selecione um cliente</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Data Início *</label>
                <input required type="date" value={form.data_inicio} onChange={(e) => handleChange('data_inicio', e.target.value)} className={inputBase} />
              </div>
              <div>
                <label className={label}>Data Fim</label>
                <input type="date" value={form.data_fim} onChange={(e) => handleChange('data_fim', e.target.value)} className={inputBase} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Valor Mensal (R$) *</label>
                <input required type="number" step="0.01" value={form.valor_mensal} onChange={(e) => handleChange('valor_mensal', e.target.value)} className={inputBase} />
              </div>
              <div>
                <label className={label}>Status</label>
                <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} className={inputBase}>
                  <option value="pendente">Pendente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
            </div>
            {valorTotal !== null && (
              <div className="p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.20)' }}>
                <p className="text-xs text-brand-400 font-medium mb-0.5">Valor total estimado</p>
                <p className="text-lg font-display font-700 text-brand-300">{fmt(valorTotal)}</p>
                {form.data_inicio && form.data_fim && (
                  <p className="text-xs text-brand-500 mt-0.5">
                    {Math.ceil((new Date(form.data_fim) - new Date(form.data_inicio)) / 86400000)} dias
                  </p>
                )}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button type="button" onClick={() => setModalOpen(false)} className={btnGhost} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Cancelar
              </button>
              <button type="submit" disabled={saving} className={btnPrimary} style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
                {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Registrar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
