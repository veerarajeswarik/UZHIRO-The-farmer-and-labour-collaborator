import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { listAdminSchemes, createAdminScheme, updateAdminScheme, deleteAdminScheme } from '../../services/adminService';

const emptyForm = {
  name: '', category: '', description: '', eligibility: '', benefits: '', applicationInfo: '', officialSourceUrl: '', sourceName: '',
};

function AdminSchemes() {
  const { token } = useAuth();
  const [status, setStatus] = useState('loading');
  const [schemes, setSchemes] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  function load() {
    setStatus('loading');
    listAdminSchemes(token)
      .then((d) => {
        setSchemes(d.schemes);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }

  useEffect(load, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(s) {
    setEditingId(s._id);
    setForm({
      name: s.name,
      category: s.category || '',
      description: s.description,
      eligibility: s.eligibility.join('\n'),
      benefits: s.benefits.join('\n'),
      applicationInfo: s.applicationInfo,
      officialSourceUrl: s.officialSourceUrl,
      sourceName: s.sourceName,
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
      category: form.category || undefined,
      description: form.description,
      eligibility: form.eligibility.split('\n').map((s) => s.trim()).filter(Boolean),
      benefits: form.benefits.split('\n').map((s) => s.trim()).filter(Boolean),
      applicationInfo: form.applicationInfo,
      officialSourceUrl: form.officialSourceUrl,
      sourceName: form.sourceName,
    };
    try {
      if (editingId) await updateAdminScheme(token, editingId, payload);
      else await createAdminScheme(token, payload);
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
      await deleteAdminScheme(token, id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <h2>Government schemes</h2>
      <p className="form-hint">
        Only add real schemes with a verified official source URL. Never invent eligibility or benefit details.
      </p>

      <div className="card" style={{ maxWidth: 640, marginTop: 'var(--space-md)' }}>
        <h3>{editingId ? 'Edit scheme' : 'Add scheme'}</h3>
        <form className="form" style={{ maxWidth: '100%' }} onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Name</label>
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Category (optional)</label>
            <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea required rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Eligibility (one point per line)</label>
            <textarea required rows={3} value={form.eligibility} onChange={(e) => setForm((f) => ({ ...f, eligibility: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Benefits (one point per line)</label>
            <textarea required rows={3} value={form.benefits} onChange={(e) => setForm((f) => ({ ...f, benefits: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>How to apply</label>
            <textarea required rows={2} value={form.applicationInfo} onChange={(e) => setForm((f) => ({ ...f, applicationInfo: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Official source URL</label>
            <input type="url" required value={form.officialSourceUrl} onChange={(e) => setForm((f) => ({ ...f, officialSourceUrl: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Source name</label>
            <input required value={form.sourceName} onChange={(e) => setForm((f) => ({ ...f, sourceName: e.target.value }))} />
          </div>

          {saveError && <p className="form-error">{saveError}</p>}

          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add scheme'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {status === 'loading' && <p style={{ marginTop: 'var(--space-lg)' }}>Loading schemes...</p>}
      {status === 'error' && <p className="form-error">Unable to load schemes. {error}</p>}

      {status === 'ready' && (
        <div className="crop-grid" style={{ marginTop: 'var(--space-lg)' }}>
          {schemes.map((s) => (
            <div className="card crop-card" key={s._id}>
              <span className="crop-card__name">{s.name}</span>
              <p className="crop-card__explanation">{s.description}</p>
              <div className="crop-card__footer">
                <button type="button" className="btn btn-secondary" onClick={() => startEdit(s)}>Edit</button>
                <button type="button" className="btn btn-secondary" onClick={() => handleDelete(s._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default AdminSchemes;
