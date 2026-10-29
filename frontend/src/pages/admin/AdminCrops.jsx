import { useEffect, useState } from 'react';
import LoadingState from '../../components/LoadingState';
import { ErrorState } from '../../components/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { listAdminCrops, createAdminCrop, updateAdminCrop, deleteAdminCrop } from '../../services/adminService';

const SOIL_TYPES = ['Red Soil', 'Black Soil', 'Alluvial Soil', 'Sandy Soil', 'Clay Soil', 'Other'];
const WATER_LEVELS = ['Low', 'Moderate', 'High'];
const SEASONS = ['Kharif', 'Rabi', 'Zaid', 'Year-round'];

const emptyForm = {
  name: '',
  description: '',
  suitableSoils: [],
  waterRequirement: 'Moderate',
  suitableSeasons: [],
  cultivationDurationDays: '',
  seedRequirementPerAcreKg: '',
  advantages: '',
  considerations: '',
};

function toggleInArray(arr, value) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

function AdminCrops() {
  const { token } = useAuth();
  const [status, setStatus] = useState('loading');
  const [crops, setCrops] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  function load() {
    setStatus('loading');
    listAdminCrops(token)
      .then((d) => {
        setCrops(d.crops);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }

  useEffect(load, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(crop) {
    setEditingId(crop._id);
    setForm({
      name: crop.name,
      description: crop.description,
      suitableSoils: crop.suitableSoils,
      waterRequirement: crop.waterRequirement,
      suitableSeasons: crop.suitableSeasons,
      cultivationDurationDays: String(crop.cultivationDurationDays),
      seedRequirementPerAcreKg: String(crop.seedRequirementPerAcreKg),
      advantages: crop.advantages.join(', '),
      considerations: crop.considerations.join(', '),
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setSaveError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError('');
    setSaving(true);

    const payload = {
      name: form.name,
      description: form.description,
      suitableSoils: form.suitableSoils,
      waterRequirement: form.waterRequirement,
      suitableSeasons: form.suitableSeasons,
      cultivationDurationDays: Number(form.cultivationDurationDays),
      seedRequirementPerAcreKg: Number(form.seedRequirementPerAcreKg),
      advantages: form.advantages.split(',').map((s) => s.trim()).filter(Boolean),
      considerations: form.considerations.split(',').map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (editingId) await updateAdminCrop(token, editingId, payload);
      else await createAdminCrop(token, payload);
      resetForm();
      load();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteAdminCrop(token, id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>

      <div className="card admin-form-card">
        <h3>{editingId ? 'Edit crop' : 'Add crop'}</h3>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Name</label>
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea required rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Suitable soils</label>
            <div className="form-checkbox-group">
              {SOIL_TYPES.map((s) => (
                <label key={s}>
                  <input type="checkbox" checked={form.suitableSoils.includes(s)} onChange={() => setForm((f) => ({ ...f, suitableSoils: toggleInArray(f.suitableSoils, s) }))} />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <div className="form-field">
            <label>Water requirement</label>
            <select value={form.waterRequirement} onChange={(e) => setForm((f) => ({ ...f, waterRequirement: e.target.value }))}>
              {WATER_LEVELS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Suitable seasons</label>
            <div className="form-checkbox-group">
              {SEASONS.map((s) => (
                <label key={s}>
                  <input type="checkbox" checked={form.suitableSeasons.includes(s)} onChange={() => setForm((f) => ({ ...f, suitableSeasons: toggleInArray(f.suitableSeasons, s) }))} />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <div className="form-field">
            <label>Cultivation duration (days)</label>
            <input type="number" min="1" required value={form.cultivationDurationDays} onChange={(e) => setForm((f) => ({ ...f, cultivationDurationDays: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Seed requirement (kg/acre)</label>
            <input type="number" min="0" required value={form.seedRequirementPerAcreKg} onChange={(e) => setForm((f) => ({ ...f, seedRequirementPerAcreKg: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Advantages (comma separated)</label>
            <input value={form.advantages} onChange={(e) => setForm((f) => ({ ...f, advantages: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Considerations (comma separated)</label>
            <input value={form.considerations} onChange={(e) => setForm((f) => ({ ...f, considerations: e.target.value }))} />
          </div>

          {saveError && <p className="form-error">{saveError}</p>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add crop'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
        <p className="form-hint">
          Economics (costs, yield, selling price) and cultivation stages can be added via the API directly for now -
          this form covers the core fields needed for crop selection to work.
        </p>
      </div>

      {status === 'loading' && <LoadingState label="Loading crops..." />}
      {status === 'error' && <ErrorState title="Unable to load crops" message={error} />}

      {status === 'ready' && (
        <div className="item-grid admin-list">
          {crops.map((c) => (
            <div className="card item-card" key={c._id}>
              <span className="item-card__title">{c.name}</span>
              <p className="meta">{c.suitableSoils.join(', ')} · {c.waterRequirement} water</p>
              <p className="item-card__body clamp-3">{c.description}</p>
              <div className="item-card__footer">
                <button type="button" className="btn btn-secondary" onClick={() => startEdit(c)}>
                  Edit
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => handleDelete(c._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default AdminCrops;
