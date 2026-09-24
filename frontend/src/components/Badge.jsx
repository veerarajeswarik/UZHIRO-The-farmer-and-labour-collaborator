/**
 * Generic colored pill. Pass `variant` directly for a known intent
 * (success/warning/danger/info/neutral), or use StatusBadge to map a raw
 * status string automatically.
 */
function Badge({ variant = 'neutral', children, className = '' }) {
  return <span className={`badge badge--${variant} ${className}`}>{children}</span>;
}

const STATUS_MAP = {
  pending: { variant: 'warning', label: 'Pending' },
  accepted: { variant: 'success', label: 'Accepted' },
  approved: { variant: 'success', label: 'Approved' },
  completed: { variant: 'info', label: 'Completed' },
  done: { variant: 'info', label: 'Done' },
  rejected: { variant: 'danger', label: 'Rejected' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
  canceled: { variant: 'danger', label: 'Cancelled' },
  high: { variant: 'success', label: 'High' },
  medium: { variant: 'warning', label: 'Medium' },
  low: { variant: 'danger', label: 'Low' },
};

export function StatusBadge({ status, label }) {
  const key = String(status || '').toLowerCase();
  const mapped = STATUS_MAP[key] || { variant: 'neutral', label: label || status };
  return <Badge variant={mapped.variant}>{label || mapped.label}</Badge>;
}

export default Badge;
