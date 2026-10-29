import { useEffect, useState } from 'react';
import { Droplets, CloudRain, Wind, Thermometer, AlertTriangle, Lightbulb, MapPin, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getWeather } from '../services/weatherService';
import { friendlyError } from '../services/errors';
import Page, { Section } from '../components/Page';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import { ErrorState } from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80';

function formatDay(dateStr) {
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
        setError(friendlyError(err, 'Weather for this location'));
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
    <Page>
      <PageHeader
        eyebrow="Tools"
        pillar="neutral"
        title="Weather"
        description={`Conditions and a 5-day forecast for ${activeLocation || user.location}. Insights are general guidance - always check local conditions.`}
        actions={
          <form className="inline-search" onSubmit={handleSubmit} role="search">
            <label htmlFor="location" className="visually-hidden">
              Check another location
            </label>
            <input id="location" placeholder="Check another location" value={locationInput} onChange={(e) => setLocationInput(e.target.value)} />
            <button type="submit" className="btn btn-secondary">
              <Search size={16} strokeWidth={2} aria-hidden="true" />
              Check
            </button>
          </form>
        }
      />

      {status === 'loading' && <LoadingState label="Loading live weather..." />}

      {status === 'error' && (
        <Card>
          <ErrorState title="Unable to load weather" message={error} />
        </Card>
      )}

      {status === 'ready' && data && (
        <>
          <div className="weather-now">
            <Card className="weather-now__card">
              <span className="weather-now__place">
                <MapPin size={15} strokeWidth={2} aria-hidden="true" />
                {data.location.name}
                {data.location.admin1 ? `, ${data.location.admin1}` : ''}
              </span>
              <div className="weather-now__temp">
                <Thermometer size={28} strokeWidth={2} aria-hidden="true" />
                {Math.round(data.current.temperatureC)}°C
              </div>
              <p className="weather-now__desc">{data.current.description}</p>
              <dl className="weather-now__facts">
                <div>
                  <dt>
                    <Droplets size={15} strokeWidth={2} aria-hidden="true" /> Humidity
                  </dt>
                  <dd>{data.current.humidityPct}%</dd>
                </div>
                <div>
                  <dt>
                    <Wind size={15} strokeWidth={2} aria-hidden="true" /> Wind
                  </dt>
                  <dd>{Math.round(data.current.windKph)} km/h</dd>
                </div>
                <div>
                  <dt>
                    <CloudRain size={15} strokeWidth={2} aria-hidden="true" /> Rain
                  </dt>
                  <dd>{data.current.rainMm} mm</dd>
                </div>
              </dl>
              <p className="meta">
                As of {new Date(data.current.observedAt).toLocaleString('en-IN')} · Source: {data.source}
              </p>
            </Card>
            <div className="weather-now__image" style={{ backgroundImage: `url(${HERO_IMAGE})` }} role="presentation" />
          </div>

          {data.alerts.length > 0 && (
            <Section title="Weather alerts">
              <Card className="card--warning">
                <ul className="check-list check-list--warn">
                  {data.alerts.map((a, i) => (
                    <li key={i} className={a.level === 'warning' ? 'alert-strong' : ''}>
                      {a.level === 'warning' && <AlertTriangle size={14} strokeWidth={2} aria-hidden="true" />} {a.message}
                    </li>
                  ))}
                </ul>
              </Card>
            </Section>
          )}

          <Section title="Farming insights">
            <Card>
              <Card.Header>
                <Card.Title icon={Lightbulb}>What this weather means for your farm</Card.Title>
              </Card.Header>
              <ul className="check-list">
                {data.insights.map((insight, i) => (
                  <li key={i}>{insight}</li>
                ))}
              </ul>
            </Card>
          </Section>

          <Section title="5-day forecast">
            <div className="forecast-grid">
              {data.forecast.map((day) => (
                <Card className="forecast-day" key={day.date}>
                  <span className="forecast-day__date">{formatDay(day.date)}</span>
                  <span className="forecast-day__desc">{day.description}</span>
                  <span className="forecast-day__temp">
                    <strong>{Math.round(day.tempMaxC)}°</strong> / {Math.round(day.tempMinC)}°C
                  </span>
                  <span className="meta">
                    <CloudRain size={13} strokeWidth={2} aria-hidden="true" /> {day.precipitationProbabilityPct}% · {day.precipitationSumMm} mm
                  </span>
                  <span className="meta">
                    <Wind size={13} strokeWidth={2} aria-hidden="true" /> up to {Math.round(day.windMaxKph)} km/h
                  </span>
                </Card>
              ))}
            </div>
            <p className="form-hint page-disclaimer">
              Fetched {new Date(data.fetchedAt).toLocaleString('en-IN')} · Source: {data.source}
            </p>
          </Section>
        </>
      )}
    </Page>
  );
}

export default Weather;
