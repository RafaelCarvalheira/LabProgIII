import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Pencil,
  Trash2,
  Wallet,
  AlertCircle,
  Filter,
  X as XIcon,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../api/axios';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { SkeletonCard, SkeletonTable } from '../components/Skeleton';

function formatCurrency(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR');
}

const emptyForm = {
  locacao_id: '',
  tipo: 'receita',
  valor: '',
  data_vencimento: '',
  descricao: '',
  status: 'pendente',
};

const STATUS_COLORS = {
  pago:     '#10B981',
  pendente: '#F59E0B',
  atrasado: '#F43F5E',
};

export default function Financeiro() {
  const [registros, setRegistros] = useState([]);
  const [locacoes, setLocacoes] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Filtros (F3)
  const [filters, setFilters] = useState({
    tipo: '',
    status: '',
    locacao_id: '',
    data_inicio: '',
    data_fim: '',
  });

  const fetchAll = useCallback(async () => {
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const [finRes, locRes, resumoRes] = await Promise.all([
        api.get('/financeiro', { params }),
        api.get('/locacoes'),
        api.get('/financeiro/resumo'),
      ]);
      setRegistros(finRes.data);
      setLocacoes(locRes.data);
      setResumo(resumoRes.data);
    } catch {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const pieData = useMemo(() => {
    if (!resumo) return [];
    const data = [
      { name: 'Pago',     value: resumo.qtd_pago,     color: STATUS_COLORS.pago },
      { name: 'Pendente', value: resumo.qtd_pendente, color: STATUS_COLORS.pendente },
      { name: 'Atrasado', value: resumo.qtd_atrasado, color: STATUS_COLORS.atrasado },
    ];
    return data.filter((d) => d.value > 0);
  }, [resumo]);

  function openNew() {
    setEditId(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  }

  function openEdit(reg) {
    setEditId(reg.id);
    setForm({
      locacao_id: reg.locacao_id ?? '',
      tipo: reg.tipo,
      valor: reg.valor ?? '',
      data_vencimento: reg.data_vencimento ? reg.data_vencimento.slice(0, 10) : '',
      descricao: reg.descricao ?? '',
      status: reg.status,
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, valor: parseFloat(form.valor) || 0 };
      if (editId) {
        await api.put(`/financeiro/${editId}`, payload);
      } else {
        await api.post('/financeiro', payload);
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao salvar lancamento');
    } finally {
      setSaving(false);
    }
  }

  async function handlePagar(id) {
    try {
      await api.patch(`/financeiro/${id}/pagar`);
      fetchAll();
    } catch {
      setError('Erro ao registrar pagamento');
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/financeiro/${id}`);
      setConfirmDelete(null);
      fetchAll();
    } catch {
      setError('Erro ao excluir lancamento');
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFilter(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function clearFilters() {
    setFilters({ tipo: '', status: '', locacao_id: '', data_inicio: '', data_fim: '' });
  }

  const hasFilters = Object.values(filters).some((v) => v);

  if (loading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-800 text-slate-800 mb-8">Financeiro</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <SkeletonTable rows={6} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-800 text-slate-800">Financeiro</h1>
          <p className="text-sm text-slate-500 mt-1">Dashboard analitico de receitas, despesas e cobrancas</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus size={18} strokeWidth={2} />
          Novo Lancamento
        </button>
      </div>

      {/* KPI cards (F3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          label="Total Receitas"
          value={formatCurrency(resumo?.total_receitas)}
          icon={TrendingUp}
          color="bg-emerald-500"
          textColor="text-emerald-600"
        />
        <KpiCard
          label="Total Despesas"
          value={formatCurrency(resumo?.total_despesas)}
          icon={TrendingDown}
          color="bg-rose-500"
          textColor="text-rose-500"
          delay={80}
        />
        <KpiCard
          label="Saldo"
          value={formatCurrency(resumo?.saldo)}
          icon={Wallet}
          color={resumo?.saldo >= 0 ? 'bg-brand-600' : 'bg-rose-500'}
          textColor={resumo?.saldo >= 0 ? 'text-brand-700' : 'text-rose-500'}
          delay={160}
        />
        <KpiCard
          label="Pendente / Atrasado"
          value={formatCurrency((resumo?.total_pendente || 0) + (resumo?.total_atrasado || 0))}
          icon={AlertCircle}
          color="bg-amber-500"
          textColor="text-amber-600"
          subtitle={`${resumo?.qtd_pendente || 0} pendentes - ${resumo?.qtd_atrasado || 0} atrasados`}
          delay={240}
        />
      </div>

      {/* Donut chart por status (F3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-card animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h2 className="font-display text-base font-700 text-slate-700 mb-4">Distribuicao por Status</h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">
              Sem lancamentos
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0F172A',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#F8FAFC',
                    fontSize: '13px',
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Resumo monetario por status */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-card animate-fade-in-up" style={{ animationDelay: '380ms' }}>
          <h2 className="font-display text-base font-700 text-slate-700 mb-4">Visao Geral</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <ResumoBox label="Recebido"   value={resumo?.receitas_recebidas} color="text-emerald-600" />
            <ResumoBox label="Pago"       value={resumo?.despesas_pagas}     color="text-rose-500" />
            <ResumoBox label="Pendente"   value={resumo?.total_pendente}     color="text-amber-600" />
            <ResumoBox label="Atrasado"   value={resumo?.total_atrasado}     color="text-rose-600" />
            <ResumoBox label="Lancamentos" value={resumo?.qtd_total}         color="text-slate-700" raw />
            <ResumoBox label="Saldo"      value={resumo?.saldo}              color={resumo?.saldo >= 0 ? 'text-brand-700' : 'text-rose-600'} />
          </div>
        </div>
      </div>

      {/* Filtros expandidos (F3) */}
      <div className="bg-white rounded-xl p-5 shadow-card mb-6 animate-fade-in-up" style={{ animationDelay: '440ms' }}>
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} strokeWidth={1.8} className="text-slate-500" />
          <h3 className="font-display text-sm font-700 text-slate-700">Filtros</h3>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700"
            >
              <XIcon size={13} /> Limpar
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <select
            value={filters.tipo}
            onChange={(e) => handleFilter('tipo', e.target.value)}
            className="px-3 py-2 bg-surface border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="">Tipo (todos)</option>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => handleFilter('status', e.target.value)}
            className="px-3 py-2 bg-surface border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="">Status (todos)</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="atrasado">Atrasado</option>
          </select>
          <select
            value={filters.locacao_id}
            onChange={(e) => handleFilter('locacao_id', e.target.value)}
            className="px-3 py-2 bg-surface border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="">Locacao (todas)</option>
            {locacoes.map((l) => (
              <option key={l.id} value={l.id}>
                #{l.id} - {l.imovel_titulo}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filters.data_inicio}
            onChange={(e) => handleFilter('data_inicio', e.target.value)}
            className="px-3 py-2 bg-surface border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            placeholder="Inicio"
          />
          <input
            type="date"
            value={filters.data_fim}
            onChange={(e) => handleFilter('data_fim', e.target.value)}
            className="px-3 py-2 bg-surface border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            placeholder="Fim"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Tabela */}
      {registros.length === 0 ? (
        <EmptyState message="Nenhum lancamento encontrado" icon={DollarSign} />
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <Th>Tipo</Th>
                  <Th>Descricao / Locacao</Th>
                  <Th>Valor</Th>
                  <Th>Vencimento</Th>
                  <Th>Pagamento</Th>
                  <Th>Status</Th>
                  <Th align="right">Acoes</Th>
                </tr>
              </thead>
              <tbody>
                {registros.map((reg) => (
                  <tr
                    key={reg.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-surface transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                          reg.tipo === 'receita' ? 'text-emerald-600' : 'text-rose-500'
                        }`}
                      >
                        {reg.tipo === 'receita' ? (
                          <TrendingUp size={14} strokeWidth={2} />
                        ) : (
                          <TrendingDown size={14} strokeWidth={2} />
                        )}
                        {reg.tipo.charAt(0).toUpperCase() + reg.tipo.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">
                        {reg.descricao || <span className="text-slate-400 italic">sem descricao</span>}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        #{reg.locacao_id} - {reg.imovel_titulo || '?'} ({reg.cliente_nome || '?'})
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      {formatCurrency(reg.valor)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(reg.data_vencimento)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(reg.data_pagamento)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={reg.status.charAt(0).toUpperCase() + reg.status.slice(1)} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {reg.status !== 'pago' && (
                          <button
                            onClick={() => handlePagar(reg.id)}
                            title="Marcar como pago"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle2 size={13} strokeWidth={2} />
                            Pagar
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(reg)}
                          title="Editar"
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <Pencil size={14} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(reg)}
                          title="Excluir"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal criar/editar */}
      {modalOpen && (
        <Modal title={editId ? 'Editar Lancamento' : 'Novo Lancamento'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Locacao *</label>
              <select
                required
                value={form.locacao_id}
                onChange={(e) => handleChange('locacao_id', e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">Selecione uma locacao</option>
                {locacoes.map((l) => (
                  <option key={l.id} value={l.id}>
                    #{l.id} - {l.imovel_titulo} ({l.cliente_nome})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Tipo *</label>
                <select
                  required
                  value={form.tipo}
                  onChange={(e) => handleChange('tipo', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Valor (R$) *</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={form.valor}
                  onChange={(e) => handleChange('valor', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Descricao</label>
              <input
                type="text"
                value={form.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                placeholder="Ex: aluguel maio/2026, conta de luz, IPTU..."
                className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Data de Vencimento *</label>
                <input
                  required
                  type="date"
                  value={form.data_vencimento}
                  onChange={(e) => handleChange('data_vencimento', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="atrasado">Atrasado</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Salvando...' : editId ? 'Atualizar' : 'Registrar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirmar exclusao */}
      {confirmDelete && (
        <Modal title="Excluir lancamento" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-slate-600 mb-6">
            Tem certeza que deseja excluir o lancamento de{' '}
            <strong>{formatCurrency(confirmDelete.valor)}</strong>{' '}
            ({confirmDelete.tipo}) com vencimento em{' '}
            <strong>{formatDate(confirmDelete.data_vencimento)}</strong>?
            <br />
            Essa acao nao pode ser desfeita.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setConfirmDelete(null)}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleDelete(confirmDelete.id)}
              className="px-5 py-2.5 text-sm font-medium text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors"
            >
              Excluir
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, color, textColor, subtitle, delay = 0 }) {
  return (
    <div
      className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider mb-2">
            {label}
          </p>
          <p className={`font-display text-2xl font-800 ${textColor}`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={20} strokeWidth={1.8} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function ResumoBox({ label, value, color, raw }) {
  return (
    <div className="bg-surface rounded-lg p-3">
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-700 mt-1 ${color}`}>
        {raw ? value ?? 0 : formatCurrency(value)}
      </p>
    </div>
  );
}

function Th({ children, align = 'left' }) {
  return (
    <th className={`text-${align} px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider`}>
      {children}
    </th>
  );
}
