import { useEffect, useState } from 'react';
import LoadingState from '../../components/LoadingState';
import { ErrorState } from '../../components/EmptyState';
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

      <div className="card admin-form-card">
        <h3>{editingId ? 'Edit article' : 'Add article'}</h3>
        <form className="form" onSubmit={handleSubmit}>
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

          <div className="form-actions">
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

      {status === 'loading' && <LoadingState label="Loading articles..." />}
      {status === 'error' && <ErrorState title="Unable to load articles" message={error} />}

      {status === 'ready' && (
        <div className="item-grid admin-list">
          {articles.map((a) => (
            <div className="card item-card" key={a._id}>
              <span className="chip">{a.category}</span>
              <span className="item-card__title">{a.title}</span>
              <p className="item-card__body clamp-3">{a.summary}</p>
              <div className="item-card__footer">
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
