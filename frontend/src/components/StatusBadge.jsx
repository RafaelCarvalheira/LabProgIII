const variants = {
  ativo:        'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  inativo:      'bg-slate-700/40   text-slate-400   border-slate-600/30',
  disponivel:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  indisponivel: 'bg-rose-500/15    text-rose-400    border-rose-500/25',
  pendente:     'bg-amber-500/15   text-amber-400   border-amber-500/25',
  pago:         'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  atrasado:     'bg-rose-500/15    text-rose-400    border-rose-500/25',
};

export default function StatusBadge({ status }) {
  const key     = status?.toLowerCase() || 'pendente';
  const classes = variants[key] || variants.pendente;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${classes}`}
    >
      {status}
    </span>
  );
}
