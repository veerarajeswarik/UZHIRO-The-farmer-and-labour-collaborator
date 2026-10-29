import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, UserCircle, Tractor, GitCompare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getRecommendations } from '../services/cropService';
import { friendlyError } from '../services/errors';
import Page, { Section } from '../components/Page';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import CropCard from '../components/CropCard';
import SkeletonGrid from '../components/Skeleton';
import EmptyState, { ErrorState } from '../components/EmptyState';

const SEASONS = ['Kharif', 'Rabi', 'Zaid'];
const MAX_SELECTION = 3;

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
          setErrorMessage(friendlyError(err, 'Crop recommendations'));
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

  const header = (
    <PageHeader
      eyebrow="Farm Intelligence"
      pillar="farm"
      title="Crop Selection"
      description="Choose crops based on your farm conditions. Scores show how well each crop matches your farm - not a guarantee of success."
      actions={
        status === 'ready' && (
          <Button disabled={selected.length < 2} onClick={handleCompare} icon={GitCompare}>
            Compare selected ({selected.length}/{MAX_SELECTION})
          </Button>
        )
      }
    />
  );

  if (status === 'loading') {
    return (
      <Page>
        {header}
        <SkeletonGrid count={6} label="Loading crop recommendations for your farm..." />
      </Page>
    );
  }

  if (status === 'needs-profile') {
    return (
      <Page>
        {header}
        <Card>
          <EmptyState
            icon={UserCircle}
            title="Complete your farm profile first"
            description="We need your soil type and water availability to recommend crops that suit your farm."
            action={<Button to="/farmer/profile">Go to farm profile</Button>}
          />
        </Card>
      </Page>
    );
  }

  if (status === 'error') {
    return (
      <Page>
        {header}
        <Card>
          <ErrorState title="Unable to load crop recommendations" message={errorMessage} />
        </Card>
      </Page>
    );
  }

  const ctx = data.farmContext || {};

  return (
    <Page>
      {header}

      <Card className="context-card">
        <div className="context-card__label">
          <span className="icon-tile" aria-hidden="true">
            <Tractor size={20} strokeWidth={2} />
          </span>
          <div>
            <h2 className="card__title">Your farm</h2>
            <span className="meta">Recommendations are based on these conditions.</span>
          </div>
        </div>
        <dl className="context-card__facts">
          <div>
            <dt>Location</dt>
            <dd>{ctx.location || 'Not set'}</dd>
          </div>
          <div>
            <dt>Soil</dt>
            <dd>{ctx.soilType || 'Not set'}</dd>
          </div>
          <div>
            <dt>Water</dt>
            <dd>{ctx.waterAvailability || 'Not set'}</dd>
          </div>
          <div className="form-field context-card__season">
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
        </dl>
        <Button to="/farmer/profile" variant="ghost" size="sm">
          Edit farm profile
        </Button>
      </Card>

      <Section
        title="Recommended crops"
        description={`For the ${data.season} season. Tick up to ${MAX_SELECTION} crops to compare them side by side.`}
      >
        {data.recommendations.length === 0 ? (
          <Card>
            <EmptyState icon={Sprout} title="No recommendations" description="No crops found in the reference database yet." />
          </Card>
        ) : (
          <div className="item-grid">
            {data.recommendations.map(({ crop, score, level, explanation }) => (
              <CropCard
                key={crop._id}
                crop={crop}
                score={score}
                level={level}
                explanation={explanation}
                selected={selected.includes(crop._id)}
                selectDisabled={!selected.includes(crop._id) && selected.length >= MAX_SELECTION}
                onToggleSelect={() => toggleSelect(crop._id)}
              />
            ))}
          </div>
        )}
        <p className="form-hint page-disclaimer">{data.disclaimer}</p>
      </Section>
    </Page>
  );
}

export default CropSelection;
