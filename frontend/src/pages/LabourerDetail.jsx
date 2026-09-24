import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getLabourerById } from '../services/labourerService';
import { createHiringRequest } from '../services/hiringService';
import LoadingState from '../components/LoadingState';

function LabourerDetail() {
  const { id } = useParams();
  const { token } = useAuth();

  const [status, setStatus] = useState('loading');
  const [labourer, setLabourer] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ workDate: '', numberOfDays: 1, farmLocation: '', message: '' });
  const [workType, setWorkType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getLabourerById(id)
      .then((d) => {
        if (cancelled) return;
        setLabourer(d.labourer);
        setWorkType(d.labourer.workTypes[0] || '');
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      await createHiringRequest(token, {
        labourerId: labourer.userId,
        workType,
        workDate: form.workDate,
        numberOfDays: Number(form.numberOfDays),
        farmLocation: form.farmLocation,
        message: form.message || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (status === 'loading') {
    return <LoadingState label="Loading labourer profile..." />;
  }

  if (status === 'error') {
    return (
      <div className="container error-state">
        <p>Unable to load this labourer. {error}</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <Link to="/labourers" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
        <ArrowLeft size={16} strokeWidth={2} /> Back to labour marketplace
      </Link>

      <h1 style={{ marginTop: 'var(--space-md)' }}>{labourer.name}</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>{labourer.location}</p>

      <div className="crop-grid" style={{ marginTop: 'var(--space-lg)' }}>
        <div className="card">
          <h2>At a glance</h2>
          <ul>
            <li>Work types: {labourer.workTypes.join(', ')}</li>
            <li>Experience: {labourer.experienceYears} years</li>
            <li>Daily wage: ₹{labourer.dailyWage}</li>
            <li>Availability: {labourer.availability ? 'Available now' : 'Not currently available'}</li>
            <li>
              Rating:{' '}
              {labourer.rating != null ? `★ ${labourer.rating.toFixed(1)} (${labourer.ratingCount} reviews)` : 'No ratings yet'}
              {labourer.isDemoData ? ' (demo data)' : ''}
            </li>
          </ul>
          {labourer.description && <p style={{ marginTop: 'var(--space-sm)' }}>{labourer.description}</p>}
        </div>

        {labourer.workHistory?.length > 0 && (
          <div className="card">
            <h2>Work history</h2>
            <ul>
              {labourer.workHistory.map((h, i) => (
                <li key={i}>
                  {h.description} {h.year ? `(${h.year})` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="card" style={{ maxWidth: 480, marginTop: 'var(--space-lg)' }}>
        <h2>Send hiring request</h2>

        {submitted ? (
          <>
            <p className="form-success" style={{ marginTop: 'var(--space-md)' }}>
              Request sent. Track its status in My Hiring Requests.
            </p>
            <Link to="/hiring" className="btn btn-primary" style={{ marginTop: 'var(--space-sm)' }}>
              View my hiring requests
            </Link>
          </>
        ) : (
          <form className="form" style={{ maxWidth: '100%', marginTop: 'var(--space-md)' }} onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="workType">Work type</label>
              <select id="workType" value={workType} onChange={(e) => setWorkType(e.target.value)} required>
                {labourer.workTypes.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="workDate">Work start date</label>
              <input id="workDate" name="workDate" type="date" required value={form.workDate} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="numberOfDays">Number of days</label>
              <input
                id="numberOfDays"
                name="numberOfDays"
                type="number"
                min="1"
                required
                value={form.numberOfDays}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="farmLocation">Farm location</label>
              <input id="farmLocation" name="farmLocation" required value={form.farmLocation} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="message">Message (optional)</label>
              <textarea id="message" name="message" rows={3} value={form.message} onChange={handleChange} />
            </div>

            {submitError && <p className="form-error">{submitError}</p>}

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send hiring request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LabourerDetail;
