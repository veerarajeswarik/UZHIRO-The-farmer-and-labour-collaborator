import { MapPin, Briefcase, Star, ArrowRight } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { StatusBadge } from './Badge';
import { initials } from '../utils/format';

export function RatingText({ rating, ratingCount, isDemoData }) {
  if (rating == null) return <span className="meta">No ratings yet</span>;
  return (
    <span className="rating">
      <Star size={14} strokeWidth={2} aria-hidden="true" />
      <strong>{rating.toFixed(1)}</strong>
      <span className="meta">
        ({ratingCount} reviews){isDemoData ? ' · demo data' : ''}
      </span>
    </span>
  );
}

/**
 * Marketplace card for one labourer. Every field shown comes straight from
 * the /api/labourers search response.
 */
function LabourCard({ labourer: l }) {
  return (
    <Card hover className="item-card labour-card">
      <div className="labour-card__top">
        <span className="avatar" aria-hidden="true">
          {initials(l.name)}
        </span>
        <div className="labour-card__who">
          <h3 className="item-card__title">{l.name}</h3>
          <span className="item-card__meta">
            <span>
              <MapPin size={14} strokeWidth={2} aria-hidden="true" />
              {l.location}
            </span>
          </span>
        </div>
        <StatusBadge status={l.availability ? 'available' : 'unavailable'} />
      </div>

      <div className="labour-card__facts">
        <div>
          <span className="labour-card__fact-label">Daily wage</span>
          <span className="labour-card__fact-value">₹{l.dailyWage}</span>
        </div>
        <div>
          <span className="labour-card__fact-label">Experience</span>
          <span className="labour-card__fact-value">
            <Briefcase size={14} strokeWidth={2} aria-hidden="true" /> {l.experienceYears} yrs
          </span>
        </div>
      </div>

      <div className="chip-row">
        {l.workTypes.map((w) => (
          <span className="chip" key={w}>
            {w}
          </span>
        ))}
      </div>

      <RatingText rating={l.rating} ratingCount={l.ratingCount} isDemoData={l.isDemoData} />

      {l.description && <p className="item-card__body clamp-3">{l.description}</p>}

      <div className="item-card__footer">
        <Button to={`/labourers/${l.id}`} variant="secondary" size="sm">
          View profile
        </Button>
        <Button to={`/labourers/${l.id}#hire`} size="sm" icon={ArrowRight} iconPosition="right">
          Send hiring request
        </Button>
      </div>
    </Card>
  );
}

export default LabourCard;
