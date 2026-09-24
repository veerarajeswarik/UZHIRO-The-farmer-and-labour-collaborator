import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
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
            "url(https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80)",
        }}
      >
        <div className="auth-page__art-content">
          <span className="eyebrow eyebrow-on-dark" style={{ marginBottom: 'var(--space-md)', width: 'fit-content' }}>
            Smart Agriculture. Better Decisions.
          </span>
          <h2>Pick up right where you left off on your farm.</h2>
          <p>Crop recommendations, cost estimates and farm tasks - all in one place.</p>
        </div>
      </div>

      <div className="auth-page__form">
        <div className="auth-card">
          <h1>Log in</h1>
          <p className="auth-card__lede">Welcome back to UZHIRO.</p>

          {error && <p className="form-error" style={{ marginBottom: 'var(--space-md)' }}>{error}</p>}

          <form className="form" onSubmit={handleSubmit} style={{ maxWidth: '100%' }}>
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
                required
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="form-hint" style={{ marginTop: 'var(--space-lg)' }}>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
