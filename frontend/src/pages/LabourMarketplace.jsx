import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { searchLabourers } from '../services/labourerService';
import PageHero from '../components/PageHero';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=1600&q=80';

const WORK_TYPES = ['Harvesting', 'Planting', 'Weeding', 'Irrigation', 'Ploughing', 'General Farm Work'];

const initialFilters = { location: '', workType: '', availability: '', minExperience: '', maxWage: '' };

function LabourMarketplace() {
  const [filters, setFilters] = useState(initialFilters);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [labourers, setLabourers] = useState([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    searchLabourers(filters)
      .then((data) => {
        if (cancelled) return;
        setLabourers(data.labourers);
        setCount(data.count);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  function handleChange(e) {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  return (
    <div>
      <PageHero
        compact
        image={HERO_IMAGE}
        eyebrow="Labour Marketplace"
        title="Find skilled farm labour"
        description="Search by location, work type, experience and wage, then send a hiring request in a few clicks."
      />
      <div className="container" style={{ paddingBottom: '3rem' }}>

      <Card>
        <div
          className="form"
          style={{ maxWidth: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)' }}
        >
          <div className="form-field">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" placeholder="e.g. Coimbatore" value={filters.location} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label htmlFor="workType">Work type</label>
            <select id="workType" name="workType" value={filters.workType} onChange={handleChange}>
              <option value="">Any</option>
              {WORK_TYPES.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="availability">Availability</label>
            <select id="availability" name="availability" value={filters.availability} onChange={handleChange}>
              <option value="">Any</option>
              <option value="true">Available now</option>
              <option value="false">Not available</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="minExperience">Min. experience (years)</label>
            <input id="minExperience" name="minExperience" type="number" min="0" value={filters.minExperience} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label htmlFor="maxWage">Max. daily wage (₹)</label>
            <input id="maxWage" name="maxWage" type="number" min="0" value={filters.maxWage} onChange={handleChange} />
          </div>
        </div>
      </Card>

      {status === 'loading' && <LoadingState label="Searching labourers..." />}

      {status === 'error' && (
        <p className="form-error" style={{ marginTop: 'var(--space-lg)' }}>
          Unable to load labourers. {error}
        </p>
      )}

      {status === 'ready' && (
        <>
          <p style={{ marginTop: 'var(--space-lg)', fontWeight: 600 }}>
            {count} labourer{count === 1 ? '' : 's'} found
          </p>

          {count === 0 ? (
            <EmptyState
              icon={Users}
              title="No labourers found"
              description="Try widening your location, work type, or experience filters."
            />
          ) : (
            <div className="crop-grid" style={{ marginTop: 'var(--space-md)' }}>
              {labourers.map((l) => (
                <div className="card card-hover crop-card" key={l.id}>
                  <div className="crop-card__header">
                    <span className="crop-card__name">{l.name}</span>
                    <span className={l.availability ? 'badge badge-high' : 'badge badge-low'}>
                      {l.availability ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <p className="crop-card__score">{l.location}</p>
                  <p className="crop-card__score">
                    {l.workTypes.join(', ')} · {l.experienceYears} yrs exp. · ₹{l.dailyWage}/day
                  </p>
                  {l.rating != null ? (
                    <p className="crop-card__score">
                      ★ {l.rating.toFixed(1)} ({l.ratingCount} reviews)
                      {l.isDemoData ? ' - demo data' : ''}
                    </p>
                  ) : (
                    <p className="crop-card__score">No ratings yet</p>
                  )}
                  <p className="crop-card__explanation">{l.description}</p>
                  <div className="crop-card__footer">
                    <Button to={`/labourers/${l.id}`} size="sm">
                      View &amp; hire
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}

export default LabourMarketplace;
