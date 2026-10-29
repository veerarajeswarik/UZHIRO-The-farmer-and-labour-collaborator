import { AlertTriangle } from 'lucide-react';

/**
 * Consistent "nothing here" visual for empty lists/search results, replacing
 * ad-hoc plain-text messages.
 */
function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <span className="empty-state__icon" aria-hidden="true">
          <Icon size={26} strokeWidth={1.75} />
        </span>
      )}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

/**
 * Same shape as EmptyState, for failures (API errors, missing records).
 */
export function ErrorState({ title = 'Something went wrong', message, action }) {
  return (
    <div className="empty-state empty-state--error" role="alert">
      <span className="empty-state__icon" aria-hidden="true">
        <AlertTriangle size={26} strokeWidth={1.75} />
      </span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export default EmptyState;
