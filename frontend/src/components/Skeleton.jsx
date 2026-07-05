const glassCard = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
};

export function SkeletonCard() {
  return (
    <div className="rounded-2xl p-6" style={glassCard}>
      <div className="skeleton h-3 w-24 mb-4" />
      <div className="skeleton h-8 w-32 mb-3" />
      <div className="skeleton h-3 w-20" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-4 px-4">
      <div className="skeleton h-4 w-32" />
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-4 w-20" />
      <div className="skeleton h-4 w-16 ml-auto" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={glassCard}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{ borderBottom: i < rows - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
        >
          <SkeletonRow />
        </div>
      ))}
    </div>
  );
}
