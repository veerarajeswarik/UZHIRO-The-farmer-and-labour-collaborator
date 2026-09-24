import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getOwnLabourerProfile, updateOwnLabourerProfile } from '../services/labourerService';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import LoadingState from '../components/LoadingState';

const WORK_TYPES = ['Harvesting', 'Planting', 'Weeding', 'Irrigation', 'Ploughing', 'General Farm Work'];

function LabourerProfilePage() {
  const { token } = useAuth();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [workTypes, setWorkTypes] = useState([]);
  const [experienceYears, setExperienceYears] = useState('');
  const [dailyWage, setDailyWage] = useState('');
  const [availability, setAvailability] = useState(true);
  const [description, setDescription] = useState('');
  const [workHistory, setWorkHistory] = useState([]);
  const [rating, setRating] = useState(null);
  const [ratingCount, setRatingCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getOwnLabourerProfile(token)
      .then((d) => {
        if (cancelled) return;
        const p = d.profile;
        setWorkTypes(p.workTypes);
        setExperienceYears(String(p.experienceYears));
        setDailyWage(String(p.dailyWage));
        setAvailability(p.availability);
        setDescription(p.description || '');
        setWorkHistory(p.workHistory || []);
        setRating(p.rating);
        setRatingCount(p.ratingCount);
        setStatus('ready');
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setStatus('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  function toggleWorkType(type) {
    setWorkTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  }

  function addWorkHistoryEntry() {
    setWorkHistory((prev) => [...prev, { description: '', year: new Date().getFullYear() }]);
  }

  function updateWorkHistoryEntry(index, field, value) {
    setWorkHistory((prev) => prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)));
  }

  function removeWorkHistoryEntry(index) {
    setWorkHistory((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await updateOwnLabourerProfile(token, {
        workTypes,
        experienceYears: Number(experienceYears),
        dailyWage: Number(dailyWage),
        availability,
        description,
        workHistory: workHistory
          .filter((h) => h.description?.trim())
          .map((h) => ({ description: h.description, year: h.year ? Number(h.year) : undefined })),
      });
      setSuccess('Profile saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading') {
    return <LoadingState label="Loading your profile..." />;
  }

  if (status === 'error') {
    return (
      <div className="container error-state">
        <p>Unable to load your profile. {error}</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="My Profile"
        title="Your labourer profile"
        description="Keep your availability and rates current so farmers can find and hire you."
      />
      <div className="container" style={{ paddingBottom: '3rem' }}>
      <Card style={{ maxWidth: 620 }}>
        <p className="form-hint">
          Rating: {rating != null ? `★ ${rating.toFixed(1)} (${ratingCount} reviews)` : 'No ratings yet'} - shown to
          farmers, not editable here.
        </p>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <form className="form" style={{ maxWidth: '100%', marginTop: 'var(--space-md)' }} onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Work types</label>
            <div className="form-checkbox-group">
              {WORK_TYPES.map((type) => (
                <label key={type}>
                  <input type="checkbox" checked={workTypes.includes(type)} onChange={() => toggleWorkType(type)} />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="experienceYears">Experience (years)</label>
            <input
              id="experienceYears"
              type="number"
              min="0"
              step="0.5"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="dailyWage">Daily wage (₹)</label>
            <input id="dailyWage" type="number" min="0" value={dailyWage} onChange={(e) => setDailyWage(e.target.value)} />
          </div>

          <div className="form-field">
            <label>
              <input
                type="checkbox"
                checked={availability}
                onChange={(e) => setAvailability(e.target.checked)}
                style={{ marginRight: 'var(--space-xs)' }}
              />
              Currently available for work
            </label>
          </div>

          <div className="form-field">
            <label htmlFor="description">Description</label>
            <textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="form-field">
            <label>Work history</label>
            {workHistory.map((entry, i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
                <input
                  placeholder="Description"
                  value={entry.description}
                  onChange={(e) => updateWorkHistoryEntry(i, 'description', e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  placeholder="Year"
                  value={entry.year || ''}
                  onChange={(e) => updateWorkHistoryEntry(i, 'year', e.target.value)}
                  style={{ width: 90 }}
                />
                <button type="button" className="btn btn-secondary" onClick={() => removeWorkHistoryEntry(i)}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={addWorkHistoryEntry} style={{ marginTop: 'var(--space-xs)' }}>
              Add work history entry
            </button>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </Card>
      </div>
    </>
  );
}

export default LabourerProfilePage;
