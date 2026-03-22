import { useState, useEffect } from 'react';
import { Plus, FileKey2, XCircle } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/Skeleton';

function formatCurrency(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR');
}

const emptyForm = { imovel_id: '', cliente_id: '', data_inicio: '', data_fim: '', valor_mensal: '' };

export default function Locacoes() {
  const [locacoes, setLocacoes] = useState([]);
  const [imoveis, setImoveis] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      await api.post('/locacoes', {
        ...form,
        valor_mensal: parseFloat(form.valor_mensal) || 0,
      });
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao registrar locação');
    } finally {
      setSaving(false);
    }
  }

  async function handleEncerrar(id) {
    if (!confirm('Deseja encerrar esta locação?')) return;
    try {
      await api.patch(`/locacoes/${id}/encerrar`);
      fetchAll();
    } catch {
      setError('Erro ao encerrar locação');
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
        <h1 className="font-display text-2xl font-800 text-slate-800">Locações</h1>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus size={18} strokeWidth={2} />
          Nova Locação
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      {locacoes.length === 0 ? (
        <EmptyState message="Nenhuma locação registrada" icon={FileKey2} />
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-hidden animate-fade-in-up">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Imóvel</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Início</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fim</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Valor Mensal</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {locacoes.map((loc) => (
                  <tr
                    key={loc.id}
                    className={`border-b border-slate-50 last:border-0 hover:bg-surface transition-colors ${
                      !loc.ativa ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{loc.imovel_titulo}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{loc.cliente_nome}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(loc.data_inicio)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(loc.data_fim)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-brand-700">
                      {formatCurrency(loc.valor_mensal)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={loc.ativa ? 'Ativo' : 'Inativo'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {loc.ativa && (
                        <button
                          onClick={() => handleEncerrar(loc.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                        >
                          <XCircle size={13} strokeWidth={2} />
                          Encerrar
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
        <Modal title="Nova Locação" onClose={() => setModalOpen(false)}>
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
                {imoveis
                  .filter((i) => i.disponivel)
                  .map((i) => (
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Data Início *</label>
                <input
                  required
                  type="date"
                  value={form.data_inicio}
                  onChange={(e) => handleChange('data_inicio', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Data Fim</label>
                <input
                  type="date"
                  value={form.data_fim}
                  onChange={(e) => handleChange('data_fim', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Valor Mensal (R$) *</label>
              <input
                required
                type="number"
                step="0.01"
                value={form.valor_mensal}
                onChange={(e) => handleChange('valor_mensal', e.target.value)}
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
