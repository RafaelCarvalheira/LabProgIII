import { useState, useEffect, useMemo } from 'react';
import { Plus, DollarSign, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
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

const emptyForm = { locacao_id: '', tipo: 'receita', valor: '', data_vencimento: '' };

export default function Financeiro() {
  const [registros, setRegistros] = useState([]);
  const [locacoes, setLocacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');

  async function fetchAll() {
    try {
      const [finRes, locRes] = await Promise.all([
        api.get('/financeiro'),
        api.get('/locacoes'),
      ]);
      setRegistros(finRes.data);
      setLocacoes(locRes.data);
    } catch {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  const filtered = useMemo(() => {
    if (!filterStatus) return registros;
    return registros.filter((r) => r.status === filterStatus);
  }, [registros, filterStatus]);

  const totais = useMemo(() => {
    const receitas = registros
      .filter((r) => r.tipo === 'receita')
      .reduce((sum, r) => sum + parseFloat(r.valor || 0), 0);
    const despesas = registros
      .filter((r) => r.tipo === 'despesa')
      .reduce((sum, r) => sum + parseFloat(r.valor || 0), 0);
    return { receitas, despesas };
  }, [registros]);

  function openNew() {
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/financeiro', {
        ...form,
        valor: parseFloat(form.valor) || 0,
      });
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao registrar lançamento');
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

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-800 text-slate-800 mb-8">Financeiro</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={6} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="font-display text-2xl font-800 text-slate-800">Financeiro</h1>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus size={18} strokeWidth={2} />
          Novo Lançamento
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-card animate-fade-in-up">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider mb-2">
                Total Receitas
              </p>
              <p className="font-display text-2xl font-800 text-emerald-600">
                {formatCurrency(totais.receitas)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500">
              <TrendingUp size={20} strokeWidth={1.8} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider mb-2">
                Total Despesas
              </p>
              <p className="font-display text-2xl font-800 text-rose-500">
                {formatCurrency(totais.despesas)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-rose-500">
              <TrendingDown size={20} strokeWidth={1.8} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="atrasado">Atrasado</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState message="Nenhum lançamento encontrado" icon={DollarSign} />
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '160ms' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tipo</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Valor</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Vencimento</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pagamento</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((reg) => (
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
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      {formatCurrency(reg.valor)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(reg.data_vencimento)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(reg.data_pagamento)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={reg.status.charAt(0).toUpperCase() + reg.status.slice(1)} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {reg.status !== 'pago' && (
                        <button
                          onClick={() => handlePagar(reg.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle2 size={13} strokeWidth={2} />
                          Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <Modal title="Novo Lançamento" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Locação *</label>
              <select
                required
                value={form.locacao_id}
                onChange={(e) => handleChange('locacao_id', e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">Selecione uma locação</option>
                {locacoes
                  .filter((l) => l.ativa)
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      #{l.id} — {l.imovel_titulo} ({l.cliente_nome})
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
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Data de Vencimento *</label>
              <input
                required
                type="date"
                value={form.data_vencimento}
                onChange={(e) => handleChange('data_vencimento', e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
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
                {saving ? 'Salvando...' : 'Registrar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
