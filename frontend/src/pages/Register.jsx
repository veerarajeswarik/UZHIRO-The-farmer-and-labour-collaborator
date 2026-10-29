import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { friendlyError } from '../services/errors';

const WORK_TYPES = ['Harvesting', 'Planting', 'Weeding', 'Irrigation', 'Ploughing', 'General Farm Work'];

const initialForm = {
  role: 'farmer',
  name: '',
  phone: '',
  email: '',
  password: '',
  location: '',
  workTypes: [],
  experienceYears: '',
  dailyWage: '',
  availability: true,
};

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function setRole(role) {
    setForm((f) => ({ ...f, role }));
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  function toggleWorkType(type) {
    setForm((f) => ({
      ...f,
      workTypes: f.workTypes.includes(type) ? f.workTypes.filter((t) => t !== type) : [...f.workTypes, type],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      role: form.role,
      name: form.name,
      phone: form.phone,
      email: form.email,
      password: form.password,
      location: form.location,
    };

    if (form.role === 'labourer') {
      payload.workTypes = form.workTypes;
      payload.experienceYears = Number(form.experienceYears);
      payload.dailyWage = Number(form.dailyWage);
      payload.availability = form.availability;
    }

    try {
      await register(payload);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(friendlyError(err, 'Registration'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div
        className="auth-page__art"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=80)",
        }}
      >
        <div className="auth-page__art-content">
          <span className="eyebrow eyebrow-on-dark" style={{ marginBottom: 'var(--space-md)', width: 'fit-content' }}>
            Smart Agriculture. Better Decisions.
          </span>
          <h2>Join a growing community of data-driven farmers.</h2>
          <p>Get crop guidance, cost estimates, labour connections and more - free to start.</p>
        </div>
      </div>

      <div className="auth-page__form">
        <div className="auth-card">
        <h1>Create your account</h1>
        <p className="auth-card__lede">Set up your UZHIRO profile in a couple of minutes.</p>

        <div className="form-role-toggle" style={{ marginBottom: 'var(--space-lg)' }}>
          <button type="button" aria-pressed={form.role === 'farmer'} onClick={() => setRole('farmer')}>
            I'm a Farmer
          </button>
          <button type="button" aria-pressed={form.role === 'labourer'} onClick={() => setRole('labourer')}>
            I'm a Labourer
          </button>
        </div>

        {error && <p className="form-error">{error}</p>}

        <form className="form" onSubmit={handleSubmit} style={{ maxWidth: '100%' }}>
          <div className="form-field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" required value={form.name} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label htmlFor="phone">Phone number</label>
            <input id="phone" name="phone" required value={form.phone} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={6}
              required
              value={form.password}
              onChange={handleChange}
            />
            <span className="form-hint">At least 6 characters.</span>
          </div>

          <div className="form-field">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" required value={form.location} onChange={handleChange} />
          </div>

          {form.role === 'labourer' && (
            <>
              <div className="form-field">
                <label>Work types</label>
                <div className="form-checkbox-group">
                  {WORK_TYPES.map((type) => (
                    <label key={type}>
                      <input
                        type="checkbox"
                        checked={form.workTypes.includes(type)}
                        onChange={() => toggleWorkType(type)}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="experienceYears">Experience (years)</label>
                <input
                  id="experienceYears"
                  name="experienceYears"
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={form.experienceYears}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label htmlFor="dailyWage">Daily wage (₹)</label>
                <input
                  id="dailyWage"
                  name="dailyWage"
                  type="number"
                  min="0"
                  required
                  value={form.dailyWage}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label>
                  <input
                    type="checkbox"
                    name="availability"
                    checked={form.availability}
                    onChange={handleChange}
                    style={{ marginRight: 'var(--space-xs)' }}
                  />
                  Currently available for work
                </label>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="form-hint" style={{ marginTop: 'var(--space-lg)' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
