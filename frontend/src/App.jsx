import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Imoveis = lazy(() => import('./pages/Imoveis'));
const Clientes = lazy(() => import('./pages/Clientes'));
const Locacoes = lazy(() => import('./pages/Locacoes'));
const Financeiro = lazy(() => import('./pages/Financeiro'));
const Disponibilidade = lazy(() => import('./pages/Disponibilidade'));
const Calendario = lazy(() => import('./pages/Calendario'));
const Usuarios = lazy(() => import('./pages/Usuarios'));
const Imobiliarias = lazy(() => import('./pages/Imobiliarias'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-indigo-400 animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/imobiliarias"     element={<Imobiliarias />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
