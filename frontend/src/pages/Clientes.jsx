import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2, Users } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/Skeleton';

const emptyForm = { nome: '', cpf: '', email: '', telefone: '', endereco: '' };

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  async function fetchClientes() {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch {
      setError('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchClientes(); }, []);

  const filtered = useMemo(() => {
    if (!search) return clientes;
    const q = search.toLowerCase();
    return clientes.filter((c) => c.nome.toLowerCase().includes(q));
  }, [clientes, search]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  }

  function openEdit(cliente) {
    setEditing(cliente);
    setForm({
      nome: cliente.nome || '',
      cpf: cliente.cpf || '',
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      endereco: cliente.endereco || '',
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.put(`/clientes/${editing.id}`, form);
      } else {
        await api.post('/clientes', form);
      }
      setModalOpen(false);
      fetchClientes();
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao salvar cliente');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      await api.delete(`/clientes/${id}`);
      fetchClientes();
    } catch {
      setError('Erro ao excluir cliente');
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-800 text-slate-800 mb-8">Clientes</h1>
        <SkeletonTable rows={6} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="font-display text-2xl font-800 text-slate-800">Clientes</h1>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus size={18} strokeWidth={2} />
          Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState message="Nenhum cliente encontrado" icon={Users} />
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-hidden animate-fade-in-up">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nome</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">CPF</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Telefone</th>
                  <th className="text-right px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cliente, idx) => (
                  <tr
                    key={cliente.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-surface transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{cliente.nome}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">{cliente.cpf}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{cliente.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{cliente.telefone}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => openEdit(cliente)}
                          className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        >
                          <Pencil size={15} strokeWidth={1.8} />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente.id)}
                          className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={15} strokeWidth={1.8} />
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

      {/* Modal */}
      {modalOpen && (
        <Modal
          title={editing ? 'Editar Cliente' : 'Novo Cliente'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Nome *</label>
              <input
                required
                value={form.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">CPF</label>
              <input
                value={form.cpf}
                onChange={(e) => handleChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Telefone</label>
                <input
                  value={form.telefone}
                  onChange={(e) => handleChange('telefone', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Endereço</label>
              <input
                value={form.endereco}
                onChange={(e) => handleChange('endereco', e.target.value)}
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
                {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
