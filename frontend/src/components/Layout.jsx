import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileKey2,
  DollarSign,
  CalendarSearch,
  CalendarDays,
  ChevronLeft,
  LogOut,
  ShieldCheck,
  UserCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ADMIN_NAV = [
  { to: '/',                label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/imoveis',         label: 'Imóveis',         icon: Building2 },
  { to: '/clientes',        label: 'Clientes',        icon: Users },
  { to: '/locacoes',        label: 'Locações',        icon: FileKey2 },
  { to: '/financeiro',      label: 'Financeiro',      icon: DollarSign },
  { to: '/disponibilidade', label: 'Disponibilidade', icon: CalendarSearch },
  { to: '/calendario',      label: 'Agenda',          icon: CalendarDays },
];

const CLIENT_NAV = [
  { to: '/',                label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/imoveis',         label: 'Meus Imóveis',    icon: Building2 },
  { to: '/locacoes',        label: 'Minhas Locações', icon: FileKey2 },
  { to: '/disponibilidade', label: 'Disponibilidade', icon: CalendarSearch },
  { to: '/calendario',      label: 'Agenda',          icon: CalendarDays },
];

const SIDEBAR_OPEN   = 260;
const SIDEBAR_CLOSED =  72;

export default function Layout() {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const navItems = isAdmin ? ADMIN_NAV : CLIENT_NAV;

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: open ? SIDEBAR_OPEN : SIDEBAR_CLOSED }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="fixed left-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #080C17 0%, #0C1220 60%, #080F1C 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center px-5 border-b"
          style={{ height: 68, borderColor: 'rgba(255,255,255,0.05)', minWidth: 0 }}
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="min-w-0"
              >
                <h1 className="font-display text-[17px] font-800 tracking-tight whitespace-nowrap">
                  <span className="gradient-text">RCP</span>
                  <span className="text-white"> Data Imob</span>
                </h1>
                <p className="text-[10px] text-slate-600 mt-0.5 font-body">Gestão Imobiliária</p>
              </motion.div>
            ) : (
              <motion.div
                key="logo-mini"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="w-full flex justify-center"
              >
                <span className="font-display text-base font-800 gradient-text">R</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {navItems.map(({ to, label, icon: Icon }, idx) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-xl text-sm font-body font-medium
                 transition-colors duration-150 overflow-hidden group
                 ${open ? 'px-3 py-2.5' : 'py-2.5 justify-center'}
                 ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`
              }
              style={{ minHeight: 42 }}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(99,102,241,0.22) 0%, rgba(20,184,166,0.12) 100%)',
                        border: '1px solid rgba(99,102,241,0.22)',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                    />
                  )}
                  {!isActive && (
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                    />
                  )}
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2 : 1.7}
                    className={`relative z-10 flex-shrink-0 transition-colors ${isActive ? 'text-brand-400' : ''}`}
                  />
                  <AnimatePresence>
                    {open && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.12, delay: idx * 0.015 }}
                        className="relative z-10 truncate"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div
          className="px-3 py-4 border-t flex flex-col gap-2"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}
        >
          {/* Info do usuário */}
          <AnimatePresence>
            {open && user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl mb-1"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isAdmin
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(20,184,166,0.2))'
                      : 'rgba(255,255,255,0.06)',
                    border: isAdmin
                      ? '1px solid rgba(99,102,241,0.3)'
                      : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {isAdmin
                    ? <ShieldCheck size={13} className="text-brand-400" strokeWidth={2} />
                    : <UserCircle  size={13} className="text-slate-500"  strokeWidth={1.8} />
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-300 truncate font-body">
                    {user.nome}
                  </p>
                  <p className="text-[10px] text-slate-600 font-body">
                    {isAdmin ? 'Administrador' : 'Cliente'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl
                        text-slate-600 hover:text-red-400 transition-colors duration-150
                        ${!open ? 'justify-center' : ''}`}
            style={{ background: 'rgba(255,255,255,0.03)' }}
            title="Sair"
          >
            <LogOut size={15} strokeWidth={1.8} />
            <AnimatePresence>
              {open && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-body"
                >
                  Sair
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Collapse */}
          <button
            onClick={() => setOpen(!open)}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl
                        text-slate-600 hover:text-slate-300 transition-colors duration-150
                        ${!open ? 'justify-center' : ''}`}
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <motion.div
              animate={{ rotate: open ? 0 : 180 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            >
              <ChevronLeft size={15} strokeWidth={2} />
            </motion.div>
            <AnimatePresence>
              {open && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-body"
                >
                  Recolher
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <AnimatePresence>
            {open && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[10px] text-slate-700 px-3 font-body"
              >
                v1.0 · Lab Prog III
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <motion.main
        animate={{ marginLeft: open ? SIDEBAR_OPEN : SIDEBAR_CLOSED }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="flex-1 main-content min-h-screen"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="max-w-[1320px] mx-auto px-8 py-8"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </div>
  );
}
