import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'Nenhum registro encontrado', icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-600">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <Icon size={26} strokeWidth={1.4} className="text-slate-500" />
      </div>
      <p className="text-sm font-body text-slate-500">{message}</p>
    </div>
  );
}
