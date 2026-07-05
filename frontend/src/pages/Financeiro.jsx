import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, DollarSign, TrendingUp, TrendingDown, CheckCircle2,
  Pencil, Trash2, Wallet, AlertCircle, Filter, X as XIcon,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../api/axios';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { SkeletonCard, SkeletonTable } from '../components/Skeleton';

const GLASS = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' };

function fmt(val)   { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0); }
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(String(d).slice(0, 10) + 'T00:00:00');
  return isNaN(dt) ? '—' : dt.toLocaleDateString('pt-BR');
}

const emptyForm = { locacao_id: '', tipo: 'receita', valor: '', data_vencimento: '', descricao: '', status: 'pendente' };
const label      = 'block text-xs font-medium text-slate-500 mb-1.5';
const inputBase  = 'w-full px-4 py-2.5 rounded-xl text-sm font-body';
const btnPrimary = 'inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all disabled:opacity-50';
const btnGhost   = 'px-5 py-2.5 text-sm font-medium text-slate-400 rounded-xl transition-colors hover:text-slate-200';

const STATUS_COLORS = { pago: '#10B981', pendente: '#F59E0B', atrasado: '#F43F5E' };

/* ── KPI Card ─────────────────────────────────────────────── */
function KpiCard({ label: lbl, value, icon: Icon, glow, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-5"
      style={GLASS}
    >
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl pointer-events-none" style={{ background: glow }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-body font-600 text-slate-500 uppercase tracking-widest">{lbl}</p>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: gradient }}>
            <Icon size={15} strokeWidth={2} className="text-white" />
          </div>
        </div>
        <p className="font-display text-xl font-800 text-white tabular-nums">{value}</p>
      </div>
    </motion.div>
  );
}

/* ── Resumo Box ───────────────────────────────────────────── */
function ResumoBox({ label: lbl, value, color, raw }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <p className="text-[10px] font-medium text-slate-600 uppercase tracking-wider mb-1">{lbl}</p>
      <p className={`text-lg font-700 ${color}`}>{raw ? (value ?? 0) : fmt(value)}</p>
    </div>
  );
}

/* ── Custom Tooltip ───────────────────────────────────────── */
function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 text-sm rounded-xl" style={{ background: '#1A2235', border: '1px solid rgba(255,255,255,0.10)' }}>
      <p style={{ color: payload[0].payload.fill }}>{payload[0].name}: {payload[0].value}</p>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────── */
export default function Financeiro() {
  const [registros, setRegistros] = useState([]);
  const [locacoes, setLocacoes]   = useState([]);
  const [resumo, setResumo]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filters, setFilters]     = useState({ tipo: '', status: '', locacao_id: '', data_inicio: '', data_fim: '' });

  const fetchAll = useCallback(async () => {
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const [finRes, locRes, resumoRes] = await Promise.all([
        api.get('/financeiro', { params }),
        api.get('/locacoes'),
        api.get('/financeiro/resumo'),
      ]);
      setRegistros(finRes.data); setLocacoes(locRes.data); setResumo(resumoRes.data);
    } catch { setError('Erro ao carregar dados'); }
    finally  { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const pieData = useMemo(() => {
    if (!resumo) return [];
    return [
      { name: 'Pago',     value: resumo.qtd_pago,     fill: STATUS_COLORS.pago     },
      { name: 'Pendente', value: resumo.qtd_pendente, fill: STATUS_COLORS.pendente },
      { name: 'Atrasado', value: resumo.qtd_atrasado, fill: STATUS_COLORS.atrasado },
    ].filter((d) => d.value > 0);
  }, [resumo]);

  function openNew() { setEditId(null); setForm(emptyForm); setError(''); setModalOpen(true); }
  function openEdit(reg) {
    setEditId(reg.id);
    setForm({
      locacao_id: reg.locacao_id ?? '', tipo: reg.tipo, valor: reg.valor ?? '',
      data_vencimento: reg.data_vencimento ? reg.data_vencimento.slice(0, 10) : '',
      descricao: reg.descricao ?? '', status: reg.status,
    });
    setError(''); setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...form, valor: parseFloat(form.valor) || 0 };
      if (editId) await api.put(`/financeiro/${editId}`, payload);
      else         await api.post('/financeiro', payload);
      setModalOpen(false); fetchAll();
    } catch (err) { setError(err.response?.data?.erro || 'Erro ao salvar lançamento'); }
    finally       { setSaving(false); }
  }

  async function handlePagar(id) {
    try { await api.patch(`/financeiro/${id}/pagar`); fetchAll(); }
    catch { setError('Erro ao registrar pagamento'); }
  }

  async function handleDelete(id) {
    try { await api.delete(`/financeiro/${id}`); setConfirmDelete(null); fetchAll(); }
    catch { setError('Erro ao excluir lançamento'); }
  }

  function handleChange(f, v) { setForm((p) => ({ ...p, [f]: v })); }
  function handleFilter(f, v) { setFilters((p) => ({ ...p, [f]: v })); }
  function clearFilters() { setFilters({ tipo: '', status: '', locacao_id: '', data_inicio: '', data_fim: '' }); }
  const hasFilters = Object.values(filters).some((v) => v);

  if (loading) {
    return (
      <div>
        <div className="skeleton h-7 w-32 mb-8 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <SkeletonTable rows={6} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-800 text-white">Financeiro</h1>
          <p className="text-sm text-slate-500 mt-0.5 font-body">Dashboard analítico de receitas, despesas e cobranças</p>
        </div>
        <button
          onClick={openNew}
          className={btnPrimary}
          style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}
        >
          <Plus size={17} strokeWidth={2} /> Novo Lançamento
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <KpiCard label="Total Receitas"      value={fmt(resumo?.total_receitas)} icon={TrendingUp}   glow="rgba(16,185,129,0.20)"  gradient="linear-gradient(135deg,#10B981,#34D399)" />
        <KpiCard label="Total Despesas"      value={fmt(resumo?.total_despesas)} icon={TrendingDown}  glow="rgba(244,63,94,0.20)"   gradient="linear-gradient(135deg,#F43F5E,#FB7185)" />
        <KpiCard label="Saldo"               value={fmt(resumo?.saldo)}          icon={Wallet}        glow={resumo?.saldo >= 0 ? 'rgba(99,102,241,0.20)' : 'rgba(244,63,94,0.20)'} gradient={resumo?.saldo >= 0 ? 'linear-gradient(135deg,#6366F1,#818CF8)' : 'linear-gradient(135deg,#F43F5E,#FB7185)'} />
        <KpiCard label="Pendente / Atrasado" value={fmt((resumo?.total_pendente || 0) + (resumo?.total_atrasado || 0))} icon={AlertCircle} glow="rgba(245,158,11,0.20)" gradient="linear-gradient(135deg,#F59E0B,#FCD34D)" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Donut */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5"
          style={GLASS}
        >
          <h2 className="font-display text-sm font-700 text-white mb-4">Distribuição por Status</h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-slate-600 text-sm">Sem lançamentos</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={3}>
                  {pieData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#94A3B8', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Resumo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="lg:col-span-2 rounded-2xl p-5"
          style={GLASS}
        >
          <h2 className="font-display text-sm font-700 text-white mb-4">Visão Geral</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ResumoBox label="Recebido"    value={resumo?.receitas_recebidas}  color="text-emerald-400" />
            <ResumoBox label="Despesas pagas" value={resumo?.despesas_pagas}   color="text-rose-400" />
            <ResumoBox label="Pendente"    value={resumo?.total_pendente}      color="text-amber-400" />
            <ResumoBox label="Atrasado"    value={resumo?.total_atrasado}      color="text-rose-500" />
            <ResumoBox label="Lançamentos" value={resumo?.qtd_total}           color="text-slate-300" raw />
            <ResumoBox label="Saldo"       value={resumo?.saldo}               color={resumo?.saldo >= 0 ? 'text-brand-400' : 'text-rose-400'} />
          </div>
        </motion.div>
      </div>

      {/* Filters panel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="rounded-2xl p-5 mb-6"
        style={GLASS}
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter size={14} strokeWidth={1.8} className="text-slate-500" />
          <h3 className="font-display text-sm font-700 text-slate-300">Filtros</h3>
          {hasFilters && (
            <button onClick={clearFilters} className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-rose-400 hover:text-rose-300">
              <XIcon size={12} /> Limpar
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <select value={filters.tipo}       onChange={(e) => handleFilter('tipo', e.target.value)}       className="px-3 py-2 rounded-lg text-sm font-body">
            <option value="">Tipo (todos)</option>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
          <select value={filters.status}     onChange={(e) => handleFilter('status', e.target.value)}     className="px-3 py-2 rounded-lg text-sm font-body">
            <option value="">Status (todos)</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="atrasado">Atrasado</option>
          </select>
          <select value={filters.locacao_id} onChange={(e) => handleFilter('locacao_id', e.target.value)} className="px-3 py-2 rounded-lg text-sm font-body">
            <option value="">Locação (todas)</option>
            {locacoes.map((l) => <option key={l.id} value={l.id}>#{l.id} - {l.imovel_titulo}</option>)}
          </select>
          <input type="date" value={filters.data_inicio} onChange={(e) => handleFilter('data_inicio', e.target.value)} className="px-3 py-2 rounded-lg text-sm font-body" />
          <input type="date" value={filters.data_fim}    onChange={(e) => handleFilter('data_fim', e.target.value)}    className="px-3 py-2 rounded-lg text-sm font-body" />
        </div>
      </motion.div>

      {error && (
        <div className="mb-5 p-3 text-rose-400 text-sm rounded-xl" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>{error}</div>
      )}

      {/* Table */}
      {registros.length === 0 ? (
        <EmptyState message="Nenhum lançamento encontrado" icon={DollarSign} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="rounded-2xl overflow-hidden"
          style={GLASS}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descrição / Locação</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Pagamento</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((reg) => (
                  <tr key={reg.id}>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${reg.tipo === 'receita' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {reg.tipo === 'receita' ? <TrendingUp size={13} strokeWidth={2} /> : <TrendingDown size={13} strokeWidth={2} />}
                        {reg.tipo.charAt(0).toUpperCase() + reg.tipo.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm text-slate-300">
                        {reg.descricao || <span className="text-slate-600 italic">sem descrição</span>}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        #{reg.locacao_id} - {reg.imovel_titulo || '?'} ({reg.cliente_nome || '?'})
                      </div>
                    </td>
                    <td className="text-sm font-semibold text-slate-200">{fmt(reg.valor)}</td>
                    <td className="text-slate-400">{fmtDate(reg.data_vencimento)}</td>
                    <td className="text-slate-400">{fmtDate(reg.data_pagamento)}</td>
                    <td>
                      <StatusBadge status={reg.status.charAt(0).toUpperCase() + reg.status.slice(1)} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="inline-flex items-center gap-2">
                        {reg.status !== 'pago' && (
                          <button
                            onClick={() => handlePagar(reg.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 rounded-lg transition-colors"
                            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.20)' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16,185,129,0.22)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16,185,129,0.12)'}
                          >
                            <CheckCircle2 size={12} strokeWidth={2} /> Pagar
                          </button>
                        )}
                        <button onClick={() => openEdit(reg)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-200 transition-colors"
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <Pencil size={13} strokeWidth={2} />
                        </button>
                        <button onClick={() => setConfirmDelete(reg)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 transition-colors"
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <Trash2 size={13} strokeWidth={2} />
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

      {/* Modal criar/editar */}
      {modalOpen && (
        <Modal title={editId ? 'Editar Lançamento' : 'Novo Lançamento'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 text-rose-400 text-sm rounded-xl" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>{error}</div>}
            <div>
              <label className={label}>Locação *</label>
              <select required value={form.locacao_id} onChange={(e) => handleChange('locacao_id', e.target.value)} className={inputBase}>
                <option value="">Selecione uma locação</option>
                {locacoes.map((l) => <option key={l.id} value={l.id}>#{l.id} - {l.imovel_titulo} ({l.cliente_nome})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Tipo *</label>
                <select required value={form.tipo} onChange={(e) => handleChange('tipo', e.target.value)} className={inputBase}>
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>
              <div>
                <label className={label}>Valor (R$) *</label>
                <input required type="number" step="0.01" value={form.valor} onChange={(e) => handleChange('valor', e.target.value)} className={inputBase} />
              </div>
            </div>
            <div>
              <label className={label}>Descrição</label>
              <input type="text" value={form.descricao} onChange={(e) => handleChange('descricao', e.target.value)} placeholder="Ex: aluguel maio/2026, conta de luz..." className={inputBase} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Data de Vencimento *</label>
                <input required type="date" value={form.data_vencimento} onChange={(e) => handleChange('data_vencimento', e.target.value)} className={inputBase} />
              </div>
              <div>
                <label className={label}>Status</label>
                <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} className={inputBase}>
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="atrasado">Atrasado</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button type="button" onClick={() => setModalOpen(false)} className={btnGhost} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>Cancelar</button>
              <button type="submit" disabled={saving} className={btnPrimary} style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
                {saving ? 'Salvando...' : editId ? 'Atualizar' : 'Registrar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirmar exclusão */}
      {confirmDelete && (
        <Modal title="Excluir lançamento" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-slate-400 mb-6">
            Tem certeza que deseja excluir o lançamento de{' '}
            <strong className="text-white">{fmt(confirmDelete.valor)}</strong>{' '}
            ({confirmDelete.tipo}) com vencimento em{' '}
            <strong className="text-white">{fmtDate(confirmDelete.data_vencimento)}</strong>?
            <br /><span className="text-slate-600">Essa ação não pode ser desfeita.</span>
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className={btnGhost} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>Cancelar</button>
            <button onClick={() => handleDelete(confirmDelete.id)} className={btnPrimary} style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>Excluir</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
