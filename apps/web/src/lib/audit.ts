export interface LastChange {
  action: string;
  at: string;
  by: { id: string; name: string; email: string } | null;
}

export function formatLastChange(change: LastChange | null | undefined): string {
  if (!change) return '—';
  const who = change.by?.name ?? 'System';
  if (change.action === 'DELETE') return `Deleted by ${who}`;
  if (change.action === 'CREATE') return `Created by ${who}`;
  if (change.action === 'UPDATE') return `Edited by ${who}`;
  return `${change.action} by ${who}`;
}

export function formatLastChangeDate(change: LastChange | null | undefined): string {
  if (!change?.at) return '';
  return new Date(change.at).toLocaleString();
}
