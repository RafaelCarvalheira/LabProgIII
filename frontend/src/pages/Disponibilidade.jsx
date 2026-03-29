import { useState, useEffect } from 'react';
import {
  CalendarSearch,
  Search,
  BedDouble,
  Bath,
  Car,
  Ruler,
  CheckCircle2,
  AlertCircle,
  Tag,
} from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

function formatCurrency(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
}

const today = new Date().toISOString().split('T')[0];

export default function Disponibilidade() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [imoveis, setImoveis] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [reservaModal, setReservaModal] = useState(false);
  const [imovelSelecionado, setImovelSelecionado] = useState(null);
  const [clienteId, setClienteId] = useState('');
  const [valorMensal, setValorMensal] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    api.get('/clientes').then((r) => setClientes(r.data)).catch(() => {});
  }, []);

  async function handleBuscar(e) {
    e.preventDefault();
    if (!dataInicio || !dataFim) {
      setSearchError('Preencha as duas datas para buscar.');
      return;
    }
    if (dataFim < dataInicio) {
      setSearchError('A data de saída deve ser posterior à data de entrada.');
      return;
    }
    setSearchError('');
    setLoading(true);
    setSearched(false);
    try {
      const res = await api.get('/imoveis/disponibilidade', {
        params: { data_inicio: dataInicio, data_fim: dataFim },
      });
      setImoveis(res.data);
      setSearched(true);
    } catch (err) {
      setSearchError(err.response?.data?.erro || 'Erro ao buscar disponibilidade.');
    } finally {
      setLoading(false);
    }
  }

  function abrirReserva(imovel) {
    setImovelSelecionado(imovel);
    setClienteId('');
    setValorMensal(imovel.valor_aluguel || '');
    setSaveError('');
    setReservaModal(true);
  }

  async function handleConfirmarReserva(e) {
    e.preventDefault();
    if (!clienteId) {
      setSaveError('Selecione um cliente.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      await api.post('/locacoes', {
        imovel_id: imovelSelecionado.id,
        cliente_id: parseInt(clienteId),
        data_inicio: dataInicio,
        data_fim: dataFim,
        valor_mensal: parseFloat(valorMensal) || 0,
      });
      setReservaModal(false);
      setSuccessMsg(
        `Reserva do imóvel "${imovelSelecionado.titulo}" criada com sucesso!`
      );
      // Atualiza lista removendo o imóvel reservado
      setImoveis((prev) => prev.filter((i) => i.id !== imovelSelecionado.id));
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setSaveError(err.response?.data?.erro || 'Erro ao criar reserva.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-800 text-slate-800">
          Busca de Disponibilidade
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-body">
          Informe o período desejado para ver os imóveis disponíveis e criar uma reserva.
        </p>
      </div>

      {/* Formulário de busca */}
      <form
        onSubmit={handleBuscar}
        className="bg-white rounded-xl shadow-card p-6 mb-8 animate-fade-in-up"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Data de Entrada
            </label>
            <input
              type="date"
              value={dataInicio}
              min={today}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Data de Saída
            </label>
            <input
              type="date"
              value={dataFim}
              min={dataInicio || today}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50 whitespace-nowrap"
          >
            <Search size={16} strokeWidth={2} />
            {loading ? 'Buscando...' : 'Buscar Disponíveis'}
          </button>
        </div>

        {searchError && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl">
            <AlertCircle size={15} strokeWidth={2} />
            {searchError}
          </div>
        )}
      </form>

      {/* Feedback de sucesso */}
      {successMsg && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl animate-fade-in-up">
          <CheckCircle2 size={17} strokeWidth={2} />
          {successMsg}
        </div>
      )}

      {/* Resultados */}
      {searched && !loading && (
        <div>
          <p className="text-sm text-slate-500 mb-4">
            {imoveis.length === 0
              ? 'Nenhum imóvel disponível para o período selecionado.'
              : `${imoveis.length} imóvel${imoveis.length > 1 ? 'is' : ''} disponível${imoveis.length > 1 ? 'is' : ''} de ${formatDate(dataInicio)} até ${formatDate(dataFim)}`}
          </p>

          {imoveis.length === 0 ? (
            <EmptyState
              message="Nenhum imóvel disponível para o período informado"
              icon={CalendarSearch}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {imoveis.map((imovel, idx) => (
                <ImovelCard
                  key={imovel.id}
                  imovel={imovel}
                  idx={idx}
                  onReservar={() => abrirReserva(imovel)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de reserva */}
      {reservaModal && imovelSelecionado && (
        <Modal
          title={`Reservar — ${imovelSelecionado.titulo}`}
          onClose={() => setReservaModal(false)}
        >
          <form onSubmit={handleConfirmarReserva} className="space-y-4">
            {saveError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl">
                {saveError}
              </div>
            )}

            {/* Info resumida do imóvel */}
            <div className="p-4 bg-surface rounded-xl border border-slate-100 text-sm text-slate-600 space-y-1">
              <div className="font-medium text-slate-700">{imovelSelecionado.titulo}</div>
              <div>{imovelSelecionado.cidade}{imovelSelecionado.estado ? `, ${imovelSelecionado.estado}` : ''}</div>
              <div className="text-brand-700 font-semibold">
                {formatCurrency(imovelSelecionado.valor_aluguel)} / mês
              </div>
            </div>

            {/* Período */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Data de Entrada
                </label>
                <input
                  type="date"
                  value={dataInicio}
                  readOnly
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Data de Saída
                </label>
                <input
                  type="date"
                  value={dataFim}
                  readOnly
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Cliente */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Cliente *
              </label>
              <select
                required
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Valor mensal */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Valor Mensal (R$) *
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={valorMensal}
                onChange={(e) => setValorMensal(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReservaModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Confirmando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function ImovelCard({ imovel, idx, onReservar }) {
  return (
    <div
      className="bg-white rounded-xl shadow-card overflow-hidden flex flex-col animate-fade-in-up hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      {/* Header do card */}
      <div className="p-5 flex-1">
        <h3 className="font-display text-base font-700 text-slate-800 leading-snug mb-1">
          {imovel.titulo}
        </h3>
        {imovel.cidade && (
          <p className="text-xs text-slate-400 mb-3">
            {imovel.cidade}{imovel.estado ? `, ${imovel.estado}` : ''}
          </p>
        )}

        {/* Atributos */}
        <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
          {imovel.quartos > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble size={13} strokeWidth={1.8} />
              {imovel.quartos} quarto{imovel.quartos > 1 ? 's' : ''}
            </span>
          )}
          {imovel.banheiros > 0 && (
            <span className="flex items-center gap-1">
              <Bath size={13} strokeWidth={1.8} />
              {imovel.banheiros} banheiro{imovel.banheiros > 1 ? 's' : ''}
            </span>
          )}
          {imovel.vagas_garagem > 0 && (
            <span className="flex items-center gap-1">
              <Car size={13} strokeWidth={1.8} />
              {imovel.vagas_garagem} vaga{imovel.vagas_garagem > 1 ? 's' : ''}
            </span>
          )}
          {imovel.area && (
            <span className="flex items-center gap-1">
              <Ruler size={13} strokeWidth={1.8} />
              {imovel.area} m²
            </span>
          )}
        </div>

        {/* Categorias */}
        {Array.isArray(imovel.categorias) && imovel.categorias.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {imovel.categorias.map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-700 text-[11px] font-medium rounded-full border border-brand-100"
              >
                <Tag size={10} strokeWidth={2} />
                {cat.nome}
              </span>
            ))}
          </div>
        )}

        {/* Valor */}
        <div className="text-lg font-display font-700 text-brand-700">
          {formatCurrency(imovel.valor_aluguel)}
          <span className="text-xs font-body font-normal text-slate-400 ml-1">/mês</span>
        </div>
      </div>

      {/* Botão reservar */}
      <div className="px-5 pb-5">
        <button
          onClick={onReservar}
          className="w-full py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
        >
          Reservar
        </button>
      </div>
    </div>
  );
}
