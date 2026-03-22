import { useState, useEffect } from 'react';
import { Building2, Users, FileKey2, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/axios';
import { SkeletonCard } from '../components/Skeleton';

function KPICard({ label, value, icon: Icon, color, delay }) {
  return (
    <div
      className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider mb-2">
            {label}
          </p>
          <p className="font-display text-3xl font-800 text-slate-800">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={22} strokeWidth={1.8} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function formatCurrency(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ imoveis: 0, clientes: 0, locacoesAtivas: 0, receitaMes: 0 });
  const [chartData, setChartData] = useState([]);
  const [ultimas, setUltimas] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [imoveisRes, clientesRes, locacoesRes, financeiroRes] = await Promise.all([
          api.get('/imoveis'),
          api.get('/clientes'),
          api.get('/locacoes'),
          api.get('/financeiro'),
        ]);

        const imoveis = imoveisRes.data;
        const clientes = clientesRes.data;
        const locacoes = locacoesRes.data;
        const financeiro = financeiroRes.data;

        const locacoesAtivas = locacoes.filter((l) => l.ativa).length;

        const now = new Date();
        const mesAtual = now.getMonth();
        const anoAtual = now.getFullYear();
        const receitaMes = financeiro
          .filter((f) => {
            if (f.status !== 'pago' || !f.data_pagamento) return false;
            const d = new Date(f.data_pagamento);
            return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
          })
          .reduce((sum, f) => sum + parseFloat(f.valor || 0), 0);

        setKpis({
          imoveis: imoveis.length,
          clientes: clientes.length,
          locacoesAtivas,
          receitaMes,
        });

        // Chart: aggregate financial by month (last 6 months)
        const meses = {};
        const nomesMes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(anoAtual, mesAtual - i, 1);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          meses[key] = { name: nomesMes[d.getMonth()], receita: 0, despesa: 0 };
        }
        financeiro.forEach((f) => {
          const dv = new Date(f.data_vencimento);
          const key = `${dv.getFullYear()}-${dv.getMonth()}`;
          if (meses[key]) {
            const val = parseFloat(f.valor || 0);
            if (f.tipo === 'receita') meses[key].receita += val;
            else meses[key].despesa += val;
          }
        });
        setChartData(Object.values(meses));

        setUltimas(locacoes.slice(0, 5));
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-800 text-slate-800 mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-slate-800 mb-8">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard label="Total de Imóveis" value={kpis.imoveis} icon={Building2} color="bg-brand-600" delay={0} />
        <KPICard label="Total de Clientes" value={kpis.clientes} icon={Users} color="bg-indigo-500" delay={80} />
        <KPICard label="Locações Ativas" value={kpis.locacoesAtivas} icon={FileKey2} color="bg-amber-500" delay={160} />
        <KPICard
          label="Receita do Mês"
          value={formatCurrency(kpis.receitaMes)}
          icon={DollarSign}
          color="bg-emerald-500"
          delay={240}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div
          className="lg:col-span-2 bg-white rounded-xl p-6 shadow-card animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} strokeWidth={1.8} className="text-brand-600" />
            <h2 className="font-display text-base font-700 text-slate-700">Evolução Financeira</h2>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0F172A',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#F8FAFC',
                    fontSize: '13px',
                  }}
                  formatter={(value) => [formatCurrency(value)]}
                />
                <Bar dataKey="receita" fill="#0D9488" radius={[6, 6, 0, 0]} name="Receita" />
                <Bar dataKey="despesa" fill="#F43F5E" radius={[6, 6, 0, 0]} name="Despesa" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-slate-400 text-sm">
              Sem dados financeiros
            </div>
          )}
        </div>

        {/* Latest rentals */}
        <div
          className="bg-white rounded-xl p-6 shadow-card animate-fade-in-up"
          style={{ animationDelay: '380ms' }}
        >
          <h2 className="font-display text-base font-700 text-slate-700 mb-4">Últimas Locações</h2>
          {ultimas.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">Nenhuma locação registrada</p>
          ) : (
            <div className="space-y-3">
              {ultimas.map((loc) => (
                <div
                  key={loc.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-muted transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {loc.imovel_titulo}
                    </p>
                    <p className="text-xs text-slate-400">{loc.cliente_nome}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-semibold text-brand-700">
                      {formatCurrency(loc.valor_mensal)}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        loc.ativa
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {loc.ativa ? 'Ativa' : 'Encerrada'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
