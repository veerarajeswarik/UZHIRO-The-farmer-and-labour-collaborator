import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getRecommendations } from '../services/cropService';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

const SEASONS = ['Kharif', 'Rabi', 'Zaid'];
const MAX_SELECTION = 3;

function badgeClass(level) {
  if (level === 'High') return 'badge badge-high';
  if (level === 'Medium') return 'badge badge-medium';
  return 'badge badge-low';
}

function CropSelection() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // loading | ready | needs-profile | error
  const [errorMessage, setErrorMessage] = useState('');
  const [data, setData] = useState(null);
  const [season, setSeason] = useState('');
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    getRecommendations(token, season || undefined)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.message.toLowerCase().includes('farm profile')) {
          setStatus('needs-profile');
        } else {
          setErrorMessage(err.message);
          setStatus('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token, season]);

  function toggleSelect(cropId) {
    setSelected((prev) => {
      if (prev.includes(cropId)) return prev.filter((id) => id !== cropId);
      if (prev.length >= MAX_SELECTION) return prev;
      return [...prev, cropId];
    });
  }

  function handleCompare() {
    const params = new URLSearchParams({ ids: selected.join(',') });
    if (season) params.set('season', season);
    navigate(`/crops/compare?${params.toString()}`);
  }

  if (status === 'loading') {
    return <LoadingState label="Loading crop recommendations for your farm..." />;
  }

  if (status === 'needs-profile') {
    return (
      <div className="container" style={{ padding: '3rem 0' }}>
        <Card style={{ maxWidth: 520 }}>
          <h1>Complete your farm profile first</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 'var(--space-md) 0' }}>
            We need your soil type and water availability to recommend crops that suit your farm.
          </p>
          <Button to="/farmer/profile">Go to farm profile</Button>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container error-state">
        <p>Unable to load crop recommendations. {errorMessage} Please try again.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Crop Selection"
        title="Find the right crop for your farm"
        description={`Recommendations for the ${data.season} season, based on your farm profile. Scores show how well each crop matches your conditions - not a guarantee of success.`}
      />
      <div className="container" style={{ paddingBottom: '3rem' }}>

      <div className="crop-toolbar">
        <div className="form-field" style={{ maxWidth: 220 }}>
          <label htmlFor="season">Season</label>
          <select id="season" value={season} onChange={(e) => setSeason(e.target.value)}>
            <option value="">Current ({data.season})</option>
            {SEASONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          disabled={selected.length < 2}
          onClick={handleCompare}
        >
          Compare selected ({selected.length}/{MAX_SELECTION})
        </button>
      </div>

      {data.recommendations.length === 0 ? (
        <EmptyState icon={Sprout} title="No crops found" description="No crops found in the reference database yet." />
      ) : (
        <div className="crop-grid">
          {data.recommendations.map(({ crop, score, level, explanation }) => (
            <div key={crop._id} className={`card card-hover crop-card ${selected.includes(crop._id) ? 'is-selected' : ''}`}>
              <div className="crop-card__header">
                <span className="crop-card__name">{crop.name}</span>
                <span className={badgeClass(level)}>{level}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar__fill" style={{ width: `${score}%` }} />
              </div>
              <span className="crop-card__score">Suitability score: {score}/100</span>
              <p className="crop-card__explanation">{explanation}</p>
              <div className="crop-card__footer">
                <Link to={`/crops/${crop._id}`}>View details</Link>
                <label className="crop-card__select">
                  <input
                    type="checkbox"
                    checked={selected.includes(crop._id)}
                    disabled={!selected.includes(crop._id) && selected.length >= MAX_SELECTION}
                    onChange={() => toggleSelect(crop._id)}
                  />
                  Compare
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="form-hint" style={{ marginTop: 'var(--space-xl)' }}>
        {data.disclaimer}
      </p>
      </div>
    </div>
  );
}

export default CropSelection;
