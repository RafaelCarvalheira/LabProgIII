export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-card">
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="skeleton h-8 w-32 mb-2" />
      <div className="skeleton h-3 w-20" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-4 px-6">
      <div className="skeleton h-4 w-32" />
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-4 w-20" />
      <div className="skeleton h-4 w-16 ml-auto" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-white rounded-xl shadow-card divide-y divide-slate-50">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
