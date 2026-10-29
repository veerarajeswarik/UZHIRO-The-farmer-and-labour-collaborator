import { useEffect, useState } from 'react';
import LoadingState from '../../components/LoadingState';
import { ErrorState } from '../../components/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { listAdminMarketPrices, createAdminMarketPrice, deleteAdminMarketPrice } from '../../services/adminService';

const emptyForm = { cropName: '', market: '', modalPrice: '', minPrice: '', maxPrice: '', date: '' };

function AdminMarketPrices() {
  const { token } = useAuth();
  const [status, setStatus] = useState('loading');
  const [prices, setPrices] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  function load() {
    setStatus('loading');
    listAdminMarketPrices(token)
      .then((d) => {
        setPrices(d.prices);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }

  useEffect(load, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError('');
    setSaving(true);
    try {
      await createAdminMarketPrice(token, {
        cropName: form.cropName,
        market: form.market,
        modalPrice: Number(form.modalPrice),
        minPrice: form.minPrice ? Number(form.minPrice) : undefined,
        maxPrice: form.maxPrice ? Number(form.maxPrice) : undefined,
        date: form.date,
      });
      setForm(emptyForm);
      load();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteAdminMarketPrice(token, id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <p className="form-hint">
        Automatically fetched Agmarknet prices (Phase F) are cached here too. Manual entries you add are clearly
        labeled "Manually entered by admin" wherever they're shown to farmers - never presented as live data.
      </p>

      <div className="card admin-form-card">
        <h3>Add a manual price record</h3>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Crop name (must match a crop in the catalog)</label>
            <input required value={form.cropName} onChange={(e) => setForm((f) => ({ ...f, cropName: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Market / mandi name</label>
            <input required value={form.market} onChange={(e) => setForm((f) => ({ ...f, market: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Modal price (₹/quintal)</label>
            <input type="number" min="0" required value={form.modalPrice} onChange={(e) => setForm((f) => ({ ...f, modalPrice: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Min price (optional)</label>
            <input type="number" min="0" value={form.minPrice} onChange={(e) => setForm((f) => ({ ...f, minPrice: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Max price (optional)</label>
            <input type="number" min="0" value={form.maxPrice} onChange={(e) => setForm((f) => ({ ...f, maxPrice: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Price date</label>
            <input type="date" required value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </div>

          {saveError && <p className="form-error">{saveError}</p>}

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Add record'}
          </button>
        </form>
      </div>

      {status === 'loading' && <LoadingState label="Loading market prices..." />}
      {status === 'error' && <ErrorState title="Unable to load market prices" message={error} />}

      {status === 'ready' && (
        <div className="table-wrap admin-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Market</th>
                <th>Modal price</th>
                <th>Date</th>
                <th>Source</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((p) => (
                <tr key={p._id}>
                  <td>{p.cropName}</td>
                  <td>{p.market}</td>
                  <td>₹{p.modalPrice}</td>
                  <td>{new Date(p.date).toLocaleDateString('en-IN')}</td>
                  <td>{p.source}</td>
                  <td>
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

export default AdminMarketPrices;
