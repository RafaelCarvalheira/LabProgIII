import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
  BedDouble,
  Bath,
  Car,
  Ruler,
  Building2,
} from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';

const emptyForm = {
  titulo: '', descricao: '', endereco: '', cidade: '', estado: '', cep: '',
  valor_aluguel: '', valor_venda: '', area: '', quartos: 0, banheiros: 0, vagas_garagem: 0,
};

function formatCurrency(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}

export default function Imoveis() {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCidade, setFilterCidade] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');

  async function fetchImoveis() {
    try {
      const res = await api.get('/imoveis');
      setImoveis(res.data);
    } catch {
      setError('Erro ao carregar imóveis');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchImoveis(); }, []);

  const cidades = useMemo(() => {
    const set = new Set(imoveis.map((i) => i.cidade).filter(Boolean));
    return [...set].sort();
  }, [imoveis]);

  const filtered = useMemo(() => {
    return imoveis.filter((i) => {
      if (search && !i.titulo.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCidade && i.cidade !== filterCidade) return false;
      if (filterStatus === 'disponivel' && !i.disponivel) return false;
      if (filterStatus === 'indisponivel' && i.disponivel) return false;
      return true;
    });
  }, [imoveis, search, filterCidade, filterStatus]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  }

  function openEdit(imovel) {
    setEditing(imovel);
    setForm({
      titulo: imovel.titulo || '',
      descricao: imovel.descricao || '',
      endereco: imovel.endereco || '',
      cidade: imovel.cidade || '',
      estado: imovel.estado || '',
      cep: imovel.cep || '',
      valor_aluguel: imovel.valor_aluguel || '',
      valor_venda: imovel.valor_venda || '',
      area: imovel.area || '',
      quartos: imovel.quartos || 0,
      banheiros: imovel.banheiros || 0,
      vagas_garagem: imovel.vagas_garagem || 0,
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
        valor_aluguel: parseFloat(form.valor_aluguel) || 0,
        valor_venda: parseFloat(form.valor_venda) || 0,
        area: parseFloat(form.area) || 0,
        quartos: parseInt(form.quartos) || 0,
        banheiros: parseInt(form.banheiros) || 0,
        vagas_garagem: parseInt(form.vagas_garagem) || 0,
      };
      if (editing) {
        payload.disponivel = editing.disponivel;
        await api.put(`/imoveis/${editing.id}`, payload);
      } else {
        await api.post('/imoveis', payload);
      }
      setModalOpen(false);
      fetchImoveis();
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao salvar imóvel');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir este imóvel?')) return;
    try {
      await api.delete(`/imoveis/${id}`);
      fetchImoveis();
    } catch {
      setError('Erro ao excluir imóvel');
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-800 text-slate-800 mb-8">Imóveis</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="font-display text-2xl font-800 text-slate-800">Imóveis</h1>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus size={18} strokeWidth={2} />
          Novo Imóvel
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
        <select
          value={filterCidade}
          onChange={(e) => setFilterCidade(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        >
          <option value="">Todas as cidades</option>
          {cidades.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        >
          <option value="">Todos os status</option>
          <option value="disponivel">Disponível</option>
          <option value="indisponivel">Indisponível</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Cards */}
      {filtered.length === 0 ? (
        <EmptyState message="Nenhum imóvel encontrado" icon={Building2} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((imovel, idx) => (
            <div
              key={imovel.id}
              className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up overflow-hidden"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Color bar */}
              <div className={`h-1.5 ${imovel.disponivel ? 'bg-brand-500' : 'bg-slate-300'}`} />

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display text-base font-700 text-slate-800 line-clamp-1">
                    {imovel.titulo}
                  </h3>
                  <StatusBadge status={imovel.disponivel ? 'Disponível' : 'Indisponível'} />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                  <MapPin size={13} strokeWidth={1.8} />
                  <span className="truncate">
                    {imovel.cidade}{imovel.estado ? `, ${imovel.estado}` : ''}
                  </span>
                </div>

                {/* Features */}
                <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
                  {imovel.quartos > 0 && (
                    <span className="flex items-center gap-1">
                      <BedDouble size={14} strokeWidth={1.5} /> {imovel.quartos}
                    </span>
                  )}
                  {imovel.banheiros > 0 && (
                    <span className="flex items-center gap-1">
                      <Bath size={14} strokeWidth={1.5} /> {imovel.banheiros}
                    </span>
                  )}
                  {imovel.vagas_garagem > 0 && (
                    <span className="flex items-center gap-1">
                      <Car size={14} strokeWidth={1.5} /> {imovel.vagas_garagem}
                    </span>
                  )}
                  {imovel.area > 0 && (
                    <span className="flex items-center gap-1">
                      <Ruler size={14} strokeWidth={1.5} /> {imovel.area}m²
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider">Aluguel</p>
                    <p className="font-display text-lg font-700 text-brand-700">
                      {formatCurrency(imovel.valor_aluguel)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(imovel)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                      <Pencil size={15} strokeWidth={1.8} />
                    </button>
                    <button
                      onClick={() => handleDelete(imovel.id)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={15} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <Modal
          title={editing ? 'Editar Imóvel' : 'Novo Imóvel'}
          onClose={() => setModalOpen(false)}
          wide
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Título *</label>
              <input
                required
                value={form.titulo}
                onChange={(e) => handleChange('titulo', e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Descrição</label>
              <textarea
                rows={2}
                value={form.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Endereço *</label>
                <input
                  required
                  value={form.endereco}
                  onChange={(e) => handleChange('endereco', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Cidade</label>
                <input
                  value={form.cidade}
                  onChange={(e) => handleChange('cidade', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Estado</label>
                <input
                  maxLength={2}
                  value={form.estado}
                  onChange={(e) => handleChange('estado', e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">CEP</label>
                <input
                  value={form.cep}
                  onChange={(e) => handleChange('cep', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Área (m²)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.area}
                  onChange={(e) => handleChange('area', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Valor Aluguel</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valor_aluguel}
                  onChange={(e) => handleChange('valor_aluguel', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Valor Venda</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valor_venda}
                  onChange={(e) => handleChange('valor_venda', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Quartos</label>
                <input
                  type="number"
                  min="0"
                  value={form.quartos}
                  onChange={(e) => handleChange('quartos', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Banheiros</label>
                <input
                  type="number"
                  min="0"
                  value={form.banheiros}
                  onChange={(e) => handleChange('banheiros', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Vagas Garagem</label>
                <input
                  type="number"
                  min="0"
                  value={form.vagas_garagem}
                  onChange={(e) => handleChange('vagas_garagem', e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
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
                {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
