import { Inbox, Plus } from 'lucide-react';

export default function EmptyState({
  message = 'Nenhum registro encontrado',
  icon: Icon = Inbox,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-600">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <Icon size={26} strokeWidth={1.4} className="text-slate-500" />
      </div>
      <p className="text-sm font-body text-slate-500">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-150 hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}
        >
          <Plus size={15} strokeWidth={2} /> {actionLabel}
        </button>
      )}
    </div>
  );
}
