import { Link } from 'react-router-dom';
import { Droplets, CalendarDays, ArrowRight } from 'lucide-react';
import Card from './Card';
import IconTile from './IconTile';
import { StatusBadge } from './Badge';

/**
 * One crop recommendation: suitability (score + label), key growing facts
 * and the plain-language reason, with View details / Compare actions.
 */
function CropCard({ crop, score, level, explanation, selected, selectDisabled, onToggleSelect }) {
  return (
    <Card hover className={`item-card crop-rec${selected ? ' is-selected' : ''}`}>
      <div className="item-card__header">
        <div className="crop-rec__title">
          <IconTile fallback="crop" />
          <h3 className="item-card__title">{crop.name}</h3>
        </div>
        <StatusBadge status={level} label={`${level} suitability`} />
      </div>

      <div className="crop-rec__score">
        <div className="progress-bar" aria-hidden="true">
          <div className="progress-bar__fill" style={{ width: `${score}%` }} />
        </div>
        <span className="meta">
          Suitability score <strong>{score}/100</strong>
        </span>
      </div>

      <div className="item-card__meta">
        {crop.waterRequirement && (
          <span>
            <Droplets size={14} strokeWidth={2} aria-hidden="true" /> {crop.waterRequirement} water
          </span>
        )}
        {crop.cultivationDurationDays && (
          <span>
            <CalendarDays size={14} strokeWidth={2} aria-hidden="true" /> {crop.cultivationDurationDays} days
          </span>
        )}
      </div>

      <p className="item-card__body">
        <strong className="crop-rec__why">Why it fits: </strong>
        {explanation}
      </p>

      <div className="item-card__footer crop-rec__footer">
        <Link to={`/crops/${crop._id}`} className="btn btn-secondary btn-sm">
          View details <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </Link>
        {onToggleSelect && (
          <label className="form-check">
            <input type="checkbox" checked={selected} disabled={selectDisabled} onChange={onToggleSelect} />
            Compare
          </label>
        )}
      </div>
    </Card>
  );
}

export default CropCard;
