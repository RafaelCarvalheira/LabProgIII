import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Imoveis from './pages/Imoveis';
import Clientes from './pages/Clientes';
import Locacoes from './pages/Locacoes';
import Financeiro from './pages/Financeiro';
import Disponibilidade from './pages/Disponibilidade';
import Calendario from './pages/Calendario';
import Usuarios from './pages/Usuarios';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<Login />} />

          {/* Protegidas */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/"                 element={<Dashboard />} />
            <Route path="/imoveis"          element={<Imoveis />} />
            <Route path="/clientes"         element={<Clientes />} />
            <Route path="/locacoes"         element={<Locacoes />} />
            <Route path="/financeiro"       element={<Financeiro />} />
            <Route path="/disponibilidade"  element={<Disponibilidade />} />
            <Route path="/calendario"       element={<Calendario />} />
            <Route path="/usuarios"         element={<Usuarios />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
