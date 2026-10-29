import { useEffect, useState } from 'react';
import { MapPin, Ruler, Mountain, Droplets, UserRound, Tractor, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getFarmerProfile, updateFarmerProfile } from '../services/farmerService';
import { friendlyError } from '../services/errors';
import Page, { Section } from '../components/Page';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import { ErrorState } from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

const SOIL_TYPES = ['Red Soil', 'Black Soil', 'Alluvial Soil', 'Sandy Soil', 'Clay Soil', 'Other'];
const WATER_LEVELS = ['Low', 'Moderate', 'High'];

const emptyForm = {
  farmName: '',
  landAreaAcres: '',
  soilType: '',
  waterAvailability: '',
  farmingExperienceYears: '',
  farmingPreferences: '',
  previousCrops: '',
};

function FarmerProfilePage() {
  const { token } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [personal, setPersonal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getFarmerProfile(token);
        if (cancelled) return;
        setPersonal(data.personal);
        setForm({
          farmName: data.profile.farmName || '',
          landAreaAcres: data.profile.landAreaAcres ?? '',
          soilType: data.profile.soilType || '',
          waterAvailability: data.profile.waterAvailability || '',
          farmingExperienceYears: data.profile.farmingExperienceYears ?? '',
          farmingPreferences: data.profile.farmingPreferences || '',
          previousCrops: (data.profile.previousCrops || []).join(', '),
        });
        setStatus('ready');
      } catch (err) {
        if (!cancelled) {
          setError(friendlyError(err, 'Your farm profile'));
          setStatus('error');
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const payload = {
      farmName: form.farmName || undefined,
      landAreaAcres: form.landAreaAcres === '' ? undefined : Number(form.landAreaAcres),
      soilType: form.soilType || undefined,
      waterAvailability: form.waterAvailability || undefined,
      farmingExperienceYears: form.farmingExperienceYears === '' ? undefined : Number(form.farmingExperienceYears),
      farmingPreferences: form.farmingPreferences || undefined,
      previousCrops: form.previousCrops
        ? form.previousCrops.split(',').map((c) => c.trim()).filter(Boolean)
        : undefined,
    };

    try {
      await updateFarmerProfile(token, payload);
      setSuccess('Farm profile saved.');
    } catch (err) {
      setError(friendlyError(err, 'Your farm profile'));
    } finally {
      setSaving(false);
    }
  }

  const header = (
    <PageHeader
      eyebrow="Farm Intelligence"
      pillar="farm"
      title="Farm Profile"
      description="Keep your farm details current so crop recommendations and cost estimates stay accurate."
    />
  );

  if (status === 'loading') {
    return (
      <Page>
        {header}
        <LoadingState label="Loading your farm profile..." />
      </Page>
    );
  }

  if (status === 'error') {
    return (
      <Page>
        {header}
        <Card>
          <ErrorState title="Unable to load your farm profile" message={error} />
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      {header}

      <Section className="page-section--flush" title="Farm overview">
        <div className="stat-grid">
          <StatCard icon={MapPin} label="Location" value={personal?.location || 'Not set'} meta={form.farmName || undefined} />
          <StatCard icon={Ruler} label="Land area" value={form.landAreaAcres !== '' ? `${form.landAreaAcres} acres` : 'Not set'} />
          <StatCard icon={Mountain} label="Soil type" value={form.soilType || 'Not set'} />
          <StatCard icon={Droplets} label="Water availability" value={form.waterAvailability || 'Not set'} />
        </div>
      </Section>

      <Section>
        <div className="profile-layout">
          {personal && (
            <Card className="profile-layout__side">
              <Card.Header>
                <Card.Title icon={UserRound}>Personal details</Card.Title>
                <Card.Description>From your account.</Card.Description>
              </Card.Header>
              <dl className="detail-list">
                <div className="detail-list__row">
                  <dt>Name</dt>
                  <dd>{personal.name}</dd>
                </div>
                <div className="detail-list__row">
                  <dt>Phone</dt>
                  <dd>{personal.phone}</dd>
                </div>
                <div className="detail-list__row">
                  <dt>Email</dt>
                  <dd className="break-anywhere">{personal.email}</dd>
                </div>
                <div className="detail-list__row">
                  <dt>Location</dt>
                  <dd>{personal.location}</dd>
                </div>
              </dl>
            </Card>
          )}

          <Card>
            <form className="form" onSubmit={handleSubmit}>
              <Card.Header>
                <Card.Title icon={Tractor}>Farm details</Card.Title>
                <Card.Description>Soil type and water availability are needed for crop recommendations.</Card.Description>
              </Card.Header>

              {success && (
                <div className="success-panel" role="status">
                  <CheckCircle2 size={24} strokeWidth={2} aria-hidden="true" />
                  <div>
                    <strong>{success}</strong>
                    <p>Your crop recommendations and estimates now use these details.</p>
                  </div>
                  <Button to="/crops" size="sm" variant="secondary">
                    See crop recommendations
                  </Button>
                </div>
              )}
              {error && <p className="form-error">{error}</p>}

              <div className="form-grid form-grid--2">
                <div className="form-field">
                  <label htmlFor="farmName">Farm name</label>
                  <input id="farmName" name="farmName" value={form.farmName} onChange={handleChange} />
                </div>

                <div className="form-field">
                  <label htmlFor="landAreaAcres">Land area (acres)</label>
                  <input
                    id="landAreaAcres"
                    name="landAreaAcres"
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.landAreaAcres}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="soilType">Soil type</label>
                  <select id="soilType" name="soilType" value={form.soilType} onChange={handleChange}>
                    <option value="">Select soil type</option>
                    {SOIL_TYPES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="waterAvailability">Water availability</label>
                  <select id="waterAvailability" name="waterAvailability" value={form.waterAvailability} onChange={handleChange}>
                    <option value="">Select water availability</option>
                    {WATER_LEVELS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="previousCrops">Previous crops</label>
                  <input
                    id="previousCrops"
                    name="previousCrops"
                    placeholder="e.g. Groundnut, Maize"
                    value={form.previousCrops}
                    onChange={handleChange}
                  />
                  <span className="form-hint">Separate crops with commas.</span>
                </div>

                <div className="form-field">
                  <label htmlFor="farmingExperienceYears">Farming experience (years)</label>
                  <input
                    id="farmingExperienceYears"
                    name="farmingExperienceYears"
                    type="number"
                    min="0"
                    value={form.farmingExperienceYears}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="farmingPreferences">Farming preferences</label>
                  <textarea
                    id="farmingPreferences"
                    name="farmingPreferences"
                    rows={3}
                    value={form.farmingPreferences}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-actions form-actions--bar">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Save size={16} strokeWidth={2} aria-hidden="true" />
                  {saving ? 'Saving...' : 'Save farm profile'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </Section>
    </Page>
  );
}

export default FarmerProfilePage;
