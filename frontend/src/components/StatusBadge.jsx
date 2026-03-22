const variants = {
  ativo: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inativo: 'bg-slate-50 text-slate-500 border-slate-200',
  disponivel: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  indisponivel: 'bg-rose-50 text-rose-600 border-rose-200',
  pendente: 'bg-amber-50 text-amber-700 border-amber-200',
  pago: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  atrasado: 'bg-rose-50 text-rose-600 border-rose-200',
};

export default function StatusBadge({ status }) {
  const key = status?.toLowerCase() || 'pendente';
  const classes = variants[key] || variants.pendente;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes}`}
    >
      {status}
    </span>
  );
}
