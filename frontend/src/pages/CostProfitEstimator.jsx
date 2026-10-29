import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  Landmark,
  PiggyBank,
  Sprout,
  Calculator,
  RotateCcw,
  Receipt,
  Wheat,
  Info,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getCrops } from '../services/cropService';
import { getFarmerProfile } from '../services/farmerService';
import { estimateProfit } from '../services/profitService';
import { friendlyError } from '../services/errors';
import Page, { Section } from '../components/Page';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import Badge from '../components/Badge';
import EmptyState, { ErrorState } from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

// Display-only labels for result.costBreakdownPerAcre (returned by the API).
const BREAKDOWN = [
  { key: 'seedCostPerAcre', label: 'Seed' },
  { key: 'fertilizerCostPerAcre', label: 'Fertilizer' },
  { key: 'labourCostPerAcre', label: 'Labour' },
  { key: 'irrigationCostPerAcre', label: 'Irrigation' },
  { key: 'cropProtectionCostPerAcre', label: 'Pesticides / crop protection' },
  { key: 'otherCostPerAcre', label: 'Other' },
];

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
          setLoadError(friendlyError(err, 'Crops'));
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
      setEstimateError(friendlyError(err, 'This crop'));
      setEstimate(null);
    } finally {
      setCalculating(false);
    }
  }

  const header = (
    <PageHeader
      eyebrow="Farm Intelligence"
      pillar="farm"
      title="Cost & Profit"
      description="Understand the economics of your selected crop - what it may cost, earn and leave as profit on your land."
    />
  );

  if (status === 'loading') {
    return (
      <Page>
        {header}
        <LoadingState label="Loading crops..." />
      </Page>
    );
  }

  if (status === 'error') {
    return (
      <Page>
        {header}
        <Card>
          <ErrorState title="Unable to load crops" message={loadError} />
        </Card>
      </Page>
    );
  }

  const r = estimate?.result;
  const breakdown = r ? BREAKDOWN.map((b) => ({ ...b, value: r.costBreakdownPerAcre[b.key] })) : [];

  return (
    <Page>
      {header}

      <Card>
        <form className="form" onSubmit={handleSubmit}>
          <Card.Header>
            <Card.Title icon={Sprout}>Crop and land</Card.Title>
            <Card.Description>
              Pick a crop to pre-fill example values. Edit any field you know a real value for.
            </Card.Description>
          </Card.Header>

          <div className="form-grid form-grid--2">
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
          </div>

          {selectedCrop && !selectedCrop.economics && (
            <p className="form-error">Cost and profit estimates are not yet available for this crop.</p>
          )}

          {selectedCrop?.economics && (
            <>
              <p className="notice">
                <Info size={16} strokeWidth={2} aria-hidden="true" />
                <span>
                  {selectedCrop.economics.note} Values below are pre-filled examples - edit any you have real figures for.
                </span>
              </p>
              <div className="form-grid">
                {COST_FIELDS.map(({ key, label }) => (
                  <div className="form-field" key={key}>
                    <label htmlFor={key} className="label-with-badge">
                      {label}
                      {edited[key] ? <Badge variant="success">Your value</Badge> : <Badge variant="warning">Example</Badge>}
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
              </div>
            </>
          )}

          {estimateError && <p className="form-error">{estimateError}</p>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg" disabled={!cropId || calculating}>
              <Calculator size={16} strokeWidth={2} aria-hidden="true" />
              {calculating ? 'Calculating...' : 'Calculate profit'}
            </button>
            {selectedCrop?.economics && (
              <button type="button" className="btn btn-ghost" onClick={resetToExample}>
                <RotateCcw size={16} strokeWidth={2} aria-hidden="true" />
                Reset to example values
              </button>
            )}
          </div>
        </form>
      </Card>

      {!estimate && (
        <Section title="Your estimate">
          <Card>
            <EmptyState
              icon={Calculator}
              title="No estimate yet"
              description="Choose a crop, check your land area, then select Calculate profit to see costs, revenue and profit."
            />
          </Card>
        </Section>
      )}

      {estimate && (
        <Section
          title={`Estimate for ${estimate.crop.name} on ${estimate.landAreaAcres} acre${estimate.landAreaAcres === 1 ? '' : 's'}`}
          description={estimate.usingExampleData ? 'Includes example values you did not override.' : 'Uses your own figures and/or real market pricing.'}
        >
          <div className="stat-grid">
            <StatCard icon={Wallet} label="Total cost" value={currency(r.totalCost)} meta={`${currency(r.costPerAcre)} per acre`} />
            <StatCard icon={TrendingUp} label="Expected revenue" value={currency(r.expectedRevenue)} meta={`${currency(r.revenuePerAcre)} per acre`} />
            <StatCard icon={PiggyBank} label="Estimated profit" value={currency(r.estimatedProfit)} className="stat-card--highlight" />
            <StatCard icon={Landmark} label="Profit per acre" value={currency(r.profitPerAcre)} />
          </div>

          <div className="two-col profit-details">
            <Card>
              <Card.Header>
                <Card.Title icon={Receipt}>Cost breakdown</Card.Title>
                <Card.Description>Per acre, as used in this estimate.</Card.Description>
              </Card.Header>
              <ul className="breakdown">
                {breakdown.map((b) => {
                  const share = r.costPerAcre > 0 ? Math.round((b.value / r.costPerAcre) * 100) : 0;
                  return (
                    <li key={b.key}>
                      <div className="breakdown__row">
                        <span>{b.label}</span>
                        <span className="breakdown__value">
                          {currency(b.value)}
                          <span className="meta"> · {share}%</span>
                        </span>
                      </div>
                      <div className="progress-bar" aria-hidden="true">
                        <div className="progress-bar__fill" style={{ width: `${share}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="breakdown__total">
                <span>Total cost per acre</span>
                <strong>{currency(r.costPerAcre)}</strong>
              </div>
            </Card>

            <div className="stack">
              <Card>
                <Card.Header>
                  <Card.Title icon={Wheat}>Revenue</Card.Title>
                </Card.Header>
                <dl className="detail-list detail-list--compact">
                  <div className="detail-list__row">
                    <dt>Expected yield</dt>
                    <dd>{r.expectedYieldKg.toLocaleString('en-IN')} kg</dd>
                  </div>
                  {estimate.inputs?.sellingPricePerKg != null && (
                    <div className="detail-list__row">
                      <dt>Selling price used</dt>
                      <dd>{currency(estimate.inputs.sellingPricePerKg)} / kg</dd>
                    </div>
                  )}
                  <div className="detail-list__row">
                    <dt>Revenue per acre</dt>
                    <dd>{currency(r.revenuePerAcre)}</dd>
                  </div>
                  <div className="detail-list__row">
                    <dt>Expected revenue</dt>
                    <dd>{currency(r.expectedRevenue)}</dd>
                  </div>
                </dl>
                {estimate.fieldSources.sellingPricePerKg === 'market-price' && estimate.marketPrice && (
                  <p className="form-hint profit-market">
                    <Badge variant="success">Market price</Badge> Selling price used real market data from{' '}
                    {estimate.marketPrice.market} ({new Date(estimate.marketPrice.date).toLocaleDateString('en-IN')}) - Source:{' '}
                    {estimate.marketPrice.source}
                    {estimate.marketPrice.stale ? ' (most recent price on file - live source unreachable just now)' : ''}
                  </p>
                )}
              </Card>

              <Card className="profit-card">
                <Card.Header>
                  <Card.Title icon={PiggyBank}>Estimated profit</Card.Title>
                </Card.Header>
                <p className="big-number">{currency(r.estimatedProfit)}</p>
                <p className="meta">
                  {currency(r.expectedRevenue)} revenue - {currency(r.totalCost)} cost · {currency(r.profitPerAcre)} per acre
                </p>
                <p className="form-hint">{estimate.disclaimer}</p>
                <Card.Footer>
                  <Button to={`/inputs?cropId=${estimate.crop.id}`} variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                    View input shopping list
                  </Button>
                </Card.Footer>
              </Card>
            </div>
          </div>
        </Section>
      )}
    </Page>
  );
}

export default CostProfitEstimator;
