import { useEffect, useState } from 'react';
import { IndianRupee, Briefcase, CircleCheck, Star, UserRound, CheckCircle2, Save, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getOwnLabourerProfile, updateOwnLabourerProfile } from '../services/labourerService';
import { friendlyError } from '../services/errors';
import Page, { Section } from '../components/Page';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import { ErrorState } from '../components/EmptyState';
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
          setError(friendlyError(err, 'Your profile'));
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
      setError(friendlyError(err, 'Your profile'));
    } finally {
      setSaving(false);
    }
  }

  const header = (
    <PageHeader
      eyebrow="Labour Connection"
      pillar="labour"
      title="My Profile"
      description="Keep your availability and rates current so farmers can find and hire you."
    />
  );

  if (status === 'loading') {
    return (
      <Page>
        {header}
        <LoadingState label="Loading your profile..." />
      </Page>
    );
  }

  if (status === 'error') {
    return (
      <Page>
        {header}
        <Card>
          <ErrorState title="Unable to load your profile" message={error} />
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      {header}

      <Section className="page-section--flush" title="How farmers see you">
        <div className="stat-grid">
          <StatCard icon={IndianRupee} label="Daily wage" value={dailyWage !== '' ? `₹${dailyWage}` : 'Not set'} />
          <StatCard icon={Briefcase} label="Experience" value={experienceYears !== '' ? `${experienceYears} yrs` : 'Not set'} />
          <StatCard icon={CircleCheck} label="Availability" value={availability ? 'Available' : 'Unavailable'} />
          <StatCard
            icon={Star}
            label="Rating"
            value={rating != null ? `★ ${rating.toFixed(1)}` : 'No ratings yet'}
            meta={rating != null ? `${ratingCount} reviews · not editable` : 'Shown to farmers'}
          />
        </div>
      </Section>

      <Section>
        <Card>
          <form className="form" onSubmit={handleSubmit}>
            <Card.Header>
              <Card.Title icon={UserRound}>Work details</Card.Title>
              <Card.Description>These details appear on your Labour Marketplace card.</Card.Description>
            </Card.Header>

            {success && (
              <div className="success-panel" role="status">
                <CheckCircle2 size={24} strokeWidth={2} aria-hidden="true" />
                <div>
                  <strong>{success}</strong>
                  <p>Farmers will see your updated details in the Labour Marketplace.</p>
                </div>
              </div>
            )}
            {error && <p className="form-error">{error}</p>}

            <fieldset className="form-field form-fieldset">
              <legend>Work types</legend>
              <div className="form-checkbox-group">
                {WORK_TYPES.map((type) => (
                  <label key={type} className={workTypes.includes(type) ? 'is-checked' : ''}>
                    <input type="checkbox" checked={workTypes.includes(type)} onChange={() => toggleWorkType(type)} />
                    {type}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="form-grid form-grid--2">
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
            </div>

            <label className="form-check form-check--card">
              <input type="checkbox" checked={availability} onChange={(e) => setAvailability(e.target.checked)} />
              <span>
                <strong>Currently available for work</strong>
                <span className="meta"> - farmers can filter by availability.</span>
              </span>
            </label>

            <div className="form-field">
              <label htmlFor="description">About you</label>
              <textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <fieldset className="form-field form-fieldset">
              <legend>Work history</legend>
              {workHistory.length === 0 && <p className="form-hint">No entries yet - add previous work to build trust with farmers.</p>}
              {workHistory.map((entry, i) => (
                <div key={i} className="history-row">
                  <input
                    aria-label={`Work history ${i + 1} description`}
                    placeholder="What work did you do?"
                    value={entry.description}
                    onChange={(e) => updateWorkHistoryEntry(i, 'description', e.target.value)}
                  />
                  <input
                    aria-label={`Work history ${i + 1} year`}
                    type="number"
                    placeholder="Year"
                    value={entry.year || ''}
                    onChange={(e) => updateWorkHistoryEntry(i, 'year', e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeWorkHistoryEntry(i)}
                    aria-label={`Remove work history ${i + 1}`}
                  >
                    <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              ))}
              <div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addWorkHistoryEntry}>
                  <Plus size={15} strokeWidth={2} aria-hidden="true" />
                  Add work history entry
                </button>
              </div>
            </fieldset>

            <div className="form-actions form-actions--bar">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} strokeWidth={2} aria-hidden="true" />
                {saving ? 'Saving...' : 'Save profile'}
              </button>
            </div>
          </form>
        </Card>
      </Section>
    </Page>
  );
}

export default LabourerProfilePage;
