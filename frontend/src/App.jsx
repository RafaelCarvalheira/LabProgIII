import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Imoveis from './pages/Imoveis';
import Clientes from './pages/Clientes';
import Locacoes from './pages/Locacoes';
import Financeiro from './pages/Financeiro';
import Disponibilidade from './pages/Disponibilidade';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/imoveis" element={<Imoveis />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/locacoes" element={<Locacoes />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/disponibilidade" element={<Disponibilidade />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
