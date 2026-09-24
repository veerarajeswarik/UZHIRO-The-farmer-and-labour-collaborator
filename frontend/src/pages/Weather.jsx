import { useEffect, useState } from 'react';
import { Droplets, CloudRain, Wind } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getWeather } from '../services/weatherService';
import PageHero from '../components/PageHero';
import Card from '../components/Card';
import LoadingState from '../components/LoadingState';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1600&q=80';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function Weather() {
  const { token, user } = useAuth();
  const [locationInput, setLocationInput] = useState('');
  const [activeLocation, setActiveLocation] = useState('');
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  function load(location) {
    setStatus('loading');
    setError('');
    getWeather(token, location || undefined)
      .then((d) => {
        setData(d);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function handleSubmit(e) {
    e.preventDefault();
    setActiveLocation(locationInput);
    load(locationInput);
  }

  return (
    <div>
      <PageHero
        compact
        image={HERO_IMAGE}
        eyebrow="Weather"
        title={`Conditions for ${activeLocation || user.location}`}
        description="Insights are general guidance, not a guarantee - always check local conditions before making farming decisions."
        floating={
          status === 'ready' && data ? (
            <div className="glass-card">
              <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {data.location.name}
                {data.location.admin1 ? `, ${data.location.admin1}` : ''}
              </div>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginTop: '0.25rem' }}>
                {Math.round(data.current.temperatureC)}°C
              </div>
              <div style={{ marginTop: '0.15rem' }}>{data.current.description}</div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: 'var(--space-md)', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Droplets size={14} /> {data.current.humidityPct}%
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CloudRain size={14} /> {data.current.rainMm} mm
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Wind size={14} /> {Math.round(data.current.windKph)} km/h
                </span>
              </div>
            </div>
          ) : null
        }
      />

      <div className="container" style={{ paddingBottom: '3rem', paddingTop: 'var(--space-xl)' }}>

      <form className="form" style={{ maxWidth: 400, flexDirection: 'row', alignItems: 'flex-end', gap: 'var(--space-sm)' }} onSubmit={handleSubmit}>
        <div className="form-field" style={{ flex: 1 }}>
          <label htmlFor="location">Check another location</label>
          <input id="location" placeholder={user.location} value={locationInput} onChange={(e) => setLocationInput(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-secondary">
          Check
        </button>
      </form>

      {status === 'loading' && <LoadingState label="Loading live weather..." />}

      {status === 'error' && (
        <p className="form-error" style={{ marginTop: 'var(--space-lg)', maxWidth: 480 }}>
          Unable to load weather. {error}
        </p>
      )}

      {status === 'ready' && data && (
        <div style={{ marginTop: 'var(--space-lg)' }}>
          <p className="form-hint">
            As of {new Date(data.current.observedAt).toLocaleString('en-IN')} · Source: {data.source}
          </p>

          {data.alerts.length > 0 && (
            <Card style={{ maxWidth: 640, marginTop: 'var(--space-lg)', borderColor: 'var(--color-warning)' }}>
              <h2>Weather alerts</h2>
              <ul style={{ marginTop: 'var(--space-sm)' }}>
                {data.alerts.map((a, i) => (
                  <li key={i} className={a.level === 'warning' ? 'form-error' : 'form-hint'} style={{ marginTop: 'var(--space-xs)' }}>
                    {a.message}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card style={{ maxWidth: 640, marginTop: 'var(--space-lg)' }}>
            <h2>Farming insights</h2>
            <ul style={{ marginTop: 'var(--space-sm)' }}>
              {data.insights.map((insight, i) => (
                <li key={i} style={{ marginTop: 'var(--space-xs)' }}>
                  {insight}
                </li>
              ))}
            </ul>
          </Card>

          <h2 style={{ marginTop: 'var(--space-xl)' }}>5-day forecast</h2>
          <div className="crop-grid" style={{ marginTop: 'var(--space-md)' }}>
            {data.forecast.map((day) => (
              <div className="card card-hover" key={day.date}>
                <p style={{ fontWeight: 700 }}>{formatDate(day.date)}</p>
                <p>{day.description}</p>
                <p>
                  {Math.round(day.tempMinC)}°C - {Math.round(day.tempMaxC)}°C
                </p>
                <p className="form-hint">
                  Rain chance {day.precipitationProbabilityPct}% ({day.precipitationSumMm} mm) · Wind up to{' '}
                  {Math.round(day.windMaxKph)} km/h
                </p>
              </div>
            ))}
          </div>

          <p className="form-hint" style={{ marginTop: 'var(--space-xl)' }}>
            Fetched {new Date(data.fetchedAt).toLocaleString('en-IN')} · Source: {data.source}
          </p>
        </div>
      )}
      </div>
    </div>
  );
}

export default Weather;
