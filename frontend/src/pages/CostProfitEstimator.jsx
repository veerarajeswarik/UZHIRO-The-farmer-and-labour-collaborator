import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Wallet, TrendingUp, Landmark, Ruler, PiggyBank } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getCrops } from '../services/cropService';
import { getFarmerProfile } from '../services/farmerService';
import { estimateProfit } from '../services/profitService';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';

const COST_FIELDS = [
  { key: 'seedCostPerAcre', label: 'Seed cost (₹/acre)' },
  { key: 'fertilizerCostPerAcre', label: 'Fertilizer cost (₹/acre)' },
  { key: 'labourCostPerAcre', label: 'Labour cost (₹/acre)' },
  { key: 'irrigationCostPerAcre', label: 'Irrigation cost (₹/acre)' },
  { key: 'cropProtectionCostPerAcre', label: 'Crop protection cost (₹/acre)' },
  { key: 'otherCostPerAcre', label: 'Other cost (₹/acre)' },
  { key: 'yieldPerAcreKg', label: 'Expected yield (kg/acre)' },
  { key: 'sellingPricePerKg', label: 'Selling price (₹/kg)' },
];

function currency(n) {
  return `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function CostProfitEstimator() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [crops, setCrops] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [loadError, setLoadError] = useState('');

  const [cropId, setCropId] = useState(searchParams.get('cropId') || '');
  const [landAreaAcres, setLandAreaAcres] = useState('');
  const [fields, setFields] = useState({});
  const [edited, setEdited] = useState({});

  const [estimate, setEstimate] = useState(null);
  const [estimateError, setEstimateError] = useState('');
  const [calculating, setCalculating] = useState(false);

  const selectedCrop = useMemo(() => crops.find((c) => c._id === cropId), [crops, cropId]);

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

  // When a crop is selected (or crops finish loading), (re)populate example values.
  useEffect(() => {
    if (!selectedCrop?.economics) return;
    const next = {};
    COST_FIELDS.forEach(({ key }) => {
      next[key] = String(selectedCrop.economics[key]);
    });
    setFields(next);
    setEdited({});
    setEstimate(null);
    setEstimateError('');
  }, [selectedCrop]);

  function handleCropChange(e) {
    const id = e.target.value;
    setCropId(id);
    setSearchParams(id ? { cropId: id } : {});
  }

  function handleFieldChange(key, value) {
    setFields((f) => ({ ...f, [key]: value }));
    setEdited((e) => ({ ...e, [key]: true }));
  }

  function resetToExample() {
    if (!selectedCrop?.economics) return;
    const next = {};
    COST_FIELDS.forEach(({ key }) => {
      next[key] = String(selectedCrop.economics[key]);
    });
    setFields(next);
    setEdited({});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEstimateError('');
    setCalculating(true);

    const payload = { cropId, landAreaAcres: Number(landAreaAcres) };
    COST_FIELDS.forEach(({ key }) => {
      if (edited[key]) payload[key] = Number(fields[key]);
    });

    try {
      const data = await estimateProfit(token, payload);
      setEstimate(data);
    } catch (err) {
      setEstimateError(err.message);
      setEstimate(null);
    } finally {
      setCalculating(false);
    }
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
        eyebrow="Cost & Profit"
        title="Understand your farm's potential"
        description="Pick a crop to see an example cost and profit estimate for your land. Every pre-filled number is a prototype example - edit any field you know a real value for."
      />
      <div className="container" style={{ paddingBottom: '3rem' }}>

      <Card style={{ maxWidth: 640 }}>
        <form className="form" style={{ maxWidth: '100%' }} onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="crop">Crop</label>
            <select id="crop" value={cropId} onChange={handleCropChange} required>
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
              required
              value={landAreaAcres}
              onChange={(e) => setLandAreaAcres(e.target.value)}
            />
            <span className="form-hint">Defaults from your farm profile - adjust if needed.</span>
          </div>

          {selectedCrop && !selectedCrop.economics && (
            <p className="form-error">Cost and profit estimates are not yet available for this crop.</p>
          )}

          {selectedCrop?.economics && (
            <>
              <p className="form-hint">
                {selectedCrop.economics.note} Values below are pre-filled examples - edit any you have real
                figures for.
              </p>
              {COST_FIELDS.map(({ key, label }) => (
                <div className="form-field" key={key}>
                  <label htmlFor={key}>
                    {label} {!edited[key] && <span className="badge badge-medium">Example</span>}
                    {edited[key] && <span className="badge badge-high">Your value</span>}
                  </label>
                  <input
                    id={key}
                    type="number"
                    min="0"
                    step="0.01"
                    value={fields[key] ?? ''}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                  />
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={resetToExample}>
                Reset to example values
              </button>
            </>
          )}

          {estimateError && <p className="form-error">{estimateError}</p>}

          <button type="submit" className="btn btn-primary" disabled={!cropId || calculating}>
            {calculating ? 'Calculating...' : 'Calculate estimate'}
          </button>
        </form>
      </Card>

      {estimate && (
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <h2>
            Estimate for {estimate.crop.name} on {estimate.landAreaAcres} acre
            {estimate.landAreaAcres === 1 ? '' : 's'}
          </h2>

          <div className="grid-auto" style={{ marginTop: 'var(--space-md)' }}>
            <StatCard icon={Wallet} label="Total Cost" value={currency(estimate.result.totalCost)} />
            <StatCard icon={TrendingUp} label="Expected Revenue" value={currency(estimate.result.expectedRevenue)} />
            <StatCard
              icon={PiggyBank}
              label="Estimated Profit"
              value={<span style={{ color: 'var(--color-primary-700)' }}>{currency(estimate.result.estimatedProfit)}</span>}
            />
            <StatCard icon={Ruler} label="Cost per Acre" value={currency(estimate.result.costPerAcre)} />
            <StatCard icon={Landmark} label="Profit per Acre" value={currency(estimate.result.profitPerAcre)} />
            <StatCard
              icon={TrendingUp}
              label="Expected Yield"
              value={`${estimate.result.expectedYieldKg.toLocaleString('en-IN')} kg`}
              meta={`Revenue/acre: ${currency(estimate.result.revenuePerAcre)}`}
            />
          </div>

          <Card style={{ maxWidth: 640, marginTop: 'var(--space-lg)' }}>
            {estimate.fieldSources.sellingPricePerKg === 'market-price' && estimate.marketPrice && (
              <p className="form-hint">
                <span className="badge badge-high">Market price</span> Selling price used real market data from{' '}
                {estimate.marketPrice.market} ({new Date(estimate.marketPrice.date).toLocaleDateString('en-IN')}) -
                Source: {estimate.marketPrice.source}
                {estimate.marketPrice.stale ? ' (most recent price on file - live source unreachable just now)' : ''}
              </p>
            )}

            <p className="form-hint" style={{ marginTop: 'var(--space-md)' }}>
              {estimate.disclaimer}
            </p>

            <Button to={`/inputs?cropId=${estimate.crop.id}`} variant="secondary" size="sm" style={{ marginTop: 'var(--space-md)' }}>
              View input shopping list
            </Button>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
}

export default CostProfitEstimator;
