import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'Nenhum registro encontrado', icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <Icon size={48} strokeWidth={1.2} className="mb-4 text-slate-300" />
      <p className="text-sm font-body">{message}</p>
    </div>
  );
}
