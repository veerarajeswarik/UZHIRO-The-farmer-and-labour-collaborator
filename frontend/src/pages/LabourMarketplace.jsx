import { useEffect, useState } from 'react';
import { Users, SlidersHorizontal, ClipboardList } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { searchLabourers } from '../services/labourerService';
import { friendlyError } from '../services/errors';
import Page, { Section } from '../components/Page';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import LabourCard from '../components/LabourCard';
import SkeletonGrid from '../components/Skeleton';
import EmptyState, { ErrorState } from '../components/EmptyState';

const WORK_TYPES = ['Harvesting', 'Planting', 'Weeding', 'Irrigation', 'Ploughing', 'General Farm Work'];

const initialFilters = { location: '', workType: '', availability: '', minExperience: '', maxWage: '' };

function LabourMarketplace() {
  const { token } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [labourers, setLabourers] = useState([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    searchLabourers(token, filters)
      .then((data) => {
        if (cancelled) return;
        setLabourers(data.labourers);
        setCount(data.count);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(friendlyError(err, 'Labour service'));
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, JSON.stringify(filters)]);

  function handleChange(e) {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  const hasFilters = Object.values(filters).some((v) => v !== '');

  return (
    <Page>
      <PageHeader
        eyebrow="Labour Connection"
        pillar="labour"
        title="Find skilled farm labour"
        description="Connect with available agricultural workers based on your requirements - location, work type, availability, experience and daily wage."
        actions={
          <Button to="/hiring" variant="secondary" icon={ClipboardList}>
            My hiring requests
          </Button>
        }
      />

      <Card className="filter-card">
        <Card.Header
          actions={
            hasFilters && (
              <Button variant="ghost" size="sm" onClick={() => setFilters(initialFilters)}>
                Clear filters
              </Button>
            )
          }
        >
          <Card.Title icon={SlidersHorizontal}>Search labourers</Card.Title>
        </Card.Header>
        <div className="form form-grid">
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
            <input id="minExperience" name="minExperience" type="number" min="0" placeholder="Any" value={filters.minExperience} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label htmlFor="maxWage">Max. daily wage (₹)</label>
            <input id="maxWage" name="maxWage" type="number" min="0" placeholder="Any" value={filters.maxWage} onChange={handleChange} />
          </div>
        </div>
      </Card>

      <Section
        title={status === 'ready' ? `Available labourers · ${count}` : 'Available labourers'}
        description={status === 'ready' && count > 0 ? 'Compare wage, experience and availability, then send a hiring request.' : undefined}
      >
        {status === 'loading' && <SkeletonGrid count={6} label="Searching labourers..." />}

        {status === 'error' && <ErrorState title="Unable to load labourers" message={error} />}

        {status === 'ready' &&
          (count === 0 ? (
            <Card>
              <EmptyState
                icon={Users}
                title="No labourers found matching your filters."
                description="Try widening your location, work type, experience or wage filters."
                action={
                  hasFilters && (
                    <Button variant="secondary" onClick={() => setFilters(initialFilters)}>
                      Clear filters
                    </Button>
                  )
                }
              />
            </Card>
          ) : (
            <div className="item-grid">
              {labourers.map((l) => (
                <LabourCard key={l.id} labourer={l} />
              ))}
            </div>
          ))}
      </Section>
    </Page>
  );
}

export default LabourMarketplace;
