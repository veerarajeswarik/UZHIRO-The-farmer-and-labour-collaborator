import Card from './Card';

/**
 * Icon + label + value summary tile used across Dashboard, Cost & Profit,
 * and other overview sections.
 */
function StatCard({ icon: Icon, label, value, meta, className = '' }) {
  return (
    <Card className={`stat-card ${className}`}>
      {Icon && (
        <span className="stat-card__icon" aria-hidden="true">
          <Icon size={20} strokeWidth={2} />
        </span>
      )}
      <div>
        <div className="stat-card__label">{label}</div>
        <div className="stat-card__value">{value}</div>
        {meta && <div className="stat-card__meta">{meta}</div>}
      </div>
    </Card>
  );
}

export default StatCard;
