import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Pencil, Trash2,
  MapPin, BedDouble, Bath, Car, Ruler, Building2,
} from 'lucide-react';
import api from '../api/axios';
import { useFilter } from '../context/FilterContext';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';

const GLASS = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' };

const emptyForm = {
  titulo: '', descricao: '', endereco: '', cidade: '', estado: '', cep: '',
  valor_aluguel: '', valor_venda: '', area: '', quartos: 0, banheiros: 0, vagas_garagem: 0,
};

function fmt(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}

const label = 'block text-xs font-medium text-slate-500 mb-1.5';
const inputBase = 'w-full px-4 py-2.5 rounded-xl text-sm font-body';
const btnPrimary = 'inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-150';
const btnGhost  = 'px-5 py-2.5 text-sm font-medium text-slate-400 rounded-xl transition-colors hover:text-slate-200';

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.05 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', duration: 0.4, bounce: 0.05 } },
};

export default function Imoveis() {
  const { imovelIds } = useFilter() || {};
  const [imoveis, setImoveis]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState('');
  const [filterCidade, setFilterCidade] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError]           = useState('');

  async function fetchImoveis() {
    try {
      const res = await api.get('/imoveis');
      setImoveis(res.data);
    } catch { setError('Erro ao carregar imóveis'); }
    finally  { setLoading(false); }
  }

  useEffect(() => { fetchImoveis(); }, []);

  const cidades = useMemo(() => {
    return [...new Set(imoveis.map((i) => i.cidade).filter(Boolean))].sort();
  }, [imoveis]);

  const filtered = useMemo(() => {
    return imoveis.filter((i) => {
      if (imovelIds && !imovelIds.has(i.id)) return false;
      if (search && !i.titulo.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCidade && i.cidade !== filterCidade) return false;
      if (filterStatus === 'disponivel'   && !i.disponivel) return false;
      if (filterStatus === 'indisponivel' &&  i.disponivel) return false;
      return true;
    });
  }, [imoveis, imovelIds, search, filterCidade, filterStatus]);

  function openNew() { setEditing(null); setForm(emptyForm); setError(''); setModalOpen(true); }
  function openEdit(im) {
    setEditing(im);
    setForm({
      titulo: im.titulo || '', descricao: im.descricao || '', endereco: im.endereco || '',
      cidade: im.cidade || '', estado: im.estado || '', cep: im.cep || '',
      valor_aluguel: im.valor_aluguel || '', valor_venda: im.valor_venda || '',
      area: im.area || '', quartos: im.quartos || 0, banheiros: im.banheiros || 0,
      vagas_garagem: im.vagas_garagem || 0,
    });
    setError(''); setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        valor_aluguel: parseFloat(form.valor_aluguel) || 0,
        valor_venda:   parseFloat(form.valor_venda)   || 0,
        area:          parseFloat(form.area)          || 0,
        quartos:       parseInt(form.quartos)         || 0,
        banheiros:     parseInt(form.banheiros)       || 0,
        vagas_garagem: parseInt(form.vagas_garagem)   || 0,
      };
      if (editing) { payload.disponivel = editing.disponivel; await api.put(`/imoveis/${editing.id}`, payload); }
      else { await api.post('/imoveis', payload); }
      setModalOpen(false); fetchImoveis();
    } catch (err) { setError(err.response?.data?.erro || 'Erro ao salvar imóvel'); }
    finally       { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir este imóvel?')) return;
    try { await api.delete(`/imoveis/${id}`); fetchImoveis(); }
    catch { setError('Erro ao excluir imóvel'); }
  }

  function handleChange(field, value) { setForm((p) => ({ ...p, [field]: value })); }

  if (loading) {
    return (
      <div>
        <div className="skeleton h-7 w-32 mb-8 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-800 text-white">Imóveis</h1>
          <p className="text-sm text-slate-500 mt-0.5 font-body">{imoveis.length} imóveis cadastrados</p>
        </div>
        <button
          onClick={openNew}
          className={btnPrimary}
          style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}
        >
          <Plus size={17} strokeWidth={2} /> Novo Imóvel
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputBase} pl-9 pr-4`}
          />
        </div>
        <select
          value={filterCidade}
          onChange={(e) => setFilterCidade(e.target.value)}
          className={`${inputBase} px-4`}
          style={{ minWidth: 160 }}
        >
          <option value="">Todas as cidades</option>
          {cidades.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`${inputBase} px-4`}
          style={{ minWidth: 160 }}
        >
          <option value="">Todos os status</option>
          <option value="disponivel">Disponível</option>
          <option value="indisponivel">Indisponível</option>
        </select>
      </div>

      {error && (
        <div className="mb-5 p-3 text-rose-400 text-sm rounded-xl" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>
          {error}
        </div>
      )}

      {/* Cards */}
      {filtered.length === 0 ? (
        <EmptyState message="Nenhum imóvel encontrado" icon={Building2} />
      ) : (
        <motion.div
          variants={stagger} initial="hidden" animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          {filtered.map((im) => (
            <motion.div
              key={im.id}
              variants={cardVariants}
              whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
              className="rounded-2xl overflow-hidden flex flex-col"
              style={GLASS}
            >
              {/* Status bar */}
              <div
                className="h-1"
                style={{
                  background: im.disponivel
                    ? 'linear-gradient(90deg, #6366F1, #14B8A6)'
                    : 'rgba(255,255,255,0.10)',
                }}
              />

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display text-base font-700 text-white line-clamp-1 flex-1 mr-2">
                    {im.titulo}
                  </h3>
                  <StatusBadge status={im.disponivel ? 'Disponível' : 'Indisponível'} />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-4">
                  <MapPin size={12} strokeWidth={1.8} />
                  <span className="truncate">{im.cidade}{im.estado ? `, ${im.estado}` : ''}</span>
                </div>

                <div className="flex items-center gap-4 mb-4 text-xs text-slate-600">
                  {im.quartos     > 0 && <span className="flex items-center gap-1"><BedDouble size={13} strokeWidth={1.6} />{im.quartos}</span>}
                  {im.banheiros   > 0 && <span className="flex items-center gap-1"><Bath      size={13} strokeWidth={1.6} />{im.banheiros}</span>}
                  {im.vagas_garagem > 0 && <span className="flex items-center gap-1"><Car     size={13} strokeWidth={1.6} />{im.vagas_garagem}</span>}
                  {im.area        > 0 && <span className="flex items-center gap-1"><Ruler     size={13} strokeWidth={1.6} />{im.area}m²</span>}
                </div>

                <div
                  className="flex items-center justify-between pt-4 mt-auto"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div>
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-0.5">Aluguel/mês</p>
                    <p className="font-display text-lg font-700 text-accent-400">{fmt(im.valor_aluguel)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(im)}
                      className="p-2 rounded-lg text-slate-600 hover:text-slate-200 transition-colors"
                      style={{ ':hover': { background: 'rgba(255,255,255,0.08)' } }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Pencil size={14} strokeWidth={1.8} />
                    </button>
                    <button
                      onClick={() => handleDelete(im.id)}
                      className="p-2 rounded-lg text-slate-600 hover:text-rose-400 transition-colors"
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Trash2 size={14} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal */}
      {modalOpen && (
        <Modal title={editing ? 'Editar Imóvel' : 'Novo Imóvel'} onClose={() => setModalOpen(false)} wide>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-rose-400 text-sm rounded-xl" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>{error}</div>
            )}
            <div>
              <label className={label}>Título *</label>
              <input required value={form.titulo} onChange={(e) => handleChange('titulo', e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={label}>Descrição</label>
              <textarea rows={2} value={form.descricao} onChange={(e) => handleChange('descricao', e.target.value)} className={`${inputBase} resize-none`} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Endereço *</label>
                <input required value={form.endereco} onChange={(e) => handleChange('endereco', e.target.value)} className={inputBase} />
              </div>
              <div>
                <label className={label}>Cidade</label>
                <input value={form.cidade} onChange={(e) => handleChange('cidade', e.target.value)} className={inputBase} />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className={label}>Estado</label>
                <input maxLength={2} value={form.estado} onChange={(e) => handleChange('estado', e.target.value.toUpperCase())} className={inputBase} />
              </div>
              <div>
                <label className={label}>CEP</label>
                <input value={form.cep} onChange={(e) => handleChange('cep', e.target.value)} className={inputBase} />
              </div>
              <div>
                <label className={label}>Área (m²)</label>
                <input type="number" step="0.01" value={form.area} onChange={(e) => handleChange('area', e.target.value)} className={inputBase} />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className={label}>Valor Aluguel</label>
                <input type="number" step="0.01" value={form.valor_aluguel} onChange={(e) => handleChange('valor_aluguel', e.target.value)} className={inputBase} />
              </div>
              <div>
                <label className={label}>Valor Venda</label>
                <input type="number" step="0.01" value={form.valor_venda} onChange={(e) => handleChange('valor_venda', e.target.value)} className={inputBase} />
              </div>
              <div>
                <label className={label}>Quartos</label>
                <input type="number" min="0" value={form.quartos} onChange={(e) => handleChange('quartos', e.target.value)} className={inputBase} />
              </div>
              <div>
                <label className={label}>Banheiros</label>
                <input type="number" min="0" value={form.banheiros} onChange={(e) => handleChange('banheiros', e.target.value)} className={inputBase} />
              </div>
            </div>
            <div>
              <label className={label}>Vagas Garagem</label>
              <input type="number" min="0" value={form.vagas_garagem} onChange={(e) => handleChange('vagas_garagem', e.target.value)} className={`${inputBase} max-w-[120px]`} />
            </div>
            <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button type="button" onClick={() => setModalOpen(false)} className={btnGhost} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Cancelar
              </button>
              <button type="submit" disabled={saving} className={`${btnPrimary} disabled:opacity-50`} style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
                {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
