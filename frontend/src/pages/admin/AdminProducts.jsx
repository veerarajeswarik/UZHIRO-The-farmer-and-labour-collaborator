import { useEffect, useState } from 'react';
import LoadingState from '../../components/LoadingState';
import { ErrorState } from '../../components/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { getCrops } from '../../services/cropService';
import { listAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct } from '../../services/adminService';

const CATEGORIES = ['Seeds', 'Fertilizers', 'Organic Manure', 'Pesticides', 'Farming Tools'];

const emptyForm = { name: '', category: 'Seeds', cropId: '', unit: '', estimatedPrice: '', seller: '', purchaseUrl: '' };

function AdminProducts() {
  const { token } = useAuth();
  const [status, setStatus] = useState('loading');
  const [products, setProducts] = useState([]);
  const [crops, setCrops] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  function load() {
    setStatus('loading');
    listAdminProducts(token)
      .then((d) => {
        setProducts(d.products);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }

  useEffect(() => {
    getCrops().then((d) => setCrops(d.crops)).catch(() => setCrops([]));
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function startEdit(p) {
    setEditingId(p._id);
    setForm({
      name: p.name,
      category: p.category,
      cropId: p.crop?._id || '',
      unit: p.unit,
      estimatedPrice: String(p.estimatedPrice),
      seller: p.seller || '',
      purchaseUrl: p.purchaseUrl || '',
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
      category: form.category,
      crop: form.cropId || null,
      unit: form.unit,
      estimatedPrice: Number(form.estimatedPrice),
      seller: form.seller || null,
      purchaseUrl: form.purchaseUrl || null,
    };
    try {
      if (editingId) await updateAdminProduct(token, editingId, payload);
      else await createAdminProduct(token, payload);
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
      await deleteAdminProduct(token, id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>

      <div className="card admin-form-card">
        <h3>{editingId ? 'Edit product' : 'Add product'}</h3>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Name</label>
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {form.category === 'Seeds' && (
            <div className="form-field">
              <label>Crop (for seed products)</label>
              <select value={form.cropId} onChange={(e) => setForm((f) => ({ ...f, cropId: e.target.value }))}>
                <option value="">None</option>
                {crops.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-field">
            <label>Unit (e.g. "per kg")</label>
            <input required value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Estimated price (₹)</label>
            <input type="number" min="0" required value={form.estimatedPrice} onChange={(e) => setForm((f) => ({ ...f, estimatedPrice: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Seller (optional)</label>
            <input value={form.seller} onChange={(e) => setForm((f) => ({ ...f, seller: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Purchase URL (optional - leave blank if none verified; never invent one)</label>
            <input type="url" value={form.purchaseUrl} onChange={(e) => setForm((f) => ({ ...f, purchaseUrl: e.target.value }))} />
          </div>

          {saveError && <p className="form-error">{saveError}</p>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add product'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {status === 'loading' && <LoadingState label="Loading products..." />}
      {status === 'error' && <ErrorState title="Unable to load products" message={error} />}

      {status === 'ready' && (
        <div className="table-wrap admin-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Crop</th>
                <th>Price</th>
                <th>Purchase link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.crop?.name || '-'}</td>
                  <td>₹{p.estimatedPrice} {p.unit}</td>
                  <td>{p.purchaseUrl ? 'Available' : 'Unavailable'}</td>
                  <td className="table-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => startEdit(p)}>Edit</button>
                    <button type="button" className="btn btn-secondary" onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default AdminProducts;
