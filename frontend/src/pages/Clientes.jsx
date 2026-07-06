import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, Users } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/Skeleton';
import { useToast } from '../components/Toast';

const GLASS = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' };

const emptyForm = { nome: '', cpf: '', email: '', telefone: '', endereco: '' };

const label    = 'block text-xs font-medium text-slate-500 mb-1.5';
const inputBase = 'w-full px-4 py-2.5 rounded-xl text-sm font-body';
const btnPrimary = 'inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-150 disabled:opacity-50';
const btnGhost   = 'px-5 py-2.5 text-sm font-medium text-slate-400 rounded-xl transition-colors hover:text-slate-200';

export default function Clientes() {
  const toast = useToast();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState('');
  const [error, setError]       = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchClientes() {
    try { const res = await api.get('/clientes'); setClientes(res.data); }
    catch { setError('Erro ao carregar clientes'); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchClientes(); }, []);

  const filtered = useMemo(() => {
    if (!search) return clientes;
    const q = search.toLowerCase();
    return clientes.filter((c) => c.nome.toLowerCase().includes(q));
  }, [clientes, search]);

  function openNew() { setEditing(null); setForm(emptyForm); setError(''); setModalOpen(true); }
  function openEdit(c) {
    setEditing(c);
    setForm({ nome: c.nome || '', cpf: c.cpf || '', email: c.email || '', telefone: c.telefone || '', endereco: c.endereco || '' });
    setError(''); setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editing) await api.put(`/clientes/${editing.id}`, form);
      else          await api.post('/clientes', form);
      setModalOpen(false); fetchClientes();
      toast.success(editing ? 'Cliente atualizado!' : 'Cliente cadastrado!');
    } catch (err) { setError(err.response?.data?.erro || 'Erro ao salvar cliente'); }
    finally       { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/clientes/${confirmDelete.id}`);
      setConfirmDelete(null);
      fetchClientes();
      toast.success('Cliente excluído.');
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao excluir cliente');
    } finally { setDeleting(false); }
  }

  function handleChange(field, value) { setForm((p) => ({ ...p, [field]: value })); }

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
          <h1 className="font-display text-2xl font-800 text-white">Clientes</h1>
          <p className="text-sm text-slate-500 mt-0.5 font-body">{clientes.length} clientes cadastrados</p>
        </div>
        <button
          onClick={openNew}
          className={btnPrimary}
          style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}
        >
          <Plus size={17} strokeWidth={2} /> Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputBase} pl-9 pr-4`}
        />
      </div>

      {error && (
        <div className="mb-5 p-3 text-rose-400 text-sm rounded-xl" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>
          {error}
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          message="Nenhum cliente encontrado"
          icon={Users}
          actionLabel="Novo Cliente"
          onAction={openNew}
        />
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
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium text-slate-200">{c.nome}</td>
                    <td className="font-mono text-slate-400">{c.cpf}</td>
                    <td className="text-slate-400">{c.email}</td>
                    <td className="text-slate-400">{c.telefone}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          aria-label={`Editar ${c.nome}`}
                          className="p-2 rounded-lg text-slate-600 hover:text-slate-200 hover:bg-white/10 transition-colors"
                        >
                          <Pencil size={14} strokeWidth={1.8} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(c)}
                          aria-label={`Excluir ${c.nome}`}
                          className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 size={14} strokeWidth={1.8} />
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
      <Modal open={modalOpen} title={editing ? 'Editar Cliente' : 'Novo Cliente'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-rose-400 text-sm rounded-xl" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>{error}</div>
            )}
            <div>
              <label className={label}>Nome *</label>
              <input required value={form.nome} onChange={(e) => handleChange('nome', e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={label}>CPF</label>
              <input value={form.cpf} onChange={(e) => handleChange('cpf', e.target.value)} placeholder="000.000.000-00" className={inputBase} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Email</label>
                <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className={inputBase} />
              </div>
              <div>
                <label className={label}>Telefone</label>
                <input value={form.telefone} onChange={(e) => handleChange('telefone', e.target.value)} className={inputBase} />
              </div>
            </div>
            <div>
              <label className={label}>Endereço</label>
              <input value={form.endereco} onChange={(e) => handleChange('endereco', e.target.value)} className={inputBase} />
            </div>
            <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button type="button" onClick={() => setModalOpen(false)} className={btnGhost} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Cancelar
              </button>
              <button type="submit" disabled={saving} className={btnPrimary} style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
                {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </Modal>

      {/* Confirmar exclusão */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Excluir cliente?"
        message={
          <>
            <strong className="text-slate-300">{confirmDelete?.nome}</strong> será removido
            permanentemente. Esta ação não pode ser desfeita.
          </>
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
