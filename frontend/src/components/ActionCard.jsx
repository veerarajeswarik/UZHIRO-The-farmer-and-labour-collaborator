import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * A card that *is* a navigation action: icon, title, one-line description,
 * arrow. Used for the dashboard pillars and quick actions.
 */
function ActionCard({ to, icon: Icon, title, description, tone = 'farm', compact = false }) {
  return (
    <Link to={to} className={`action-card action-card--${tone}${compact ? ' action-card--compact' : ''}`}>
      {Icon && (
        <span className="action-card__icon" aria-hidden="true">
          <Icon size={20} strokeWidth={2} />
        </span>
      )}
      <span className="action-card__text">
        <span className="action-card__title">{title}</span>
        {description && <span className="action-card__description">{description}</span>}
      </span>
      <ArrowRight className="action-card__arrow" size={18} strokeWidth={2} aria-hidden="true" />
    </Link>
  );
}

export default ActionCard;
