import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { listAdminArticles, createAdminArticle, updateAdminArticle, deleteAdminArticle } from '../../services/adminService';

const CATEGORIES = [
  'Crop cultivation', 'Soil management', 'Water management', 'Pest management', 'Natural farming',
  'Organic farming', 'Seed selection', 'Harvesting', 'Storage', 'Market awareness',
];

const emptyForm = { title: '', category: CATEGORIES[0], summary: '', content: '' };

function AdminLearning() {
  const { token } = useAuth();
  const [status, setStatus] = useState('loading');
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  function load() {
    setStatus('loading');
    listAdminArticles(token)
      .then((d) => {
        setArticles(d.articles);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }

  useEffect(load, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(a) {
    setEditingId(a._id);
    setForm({ title: a.title, category: a.category, summary: a.summary, content: a.content });
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
    try {
      if (editingId) await updateAdminArticle(token, editingId, form);
      else await createAdminArticle(token, form);
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
      await deleteAdminArticle(token, id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <h2>Learning content</h2>

      <div className="card" style={{ maxWidth: 640, marginTop: 'var(--space-md)' }}>
        <h3>{editingId ? 'Edit article' : 'Add article'}</h3>
        <form className="form" style={{ maxWidth: '100%' }} onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Title</label>
            <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Summary (max 300 chars)</label>
            <textarea required rows={2} maxLength={300} value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Content</label>
            <textarea required rows={6} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
          </div>

          {saveError && <p className="form-error">{saveError}</p>}

          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add article'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {status === 'loading' && <p style={{ marginTop: 'var(--space-lg)' }}>Loading articles...</p>}
      {status === 'error' && <p className="form-error">Unable to load articles. {error}</p>}

      {status === 'ready' && (
        <div className="crop-grid" style={{ marginTop: 'var(--space-lg)' }}>
          {articles.map((a) => (
            <div className="card crop-card" key={a._id}>
              <span className="badge badge-medium">{a.category}</span>
              <span className="crop-card__name" style={{ marginTop: 'var(--space-sm)' }}>{a.title}</span>
              <p className="crop-card__explanation">{a.summary}</p>
              <div className="crop-card__footer">
                <button type="button" className="btn btn-secondary" onClick={() => startEdit(a)}>Edit</button>
                <button type="button" className="btn btn-secondary" onClick={() => handleDelete(a._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default AdminLearning;
