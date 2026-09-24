import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getCrops } from '../services/cropService';
import { getFarmerProfile } from '../services/farmerService';
import { getInputChecklist } from '../services/productService';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import LoadingState from '../components/LoadingState';

function currency(n) {
  return `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function InputChecklist() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [crops, setCrops] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [loadError, setLoadError] = useState('');

  const [cropId, setCropId] = useState(searchParams.get('cropId') || '');
  const [landAreaAcres, setLandAreaAcres] = useState('');

  const [checklist, setChecklist] = useState(null);
  const [checklistStatus, setChecklistStatus] = useState('idle'); // idle | loading | ready | error
  const [checklistError, setChecklistError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCrops(), getFarmerProfile(token).catch(() => null)])
      .then(([cropsData, profileData]) => {
        if (cancelled) return;
        setCrops(cropsData.crops);
        if (profileData?.profile?.landAreaAcres) {
          setLandAreaAcres(String(profileData.profile.landAreaAcres));
        }
        setStatus('ready');
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err.message);
          setStatus('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!cropId || !landAreaAcres) return;
    let cancelled = false;
    setChecklistStatus('loading');
    setChecklistError('');
    getInputChecklist(token, cropId, landAreaAcres)
      .then((data) => {
        if (cancelled) return;
        setChecklist(data);
        setChecklistStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setChecklistError(err.message);
        setChecklistStatus('error');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropId, landAreaAcres, token]);

  function handleCropChange(e) {
    const id = e.target.value;
    setCropId(id);
    setSearchParams(id ? { cropId: id } : {});
  }

  if (status === 'loading') {
    return <LoadingState label="Loading crops..." />;
  }

  if (status === 'error') {
    return (
      <div className="container error-state">
        <p>Unable to load crops. {loadError}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Buy Inputs"
        title="Input shopping list"
        description="See what seeds, fertilizer and crop protection you'll likely need, with real purchase links where available."
      />
      <div className="container" style={{ paddingBottom: '3rem' }}>

      <Card style={{ maxWidth: 480 }}>
        <div className="form" style={{ maxWidth: '100%' }}>
          <div className="form-field">
            <label htmlFor="crop">Crop</label>
            <select id="crop" value={cropId} onChange={handleCropChange}>
              <option value="">Select a crop</option>
              {crops.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="landAreaAcres">Land area (acres)</label>
            <input
              id="landAreaAcres"
              type="number"
              min="0.1"
              step="0.1"
              value={landAreaAcres}
              onChange={(e) => setLandAreaAcres(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {checklistStatus === 'loading' && <p style={{ marginTop: 'var(--space-lg)' }}>Calculating your shopping list...</p>}

      {checklistStatus === 'error' && (
        <p className="form-error" style={{ marginTop: 'var(--space-lg)', maxWidth: 480 }}>
          {checklistError}
        </p>
      )}

      {checklistStatus === 'ready' && checklist && (
        <div style={{ marginTop: 'var(--space-lg)' }}>
          <h2>
            {checklist.crop.name} - {checklist.landAreaAcres} acre{checklist.landAreaAcres === 1 ? '' : 's'}
          </h2>

          <div className="crop-grid" style={{ marginTop: 'var(--space-md)' }}>
            {checklist.checklist.map((item) => (
              <div className="card card-hover" key={item.category}>
                <div className="crop-card__header">
                  <span className="crop-card__name">{item.category}</span>
                  <span className={item.required ? 'badge badge-medium' : 'badge badge-low'}>
                    {item.required ? 'Required' : 'Optional'}
                  </span>
                </div>
                <p className="crop-card__score">{item.quantityLabel}</p>
                <p style={{ fontWeight: 700 }}>
                  Estimated cost: {item.estimatedCost != null ? currency(item.estimatedCost) : 'Not available'}
                </p>

                {item.options.length === 0 ? (
                  <p className="form-hint">Purchase link unavailable for this input.</p>
                ) : (
                  item.options.map((opt) => (
                    <div key={opt.id} style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                      <p style={{ fontWeight: 600 }}>{opt.name}</p>
                      <p className="form-hint">
                        {currency(opt.estimatedPrice)} {opt.unit}
                        {opt.seller ? ` - ${opt.seller}` : ''}
                      </p>
                      {opt.purchaseStatus === 'available' ? (
                        <a
                          href={opt.purchaseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ marginTop: 'var(--space-xs)' }}
                        >
                          View / Buy
                        </a>
                      ) : (
                        <p className="form-hint" style={{ fontStyle: 'italic' }}>
                          Purchase link unavailable
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>

          <p className="form-hint" style={{ marginTop: 'var(--space-xl)' }}>
            {checklist.disclaimer}
          </p>
        </div>
      )}
      </div>
    </div>
  );
}

export default InputChecklist;
