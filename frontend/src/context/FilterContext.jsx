import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const { isAdmin } = useAuth();
  const [clienteId, setClienteId] = useState(null);
  const [clientes, setClientes]   = useState([]);
  const [locacoes, setLocacoes]   = useState([]);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([api.get('/clientes'), api.get('/locacoes')])
      .then(([cr, lr]) => { setClientes(cr.data); setLocacoes(lr.data); })
      .catch(() => {});
  }, [isAdmin]);

  // Set of imovel_ids linked to the selected cliente
  const imovelIds = useMemo(() => {
    if (!clienteId) return null;
    return new Set(locacoes.filter((l) => l.cliente_id === clienteId).map((l) => l.imovel_id));
  }, [clienteId, locacoes]);

  // Set of locacao_ids linked to the selected cliente
  const locacaoIds = useMemo(() => {
    if (!clienteId) return null;
    return new Set(locacoes.filter((l) => l.cliente_id === clienteId).map((l) => l.id));
  }, [clienteId, locacoes]);

  // Filtered locacoes for the selected cliente
  const locacoesFiltradas = useMemo(
    () => (clienteId ? locacoes.filter((l) => l.cliente_id === clienteId) : locacoes),
    [clienteId, locacoes]
  );

  return (
    <FilterContext.Provider
      value={{ clienteId, setClienteId, clientes, imovelIds, locacaoIds, locacoesFiltradas }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export const useFilter = () => useContext(FilterContext);
