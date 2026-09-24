/**
 * Small reusable loading indicator. Used anywhere a page shows a "Loading
 * ..." state, so it reads as one consistent visual language rather than
 * plain text scattered across pages.
 */
function Spinner({ label = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--color-text-muted)' }}>
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export default Spinner;
