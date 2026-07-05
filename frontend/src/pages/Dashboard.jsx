import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Users,
  FileKey2,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import RcpLogo from '../components/RcpLogo';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import api from '../api/axios';

/* ── Animated Number Counter ──────────────────────────────── */
function AnimatedCounter({ value, format }) {
  const ref = useRef(null);
  const startRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (value === 0) return;
    const start = startRef.current;
    const end = value;
    const duration = 900;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = start + (end - start) * eased;
      if (ref.current) ref.current.textContent = format(current);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      else startRef.current = end;
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, format]);

  return <span ref={ref}>{format(0)}</span>;
}

/* ── KPI Card ─────────────────────────────────────────────── */
const kpiConfig = [
  {
    key: 'imoveis',
    label: 'Total de Imóveis',
    icon: Building2,
    format: (v) => Math.round(v).toString(),
    glowColor: 'rgba(99,102,241,0.20)',
    iconGradient: 'linear-gradient(135deg, #6366F1, #818CF8)',
    borderColor: 'rgba(99,102,241,0.20)',
    trend: '+2 este mês',
  },
  {
    key: 'clientes',
    label: 'Total de Clientes',
    icon: Users,
    format: (v) => Math.round(v).toString(),
    glowColor: 'rgba(168,85,247,0.18)',
    iconGradient: 'linear-gradient(135deg, #A855F7, #C084FC)',
    borderColor: 'rgba(168,85,247,0.20)',
    trend: 'Cadastros ativos',
  },
  {
    key: 'locacoesAtivas',
    label: 'Locações Ativas',
    icon: FileKey2,
    format: (v) => Math.round(v).toString(),
    glowColor: 'rgba(245,158,11,0.18)',
    iconGradient: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
    borderColor: 'rgba(245,158,11,0.20)',
    trend: 'Em andamento',
  },
  {
    key: 'receitaMes',
    label: 'Receita Recebida',
    icon: DollarSign,
    format: (v) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v),
    glowColor: 'rgba(20,184,166,0.18)',
    iconGradient: 'linear-gradient(135deg, #14B8A6, #2DD4BF)',
    borderColor: 'rgba(20,184,166,0.20)',
    trend: 'Confirmada',
  },
];

function KPICard({ config, value, index }) {
  const { label, icon: Icon, glowColor, iconGradient, borderColor, trend, format } = config;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show:   { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
      className="relative overflow-hidden rounded-2xl p-6 cursor-default"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Ambient glow orb */}
      <div
        className="absolute -top-8 -right-8 w-36 h-36 rounded-full blur-3xl pointer-events-none"
        style={{ background: glowColor }}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-body font-600 text-slate-500 uppercase tracking-widest mb-3">
            {label}
          </p>
          <p className="font-display text-3xl font-800 text-white tabular-nums">
            <AnimatedCounter value={value} format={format} />
          </p>
          <p className="text-[11px] text-slate-600 mt-2 font-body flex items-center gap-1">
            <ArrowUpRight size={11} strokeWidth={2.5} className="text-accent-400" />
            {trend}
          </p>
        </div>

        {/* Icon */}
        <div
          className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: iconGradient }}
        >
          <Icon size={20} strokeWidth={2} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Custom Tooltip ───────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const fmt = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm font-body"
      style={{
        background: '#1A2235',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      <p className="text-slate-400 text-xs mb-2 font-semibold uppercase tracking-wide">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill }} className="font-medium">
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

/* ── Skeleton Card ────────────────────────────────────────── */
function GlassSkeletonCard() {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="skeleton h-3 w-24 mb-4" />
      <div className="skeleton h-8 w-32 mb-3" />
      <div className="skeleton h-3 w-20" />
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────── */
const NOMES_MES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

/* ── Dashboard ────────────────────────────────────────────── */
export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading]   = useState(true);
  const [kpis, setKpis]         = useState({ imoveis: 0, clientes: 0, locacoesAtivas: 0, receitaMes: 0 });
  const [chartData, setChartData] = useState([]);
  const [ultimas, setUltimas]   = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [imoveisRes, clientesRes, locacoesRes, resumoRes, porMesRes] = await Promise.all([
          api.get('/imoveis'),
          api.get('/clientes'),
          api.get('/locacoes'),
          api.get('/financeiro/resumo'),
          api.get('/financeiro/por-mes', { params: { meses: 6 } }),
        ]);

        const locacoes = locacoesRes.data;
        const resumo   = resumoRes.data;
        const porMes   = porMesRes.data;

        setKpis({
          imoveis:        imoveisRes.data.length,
          clientes:       clientesRes.data.length,
          locacoesAtivas: locacoes.filter((l) => l.ativa).length,
          receitaMes:     resumo.receitas_recebidas,
        });

        setChartData(
          porMes.map((p) => {
            const [, m] = p.mes.split('-');
            return {
              name:    NOMES_MES[parseInt(m, 10) - 1],
              receita: p.receita,
              despesa: p.despesa,
            };
          })
        );

        setUltimas(locacoes.slice(0, 5));
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const fmt = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <div className="skeleton h-7 w-48 mb-2 rounded-xl" />
          <div className="skeleton h-4 w-72 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {[0, 1, 2, 3].map((i) => <GlassSkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div>
      {/* ── Hero com logo ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl px-7 py-6 mb-8 flex items-center justify-between gap-6 flex-wrap"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.14) 0%, rgba(20,184,166,0.08) 100%)',
          border: '1px solid rgba(99,102,241,0.18)',
        }}
      >
        {/* Orbs decorativos */}
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(99,102,241,0.12)' }} />
        <div className="absolute -bottom-8 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(20,184,166,0.10)' }} />

        {/* Logo + texto */}
        <div className="relative z-10 flex items-center gap-5">
          <RcpLogo size={56} />
          <div>
            <h1 className="font-display text-2xl font-800 text-white leading-tight">
              RCP <span className="gradient-text">Data Imob</span>
            </h1>
            <p className="text-sm text-slate-400 font-body mt-0.5">
              Plataforma de Gestão Imobiliária
            </p>
          </div>
        </div>

        {/* Saudação + badge */}
        <div className="relative z-10 text-right">
          <p className="text-sm text-slate-400 font-body">
            {saudacao},{' '}
            <span className="text-slate-200 font-semibold">{user?.nome?.split(' ')[0]}</span>
          </p>
          <span
            className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full text-[11px] font-700 uppercase tracking-wide"
            style={{
              background: isAdmin ? 'rgba(99,102,241,0.15)' : 'rgba(20,184,166,0.12)',
              border: isAdmin ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(20,184,166,0.25)',
              color: isAdmin ? '#818CF8' : '#2DD4BF',
            }}
          >
            <Sparkles size={10} strokeWidth={2.2} />
            {isAdmin ? 'Administrador' : 'Proprietário'}
          </span>
        </div>
      </motion.div>

      {/* Sub-header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <h2 className="font-display text-lg font-800 text-white">
          Visão <span className="gradient-text">Geral</span>
        </h2>
        <p className="text-sm text-slate-500 mt-0.5 font-body">
          Resumo financeiro e operacional em tempo real
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6"
      >
        {kpiConfig.map((cfg, i) => (
          <KPICard key={cfg.key} config={cfg} value={kpis[cfg.key]} index={i} />
        ))}
      </motion.div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.3 }}
          className="lg:col-span-2 rounded-2xl p-6"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366F1, #14B8A6)' }}
              >
                <TrendingUp size={15} strokeWidth={2.2} className="text-white" />
              </div>
              <div>
                <h2 className="font-display text-sm font-700 text-white">Evolução Financeira</h2>
                <p className="text-[11px] text-slate-600 font-body">Últimos 6 meses</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 font-body">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />Receita
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />Despesa
              </span>
            </div>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#4B5563', fontFamily: 'DM Sans' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#4B5563', fontFamily: 'DM Sans' }}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                  width={52}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar
                  dataKey="receita"
                  fill="#6366F1"
                  radius={[6, 6, 0, 0]}
                  name="Receita"
                  maxBarSize={32}
                />
                <Bar
                  dataKey="despesa"
                  fill="#F43F5E"
                  radius={[6, 6, 0, 0]}
                  name="Despesa"
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-slate-600 text-sm font-body">
              Sem dados financeiros ainda
            </div>
          )}
        </motion.div>

        {/* Latest Rentals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.40, duration: 0.3 }}
          className="rounded-2xl p-6 flex flex-col"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-sm font-700 text-white">Últimas Locações</h2>
            <span className="text-[10px] font-body text-slate-600 bg-white/5 px-2 py-1 rounded-full border border-white/8">
              {ultimas.length} registros
            </span>
          </div>

          {ultimas.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-slate-600 font-body">Nenhuma locação registrada</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-2 flex-1"
            >
              {ultimas.map((loc) => (
                <motion.div
                  key={loc.id}
                  variants={{ hidden: { opacity: 0, x: 10 }, show: { opacity: 1, x: 0 } }}
                  className="flex items-center justify-between p-3 rounded-xl transition-colors duration-150 cursor-default"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                  whileHover={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-slate-300 truncate">
                      {loc.imovel_titulo}
                    </p>
                    <p className="text-[11px] text-slate-600 font-body mt-0.5">{loc.cliente_nome}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-[13px] font-semibold text-accent-400">
                      {fmt(loc.valor_mensal)}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 ${
                        loc.ativa
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-slate-700/40 text-slate-500'
                      }`}
                    >
                      {loc.ativa ? 'Ativa' : 'Encerrada'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
