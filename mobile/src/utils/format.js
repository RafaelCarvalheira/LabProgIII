export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value) || 0);
}

export function formatDate(value) {
  if (!value) return '-';
  const date = value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR');
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function isISODate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
