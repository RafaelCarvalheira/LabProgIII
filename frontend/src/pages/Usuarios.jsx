import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Search, Shield, UserCircle, Pencil, Trash2,
  X, Eye, EyeOff, AlertCircle, CheckCircle2, Link2, Building2,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';

/* ── Helpers ──────────────────────────────────────────────── */
const PAPEL_CONFIG = {
  admin:      { label: 'Admin',       color: '#6366F1', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.3)',  Icon: Shield },
  imobiliaria:{ label: 'Imobiliária', color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)', Icon: Building2 },
  usuario:    { label: 'Inquilino',   color: '#14B8A6', bg: 'rgba(20,184,166,0.10)', border: 'rgba(20,184,166,0.25)', Icon: UserCircle },
};

function RoleBadge({ papel }) {
  const cfg = PAPEL_CONFIG[papel] || PAPEL_CONFIG.usuario;
  const { Icon, label, color, bg, border } = cfg;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wide"
      style={{ color, backgroundColor: bg, border: `1px solid ${border}` }}
    >
      <Icon size={11} strokeWidth={2.2} />
      {label}
    </span>
  );
}

const BLANK = { nome: '', email: '', senha: '', papel: 'usuario', cliente_id: '', imobiliaria_id: '' };

/* ── Componente principal ─────────────────────────────────── */
export default function Usuarios() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [usuarios, setUsuarios]       = useState([]);
  const [clientes, setClientes]       = useState([]);
  const [imobiliarias, setImobiliarias] = useState([]);
  const [loading, setLoading]    = useState(true);
  const [busca, setBusca]        = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando]  = useState(null);   // null = criando
  const [form, setForm]          = useState(BLANK);
  const [showPass, setShowPass]  = useState(false);
  const [saving, setSaving]      = useState(false);
  const [feedback, setFeedback]  = useState({ tipo: '', msg: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  /* ── Carrega dados ────────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, c, im] = await Promise.all([
        api.get('/usuarios'),
        api.get('/clientes'),
        api.get('/imobiliarias'),
      ]);
      setUsuarios(u.data);
      setClientes(c.data);
      setImobiliarias(im.data);
    } catch { /* silencia */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Abre modal ───────────────────────────────────────────── */
  function abrirCriar() {
    setEditando(null);
    setForm(BLANK);
    setShowPass(false);
    setFeedback({ tipo: '', msg: '' });
    setShowModal(true);
  }

  function abrirEditar(u) {
    setEditando(u);
    setForm({
      nome:           u.nome,
      email:          u.email,
      senha:          '',
      papel:          u.papel,
      cliente_id:     u.cliente_id ?? '',
      imobiliaria_id: u.imobiliaria_id ?? '',
    });
    setShowPass(false);
    setFeedback({ tipo: '', msg: '' });
    setShowModal(true);
  }

  /* ── Salva ────────────────────────────────────────────────── */
  async function salvar(e) {
    e.preventDefault();
    setSaving(true);
    setFeedback({ tipo: '', msg: '' });

    try {
      if (!editando && !form.senha) {
        setFeedback({ tipo: 'erro', msg: 'Senha é obrigatória ao criar um usuário.' });
        return;
      }
      if (form.papel === 'imobiliaria' && !form.imobiliaria_id) {
        setFeedback({ tipo: 'erro', msg: 'Selecione a imobiliária vinculada.' });
        return;
      }

      const payload = {
        nome:           form.nome.trim(),
        email:          form.email.trim(),
        papel:          form.papel,
        cliente_id:     form.cliente_id || null,
        imobiliaria_id: form.papel === 'imobiliaria' ? form.imobiliaria_id : null,
        ...(form.senha ? { senha: form.senha } : {}),
      };

      if (editando) {
        await api.put(`/usuarios/${editando.id}`, payload);
      } else {
        await api.post('/usuarios', payload);
      }

      setFeedback({ tipo: 'ok', msg: editando ? 'Usuário atualizado!' : 'Usuário criado com sucesso!' });
      load();
      setTimeout(() => setShowModal(false), 900);
    } catch (err) {
      setFeedback({ tipo: 'erro', msg: err.response?.data?.erro || 'Erro ao salvar.' });
    } finally {
      setSaving(false);
    }
  }

  /* ── Exclui ───────────────────────────────────────────────── */
  async function excluir(u) {
    try {
      await api.delete(`/usuarios/${u.id}`);
      setUsuarios((prev) => prev.filter((x) => x.id !== u.id));
      toast.success('Usuário excluído.');
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao excluir.');
    } finally {
      setConfirmDelete(null);
    }
  }

  /* ── Filtro ───────────────────────────────────────────────── */
  const filtered = usuarios.filter((u) =>
    u.nome.toLowerCase().includes(busca.toLowerCase()) ||
    u.email.toLowerCase().includes(busca.toLowerCase())
  );

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-end justify-between mb-8 gap-4 flex-wrap"
      >
        <div>
          <p className="text-xs font-body font-700 text-accent-400 uppercase tracking-widest mb-1">
            Gestão de Acesso
          </p>
          <h1 className="font-display text-2xl font-800 text-white">
            Usuários <span className="gradient-text">& Planos</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-body">
            Crie e gerencie acessos para donos de imobiliárias
          </p>
        </div>

        <button
          onClick={abrirCriar}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.03] active:scale-95"
          style={{ background: 'linear-gradient(135deg, #6366F1, #14B8A6)', boxShadow: '0 4px 18px rgba(99,102,241,0.35)' }}
        >
          <UserPlus size={16} strokeWidth={2.2} />
          Novo Usuário
        </button>
      </motion.div>

      {/* Busca */}
      <div className="relative mb-6 max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" strokeWidth={1.8} />
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm font-body rounded-xl text-slate-200 outline-none focus:ring-1 focus:ring-brand-500/40 transition"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      {/* Tabela */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
      >
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full border-2 border-brand-500/40 border-t-brand-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-600">
            <UserCircle size={36} strokeWidth={1.2} />
            <p className="text-sm font-body">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <table className="w-full text-sm font-body">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Usuário', 'E-mail', 'Perfil', 'Vínculo', 'Criado em', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-700 text-slate-600 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group transition-colors duration-100 hover:bg-white/[0.03]"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-800 text-white"
                        style={{
                          background: u.papel === 'admin'
                            ? 'linear-gradient(135deg, #6366F1, #818CF8)'
                            : u.papel === 'imobiliaria'
                            ? 'linear-gradient(135deg, #B45309, #F59E0B)'
                            : 'linear-gradient(135deg, #0F766E, #14B8A6)',
                        }}
                      >
                        {u.nome.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-200">
                        {u.nome}
                        {u.id === me?.id && (
                          <span className="ml-2 text-[10px] text-slate-600">(você)</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-400">{u.email}</td>
                  <td className="px-5 py-4"><RoleBadge papel={u.papel} /></td>
                  <td className="px-5 py-4">
                    {u.imobiliaria_nome ? (
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Building2 size={12} strokeWidth={2} className="text-amber-500" />
                        {u.imobiliaria_nome}
                      </span>
                    ) : u.cliente_nome ? (
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Link2 size={12} strokeWidth={2} className="text-accent-500" />
                        {u.cliente_nome}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {new Date(u.criado_em).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => abrirEditar(u)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                        title="Editar"
                        aria-label={`Editar ${u.nome}`}
                      >
                        <Pencil size={14} strokeWidth={2} />
                      </button>
                      {u.id !== me?.id && (
                        <button
                          onClick={() => setConfirmDelete(u)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Excluir"
                          aria-label={`Excluir ${u.nome}`}
                        >
                          <Trash2 size={14} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Contador */}
      {!loading && (
        <p className="mt-3 text-xs text-slate-700 font-body">
          {filtered.length} {filtered.length === 1 ? 'usuário' : 'usuários'}
        </p>
      )}

      {/* ── Modal criar/editar ─────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #0E1624 0%, #111C2E 100%)',
                border: '1px solid rgba(255,255,255,0.09)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
              }}
            >
              {/* Cabeçalho */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #14B8A6)' }}
                  >
                    <UserPlus size={14} strokeWidth={2.2} className="text-white" />
                  </div>
                  <h2 className="font-display font-700 text-white text-base">
                    {editando ? 'Editar Usuário' : 'Novo Usuário'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  aria-label="Fechar"
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>

              {/* Formulário */}
              <form onSubmit={salvar} className="px-6 py-5 space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-xs font-700 text-slate-400 mb-1.5 uppercase tracking-wide font-body">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Ex.: João Silva"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl text-slate-200 outline-none focus:ring-1 focus:ring-brand-500/40 transition font-body"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-xs font-700 text-slate-400 mb-1.5 uppercase tracking-wide font-body">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@empresa.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl text-slate-200 outline-none focus:ring-1 focus:ring-brand-500/40 transition font-body"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-xs font-700 text-slate-400 mb-1.5 uppercase tracking-wide font-body">
                    Senha{editando ? ' (deixe em branco para manter)' : ''}
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required={!editando}
                      value={form.senha}
                      onChange={(e) => setForm({ ...form, senha: e.target.value })}
                      placeholder={editando ? 'Nova senha (opcional)' : 'Mínimo 6 caracteres'}
                      className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl text-slate-200 outline-none focus:ring-1 focus:ring-brand-500/40 transition font-body"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Perfil */}
                <div>
                  <label className="block text-xs font-700 text-slate-400 mb-1.5 uppercase tracking-wide font-body">
                    Perfil de acesso
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['usuario', 'imobiliaria', 'admin'].map((p) => {
                      const { label, color, bg, border, Icon } = PAPEL_CONFIG[p];
                      const active = form.papel === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setForm({ ...form, papel: p })}
                          className="flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150"
                          style={{
                            background: active ? bg : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${active ? border : 'rgba(255,255,255,0.07)'}`,
                            color: active ? color : '#64748b',
                          }}
                        >
                          <Icon size={14} strokeWidth={2} />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 font-body">
                    {form.papel === 'admin'
                      ? 'Acesso total à plataforma, todas as imobiliárias'
                      : form.papel === 'imobiliaria'
                      ? 'Gerencia imóveis, clientes e locações da imobiliária vinculada'
                      : 'Vê apenas seus próprios imóveis e contratos'}
                  </p>
                </div>

                {/* Imobiliária vinculada */}
                {form.papel === 'imobiliaria' && (
                  <div>
                    <label className="block text-xs font-700 text-slate-400 mb-1.5 uppercase tracking-wide font-body">
                      Imobiliária vinculada
                    </label>
                    <select
                      required
                      value={form.imobiliaria_id}
                      onChange={(e) => setForm({ ...form, imobiliaria_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl text-slate-300 outline-none focus:ring-1 focus:ring-brand-500/40 transition font-body"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <option value="">Selecione...</option>
                      {imobiliarias.map((im) => (
                        <option key={im.id} value={im.id} style={{ background: '#0E1624' }}>
                          {im.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Cliente vinculado */}
                {form.papel === 'usuario' && (
                  <div>
                    <label className="block text-xs font-700 text-slate-400 mb-1.5 uppercase tracking-wide font-body">
                      Vincular ao cliente (opcional)
                    </label>
                    <select
                      value={form.cliente_id}
                      onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl text-slate-300 outline-none focus:ring-1 focus:ring-brand-500/40 transition font-body"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <option value="">— Sem vínculo —</option>
                      {clientes.map((c) => (
                        <option key={c.id} value={c.id} style={{ background: '#0E1624' }}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-600 mt-1.5 font-body">
                      Usuários do perfil Inquilino só acessam dados do cliente vinculado
                    </p>
                  </div>
                )}

                {/* Feedback */}
                <AnimatePresence>
                  {feedback.msg && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-body"
                      style={{
                        background: feedback.tipo === 'ok'
                          ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${feedback.tipo === 'ok'
                          ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'}`,
                        color: feedback.tipo === 'ok' ? '#10B981' : '#EF4444',
                      }}
                    >
                      {feedback.tipo === 'ok'
                        ? <CheckCircle2 size={15} strokeWidth={2} />
                        : <AlertCircle  size={15} strokeWidth={2} />}
                      {feedback.msg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botões */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors font-body"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #14B8A6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}
                  >
                    {saving ? 'Salvando…' : editando ? 'Salvar alterações' : 'Criar usuário'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal confirmar exclusão ───────────────────────────── */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Excluir usuário?"
        message={
          <>
            <strong className="text-slate-300">{confirmDelete?.nome}</strong> perderá o acesso
            imediatamente. Esta ação não pode ser desfeita.
          </>
        }
        onConfirm={() => excluir(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
