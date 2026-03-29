import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileKey2,
  DollarSign,
  CalendarSearch,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/imoveis', label: 'Imóveis', icon: Building2 },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/locacoes', label: 'Locações', icon: FileKey2 },
  { to: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { to: '/disponibilidade', label: 'Disponibilidade', icon: CalendarSearch },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-sidebar flex flex-col z-50">
        {/* Logo */}
        <div className="px-7 py-8 border-b border-white/5">
          <h1 className="font-display text-xl font-800 text-white tracking-tight">
            <span className="text-brand-400">RCP</span> Data Imob
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-body">Gestão Imobiliária</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body font-medium transition-all duration-200 relative group ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-400'
                    : 'text-slate-400 hover:bg-sidebar-hover hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-brand-400 rounded-r-full" />
                  )}
                  <Icon size={20} strokeWidth={1.8} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-white/5">
          <p className="text-[11px] text-slate-600 font-body">
            v1.0 &middot; Lab Prog III
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-[260px] flex-1 main-content min-h-screen">
        <div className="max-w-[1280px] mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
