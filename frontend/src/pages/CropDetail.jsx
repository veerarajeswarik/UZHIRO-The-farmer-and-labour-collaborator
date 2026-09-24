import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getCropById, explainCrop } from '../services/cropService';
import { getMarketPrice } from '../services/marketPriceService';
import LoadingState from '../components/LoadingState';

function currency(n) {
  return `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function CropDetail() {
  const { id } = useParams();
  const { isAuthenticated, user, token } = useAuth();
  const [status, setStatus] = useState('loading');
  const [crop, setCrop] = useState(null);
  const [error, setError] = useState('');
  const [marketPrice, setMarketPrice] = useState(null);

  const [explainStatus, setExplainStatus] = useState('idle'); // idle | loading | ready | error
  const [explainData, setExplainData] = useState(null);
  const [explainError, setExplainError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    getCropById(id)
      .then((d) => {
        if (!cancelled) {
          setCrop(d.crop);
          setStatus('ready');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setStatus('error');
        }
      });
    getMarketPrice(id)
      .then((d) => {
        if (!cancelled) setMarketPrice(d);
      })
      .catch(() => {
        if (!cancelled) setMarketPrice(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleExplain() {
    setExplainStatus('loading');
    setExplainError('');
    try {
      const data = await explainCrop(token, id);
      setExplainData(data);
      setExplainStatus('ready');
    } catch (err) {
      setExplainError(err.message);
      setExplainStatus('error');
    }
  }

  if (status === 'loading') {
    return <LoadingState label="Loading crop details..." />;
  }

  if (status === 'error') {
    return (
      <div className="container error-state">
        <p>Unable to load this crop. {error}</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <Link to="/crops" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
        <ArrowLeft size={16} strokeWidth={2} /> Back to crop selection
      </Link>

      <h1 style={{ marginTop: 'var(--space-md)' }}>{crop.name}</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>{crop.description}</p>

      {crop.economics && (
        <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <Link to={`/profit?cropId=${crop._id}`} className="btn btn-primary">
            Estimate cost &amp; profit for this crop
          </Link>
          <Link to={`/inputs?cropId=${crop._id}`} className="btn btn-secondary">
            View input shopping list
          </Link>
        </div>
      )}

      {marketPrice && (
        <div className="card" style={{ marginTop: 'var(--space-lg)', maxWidth: 480 }}>
          <h2>Market price</h2>
          {marketPrice.available ? (
            <>
              <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginTop: 'var(--space-sm)' }}>
                {currency(marketPrice.modalPrice)} {marketPrice.unit}
              </p>
              <p className="form-hint">
                {marketPrice.market}
                {marketPrice.location ? ` (${marketPrice.location})` : ''} · Range {currency(marketPrice.minPrice)}
                {' - '}
                {currency(marketPrice.maxPrice)}
              </p>
              <p className="form-hint">{marketPrice.updatedLabel}</p>
              <p className="form-hint">Source: {marketPrice.source}</p>
              {marketPrice.stale && <p className="form-error">{marketPrice.staleNote}</p>}
            </>
          ) : (
            <>
              <p className="form-hint">{marketPrice.message}</p>
              {marketPrice.fallback && (
                <p className="form-hint">
                  Example estimate: {currency(marketPrice.fallback.price)} {marketPrice.fallback.unit} -{' '}
                  {marketPrice.fallback.label}
                </p>
              )}
            </>
          )}
        </div>
      )}

      <div className="crop-grid" style={{ marginTop: 'var(--space-xl)' }}>
        <div className="card">
          <h2>At a glance</h2>
          <ul>
            <li>Suitable soils: {crop.suitableSoils.join(', ')}</li>
            <li>Water requirement: {crop.waterRequirement}</li>
            <li>Suitable seasons: {crop.suitableSeasons.join(', ')}</li>
            <li>Cultivation duration: ~{crop.cultivationDurationDays} days</li>
            <li>Seed requirement: {crop.seedRequirementPerAcreKg} kg/acre</li>
          </ul>
        </div>

        <div className="card">
          <h2>Advantages</h2>
          <ul>
            {crop.advantages.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Things to consider</h2>
          <ul>
            {crop.considerations.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Common pests</h2>
          <ul>
            {crop.commonPests.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
        <h2>Cultivation stages</h2>
        <ol>
          {crop.cultivationStages.map((s) => (
            <li key={s.stage} style={{ marginTop: 'var(--space-xs)' }}>
              <strong>{s.stage}:</strong> {s.description}
            </li>
          ))}
        </ol>
      </div>

      {isAuthenticated && user.role === 'farmer' && (
        <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
          <h2>Why this crop may suit your farm</h2>

          {explainStatus === 'idle' && (
            <>
              <p className="form-hint">
                Get an AI-generated explanation of this crop's suitability score for your farm, grounded in your
                farm profile and this crop's real data.
              </p>
              <button type="button" className="btn btn-secondary" onClick={handleExplain} style={{ marginTop: 'var(--space-sm)' }}>
                Explain this crop for my farm
              </button>
            </>
          )}

          {explainStatus === 'loading' && <p className="form-hint">Generating explanation...</p>}

          {explainStatus === 'error' && <p className="form-error">Unable to generate an explanation. {explainError}</p>}

          {explainStatus === 'ready' && explainData && (
            <>
              <p style={{ fontWeight: 700, marginTop: 'var(--space-sm)' }}>
                Suitability: {explainData.score}/100 ({explainData.level}) - {explainData.season} season
              </p>
              <p className="form-hint">{explainData.explanation}</p>

              {explainData.aiExplanation.available ? (
                <>
                  <span className="badge badge-high" style={{ marginTop: 'var(--space-md)', display: 'inline-block' }}>
                    AI-generated
                  </span>
                  <p style={{ marginTop: 'var(--space-sm)' }}>{explainData.aiExplanation.whySuited}</p>

                  <h3 style={{ marginTop: 'var(--space-md)' }}>Advantages</h3>
                  <ul>
                    {explainData.aiExplanation.advantages.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>

                  <h3 style={{ marginTop: 'var(--space-md)' }}>Things to consider</h3>
                  <ul>
                    {explainData.aiExplanation.considerations.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>

                  <h3 style={{ marginTop: 'var(--space-md)' }}>How to prepare</h3>
                  <ol>
                    {explainData.aiExplanation.howToPrepare.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </>
              ) : (
                <p className="form-hint" style={{ marginTop: 'var(--space-sm)' }}>
                  AI explanation is not available right now - the suitability score and explanation above are
                  still fully valid on their own (see "Advantages" and "Things to consider" earlier on this page).
                </p>
              )}

              <p className="form-hint" style={{ marginTop: 'var(--space-md)' }}>
                {explainData.disclaimer}
              </p>
            </>
          )}
        </div>
      )}

      <p className="form-hint" style={{ marginTop: 'var(--space-lg)' }}>
        Source: {crop.source} Last updated: {new Date(crop.lastUpdated).toLocaleDateString()}.
      </p>
    </div>
  );
}

export default CropDetail;
