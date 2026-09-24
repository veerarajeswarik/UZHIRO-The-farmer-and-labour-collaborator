/**
 * Lightweight non-image title band for form-heavy/utility pages (Farm
 * Profile, filters-driven pages, Admin screens).
 */
function PageHeader({ eyebrow, title, description, actions, className = '' }) {
  return (
    <div className={`page-header container ${className}`}>
      {eyebrow && <span className="eyebrow" style={{ marginBottom: 'var(--space-sm)' }}>{eyebrow}</span>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
}

export default PageHeader;
