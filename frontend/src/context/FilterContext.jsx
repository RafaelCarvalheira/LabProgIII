import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const { isSuperAdmin } = useAuth();
  const [imobiliariaId, setImobiliariaId] = useState(null);
  const [imobiliarias, setImobiliarias]   = useState([]);
  const [imoveis, setImoveis]             = useState([]);
  const [clientes, setClientes]           = useState([]);
  const [locacoes, setLocacoes]           = useState([]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    Promise.all([
      api.get('/imobiliarias'),
      api.get('/imoveis'),
      api.get('/clientes'),
      api.get('/locacoes'),
    ])
      .then(([ir, imr, cr, lr]) => {
        setImobiliarias(ir.data);
        setImoveis(imr.data);
        setClientes(cr.data);
        setLocacoes(lr.data);
      })
      .catch(() => {});
  }, [isSuperAdmin]);

  // Set de imovel_ids pertencentes à imobiliária selecionada
  const imovelIds = useMemo(() => {
    if (!imobiliariaId) return null;
    return new Set(imoveis.filter((i) => i.imobiliaria_id === imobiliariaId).map((i) => i.id));
  }, [imobiliariaId, imoveis]);

  // Set de cliente_ids pertencentes à imobiliária selecionada
  const clienteIds = useMemo(() => {
    if (!imobiliariaId) return null;
    return new Set(clientes.filter((c) => c.imobiliaria_id === imobiliariaId).map((c) => c.id));
  }, [imobiliariaId, clientes]);

  // Set de locacao_ids cujo imóvel pertence à imobiliária selecionada
  const locacaoIds = useMemo(() => {
    if (!imobiliariaId || !imovelIds) return null;
    return new Set(locacoes.filter((l) => imovelIds.has(l.imovel_id)).map((l) => l.id));
  }, [imobiliariaId, locacoes, imovelIds]);

  const locacoesFiltradas = useMemo(
    () => (imobiliariaId ? locacoes.filter((l) => locacaoIds?.has(l.id)) : locacoes),
    [imobiliariaId, locacoes, locacaoIds]
  );

  return (
    <FilterContext.Provider
      value={{
        imobiliariaId, setImobiliariaId, imobiliarias,
        imovelIds, clienteIds, locacaoIds, locacoesFiltradas,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export const useFilter = () => useContext(FilterContext);
