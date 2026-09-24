import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getFarmerProfile, updateFarmerProfile } from '../services/farmerService';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
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
          setError(err.message);
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
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading') {
    return <LoadingState label="Loading your farm profile..." />;
  }

  if (status === 'error') {
    return (
      <div className="container" style={{ padding: '3rem 0' }}>
        <p className="form-error">Unable to load your farm profile. {error}</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Farm Profile"
        title="Your farm, at a glance"
        description="Keep this information current so crop recommendations and cost estimates stay accurate."
      />
      <div className="container" style={{ paddingBottom: '3rem' }}>
      <Card style={{ maxWidth: 620 }}>
        {personal && (
          <p className="form-hint" style={{ marginBottom: 'var(--space-lg)' }}>
            {personal.name} · {personal.phone} · {personal.email} · {personal.location}
          </p>
        )}

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <form className="form" onSubmit={handleSubmit} style={{ maxWidth: '100%' }}>
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
            <select
              id="waterAvailability"
              name="waterAvailability"
              value={form.waterAvailability}
              onChange={handleChange}
            >
              <option value="">Select water availability</option>
              {WATER_LEVELS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="previousCrops">Previous crops (comma separated)</label>
            <input
              id="previousCrops"
              name="previousCrops"
              placeholder="e.g. Groundnut, Maize"
              value={form.previousCrops}
              onChange={handleChange}
            />
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

          <div className="form-field">
            <label htmlFor="farmingPreferences">Farming preferences</label>
            <textarea
              id="farmingPreferences"
              name="farmingPreferences"
              rows={3}
              value={form.farmingPreferences}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save farm profile'}
          </button>
        </form>
      </Card>
      </div>
    </>
  );
}

export default FarmerProfilePage;
