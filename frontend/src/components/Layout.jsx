import { useEffect, useState } from 'react';
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
  Menu,
  ShieldCheck,
  UserCircle,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RcpLogo from './RcpLogo';
import { FilterProvider } from '../context/FilterContext';
import ImobiliariaFilterBar from './ImobiliariaFilterBar';

const ADMIN_NAV = [
  { to: '/',                label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/imoveis',         label: 'Imóveis',         icon: Building2 },
  { to: '/clientes',        label: 'Clientes',        icon: Users },
  { to: '/locacoes',        label: 'Locações',        icon: FileKey2 },
  { to: '/financeiro',      label: 'Financeiro',      icon: DollarSign },
  { to: '/disponibilidade', label: 'Disponibilidade', icon: CalendarSearch },
  { to: '/calendario',      label: 'Agenda',          icon: CalendarDays },
  { to: '/imobiliarias',    label: 'Imobiliárias',    icon: ShieldCheck },
  { to: '/usuarios',        label: 'Usuários',        icon: KeyRound },
];

const MANAGER_NAV = [
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
const MOBILE_TOPBAR  =  56;
const MOBILE_QUERY   = '(max-width: 767px)';

export default function Layout() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  );
  const [open, setOpen] = useState(() => !window.matchMedia(MOBILE_QUERY).matches);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isSuperAdmin, isManager } = useAuth();

  // Acompanha o breakpoint: no mobile a sidebar vira drawer fechado por padrão
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const handler = (e) => { setIsMobile(e.matches); setOpen(!e.matches); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Fecha o drawer ao navegar (mobile)
  useEffect(() => {
    if (isMobile) setOpen(false);
  }, [location.pathname, isMobile]);

  const navItems = isSuperAdmin ? ADMIN_NAV : isManager ? MANAGER_NAV : CLIENT_NAV;

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <FilterProvider>
    <div className="flex min-h-screen">
      {/* ── Topbar mobile ───────────────────────────────────── */}
      {isMobile && (
        <div
          className="fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4"
          style={{
            height: MOBILE_TOPBAR,
            background: 'linear-gradient(180deg, #080C17 0%, #0C1220 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <Menu size={18} strokeWidth={2} />
          </button>
          <RcpLogo size={28} showText />
        </div>
      )}

      {/* ── Overlay do drawer (mobile) ──────────────────────── */}
      <AnimatePresence>
        {isMobile && open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(5,8,18,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <motion.aside
        animate={
          isMobile
            ? { x: open ? 0 : -(SIDEBAR_OPEN + 12), width: SIDEBAR_OPEN }
            : { x: 0, width: open ? SIDEBAR_OPEN : SIDEBAR_CLOSED }
        }
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="fixed left-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #080C17 0%, #0C1220 60%, #080F1C 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center px-4 border-b"
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
              >
                <RcpLogo size={34} showText subtitle />
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
                <RcpLogo size={32} />
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
                    background: isManager
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(20,184,166,0.2))'
                      : 'rgba(255,255,255,0.06)',
                    border: isManager
                      ? '1px solid rgba(99,102,241,0.3)'
                      : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {isManager
                    ? <ShieldCheck size={13} className="text-brand-400" strokeWidth={2} />
                    : <UserCircle  size={13} className="text-slate-500"  strokeWidth={1.8} />
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-300 truncate font-body">
                    {user.nome}
                  </p>
                  <p className="text-[10px] text-slate-600 font-body">
                    {isSuperAdmin ? 'Superadmin' : isManager ? 'Imobiliária' : 'Inquilino'}
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
            aria-label={open ? 'Recolher menu' : 'Expandir menu'}
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
        animate={{ marginLeft: isMobile ? 0 : open ? SIDEBAR_OPEN : SIDEBAR_CLOSED }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="flex-1 main-content min-h-screen"
        style={{ paddingTop: isMobile ? MOBILE_TOPBAR : 0 }}
      >
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 pt-8">
          <ImobiliariaFilterBar />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="max-w-[1320px] mx-auto px-4 sm:px-8 pb-8"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </div>
    </FilterProvider>
  );
}
