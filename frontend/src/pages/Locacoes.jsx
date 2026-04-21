import { useState, useEffect } from 'react';
import { Plus, FileKey2, XCircle, Pencil, CheckCircle2, Clock, Ban } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/Skeleton';

function formatCurrency(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
}

function calcValorTotal(data_inicio, data_fim, valor_mensal) {
  if (!data_inicio || !data_fim || !valor_mensal) return null;
  const inicio = new Date(data_inicio);
  const fim = new Date(data_fim);
  const dias = Math.max(1, Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24)));
  const meses = dias / 30;
  return parseFloat(valor_mensal) * meses;
}

const STATUS_CONFIG = {
  pendente:   { label: 'Pendente',   icon: Clock,         cls: 'bg-amber-50  text-amber-700  border-amber-200' },
  confirmada: { label: 'Confirmada', icon: CheckCircle2,  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelada:  { label: 'Cancelada',  icon: Ban,           cls: 'bg-rose-50   text-rose-600   border-rose-200' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pendente;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      <Icon size={11} strokeWidth={2} />
      {cfg.label}
    </span>
  );
}

const emptyForm = {
  imovel_id: '', cliente_id: '', data_inicio: '', data_fim: '',
  valor_mensal: '', status: 'pendente',
};

export default function Locacoes() {
  const [locacoes, setLocacoes] = useState([]);
  const [imoveis, setImoveis] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');

  const valorTotal = calcValorTotal(form.data_inicio, form.data_fim, form.valor_mensal);

  async function fetchAll() {
    try {
      const [locRes, imRes, clRes] = await Promise.all([
        api.get('/locacoes'),
        api.get('/imoveis'),
        api.get('/clientes'),
      ]);
      setLocacoes(locRes.data);
      setImoveis(imRes.data);
      setClientes(clRes.data);
    } catch {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  const filtered = filterStatus
    ? locacoes.filter((l) => l.status === filterStatus)
    : locacoes;

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  }

  function openEdit(loc) {
    setEditing(loc);
    setForm({
      imovel_id: loc.imovel_id,
      cliente_id: loc.cliente_id,
      data_inicio: loc.data_inicio?.split('T')[0] || '',
      data_fim: loc.data_fim?.split('T')[0] || '',
      valor_mensal: loc.valor_mensal || '',
      status: loc.status || 'pendente',
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        valor_mensal: parseFloat(form.valor_mensal) || 0,
      };
      if (editing) {
        await api.put(`/locacoes/${editing.id}`, payload);
      } else {
        await api.post('/locacoes', payload);
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao salvar locação');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangeStatus(id, status) {
    try {
      await api.patch(`/locacoes/${id}/status`, { status });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao alterar status');
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-800 text-slate-800 mb-8">Locações</h1>
        <SkeletonTable rows={6} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-800 text-slate-800">Locações</h1>
          <p className="text-sm text-slate-400 mt-0.5">Gerencie reservas e verifique disponibilidade</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus size={18} strokeWidth={2} />
          Nova Locação
        </button>
      </div>

      {/* Filtro por status */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { val: '', label: 'Todas' },
          { val: 'pendente', label: 'Pendente' },
          { val: 'confirmada', label: 'Confirmada' },
          { val: 'cancelada', label: 'Cancelada' },
        ].map((opt) => (
          <button
            key={opt.val}
            onClick={() => setFilterStatus(opt.val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              filterStatus === opt.val
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400'
            }`}
          >
            {opt.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              filterStatus === opt.val ? 'bg-white/20' : 'bg-slate-100'
            }`}>
              {opt.val === '' ? locacoes.length : locacoes.filter(l => l.status === opt.val).length}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState message="Nenhuma locação encontrada" icon={FileKey2} />
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-hidden animate-fade-in-up">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Imóvel</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Período</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mensal / Total</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((loc) => (
                  <tr key={loc.id} className="border-b border-slate-50 last:border-0 hover:bg-surface transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700 max-w-[160px] truncate">{loc.imovel_titulo}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{loc.cliente_nome}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {formatDate(loc.data_inicio)} → {formatDate(loc.data_fim)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-brand-700">{formatCurrency(loc.valor_mensal)}<span className="text-xs font-normal text-slate-400">/mês</span></div>
                      {loc.valor_total && (
                        <div className="text-xs text-slate-400">Total: {formatCurrency(loc.valor_total)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={loc.status || 'pendente'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {/* Ações de status rápido */}
                        {loc.status === 'pendente' && (
                          <button
                            onClick={() => handleChangeStatus(loc.id, 'confirmada')}
                            title="Confirmar"
                            className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors"
                          >
                            <CheckCircle2 size={15} strokeWidth={2} />
                          </button>
                        )}
                        {loc.status !== 'cancelada' && (
                          <button
                            onClick={() => handleChangeStatus(loc.id, 'cancelada')}
                            title="Cancelar"
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-colors"
                          >
                            <XCircle size={15} strokeWidth={2} />
                          </button>
                        )}
                        {loc.status === 'cancelada' && (
                          <button
                            onClick={() => handleChangeStatus(loc.id, 'pendente')}
                            title="Reabrir como pendente"
                            className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"
                          >
                            <Clock size={15} strokeWidth={2} />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(loc)}
                          title="Editar"
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        >
                          <Pencil size={15} strokeWidth={1.8} />
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

      {/* Modal Nova/Editar Locação */}
      {modalOpen && (
        <Modal
          title={editing ? 'Editar Locação' : 'Nova Locação'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Imóvel *</label>
              <select
                required
                value={form.imovel_id}
                onChange={(e) => handleChange('imovel_id', e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">Selecione um imóvel</option>
                {imoveis.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.titulo} — {i.cidade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Cliente *</label>
              <select
                required
                value={form.cliente_id}
                onChange={(e) => handleChange('cliente_id', e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Data Início *</label>
                <input
                  required type="date" value={form.data_inicio}
                  onChange={(e) => handleChange('data_inicio', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Data Fim</label>
                <input
                  type="date" value={form.data_fim}
                  onChange={(e) => handleChange('data_fim', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Valor Mensal (R$) *</label>
                <input
                  required type="number" step="0.01" value={form.valor_mensal}
                  onChange={(e) => handleChange('valor_mensal', e.target.value)}
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
                  <option value="confirmada">Confirmada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
            </div>

            {/* Valor total calculado */}
            {valorTotal !== null && (
              <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl">
                <p className="text-xs text-brand-600 font-medium mb-0.5">Valor total estimado</p>
                <p className="text-lg font-display font-700 text-brand-700">
                  {formatCurrency(valorTotal)}
                </p>
                {form.data_inicio && form.data_fim && (
                  <p className="text-xs text-brand-500 mt-0.5">
                    {Math.ceil((new Date(form.data_fim) - new Date(form.data_inicio)) / (1000 * 60 * 60 * 24))} dias
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50">
                {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Registrar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}