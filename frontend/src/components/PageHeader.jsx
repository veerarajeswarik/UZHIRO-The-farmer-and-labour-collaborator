import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * The one page header used across the app: optional back link, eyebrow
 * category label, the page's single H1, supporting copy, and right-aligned
 * actions (stacked on mobile).
 */
// pillar: 'farm' | 'labour' | 'neutral' - tints the eyebrow so every page
// shows which part of UZHIRO it belongs to.
function PageHeader({ eyebrow, pillar, title, description, actions, back, className = '' }) {
  return (
    <header className={`page-header ${className}`}>
      {back && (
        <Link to={back.to} className="page-header__back">
          <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
          {back.label}
        </Link>
      )}
      <div className="page-header__row">
        <div className="page-header__text">
          {eyebrow && <span className={`eyebrow${pillar ? ` eyebrow--${pillar}` : ''}`}>{eyebrow}</span>}
          <h1>{title}</h1>
          {description && <div className="page-header__description">{description}</div>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
    </header>
  );
}

export default PageHeader;
