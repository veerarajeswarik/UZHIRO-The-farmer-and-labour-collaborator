import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Calculator,
  ShoppingCart,
  Mountain,
  Droplets,
  CalendarDays,
  Sun,
  Sparkles,
  ThumbsUp,
  AlertTriangle,
  Bug,
  ListOrdered,
  Wallet,
  LineChart,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getCropById, explainCrop } from '../services/cropService';
import { getMarketPrice } from '../services/marketPriceService';
import { friendlyError } from '../services/errors';
import Page, { Section } from '../components/Page';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import Badge, { StatusBadge } from '../components/Badge';
import { ErrorState } from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

const ECON_ROWS = [
  ['seedCostPerAcre', 'Seed'],
  ['fertilizerCostPerAcre', 'Fertilizer'],
  ['labourCostPerAcre', 'Labour'],
  ['irrigationCostPerAcre', 'Irrigation'],
  ['cropProtectionCostPerAcre', 'Pesticides / crop protection'],
  ['otherCostPerAcre', 'Other'],
];

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
          setError(friendlyError(err, 'This crop'));
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
      setExplainError(friendlyError(err, 'This explanation'));
      setExplainStatus('error');
    }
  }

  const isFarmer = isAuthenticated && user.role === 'farmer';
  const back = isFarmer ? { to: '/crops', label: 'Back to Crop Selection' } : undefined;

  if (status === 'loading') {
    return (
      <Page>
        <PageHeader back={back} eyebrow="Farm Intelligence" pillar="farm" title="Loading crop..." />
        <LoadingState label="Loading crop details..." />
      </Page>
    );
  }

  if (status === 'error') {
    return (
      <Page>
        <PageHeader back={back} eyebrow="Farm Intelligence" pillar="farm" title="Crop details" />
        <Card>
          <ErrorState title="Unable to load this crop" message={error} />
        </Card>
      </Page>
    );
  }

  const e = crop.economics;

  return (
    <Page>
      <PageHeader
        back={back}
        eyebrow="Farm Intelligence · Crop details"
        pillar="farm"
        title={crop.name}
        description={crop.description}
        actions={
          e && (
            <>
              <Button to={`/profit?cropId=${crop._id}`} icon={Calculator}>
                Estimate cost &amp; profit
              </Button>
              <Button to={`/inputs?cropId=${crop._id}`} variant="secondary" icon={ShoppingCart}>
                Input shopping list
              </Button>
            </>
          )
        }
      />

      <div className="stat-grid">
        <StatCard icon={Mountain} label="Suitable soils" value={crop.suitableSoils.join(', ')} />
        <StatCard icon={Droplets} label="Water requirement" value={crop.waterRequirement} />
        <StatCard icon={CalendarDays} label="Growing duration" value={`~${crop.cultivationDurationDays} days`} />
        <StatCard icon={Sun} label="Seasons" value={crop.suitableSeasons.join(', ')} meta={`Seed: ${crop.seedRequirementPerAcreKg} kg/acre`} />
      </div>

      {isFarmer && (
        <Section title="Why it may suit your farm">
          <Card>
            {explainStatus === 'idle' && (
              <div className="cta-row">
                <p className="item-card__body">
                  Get an explanation of this crop&apos;s suitability score for your farm, grounded in your farm profile and
                  this crop&apos;s data.
                </p>
                <Button variant="secondary" icon={Sparkles} onClick={handleExplain}>
                  Explain this crop for my farm
                </Button>
              </div>
            )}

            {explainStatus === 'loading' && <LoadingState label="Generating explanation..." />}

            {explainStatus === 'error' && (
              <ErrorState
                title="Unable to generate an explanation"
                message={explainError}
                action={
                  <Button variant="secondary" size="sm" onClick={handleExplain}>
                    Try again
                  </Button>
                }
              />
            )}

            {explainStatus === 'ready' && explainData && (
              <div className="stack">
                <div className="explain-score">
                  <StatusBadge status={explainData.level} label={`${explainData.level} suitability`} />
                  <strong>{explainData.score}/100</strong>
                  <span className="meta">{explainData.season} season</span>
                </div>
                <p className="prose">{explainData.explanation}</p>

                {explainData.aiExplanation.available ? (
                  <>
                    <div>
                      <Badge variant="info">AI-generated</Badge>
                      <p className="prose explain-why">{explainData.aiExplanation.whySuited}</p>
                    </div>
                    <div className="two-col">
                      <div>
                        <h3 className="list-heading">Advantages</h3>
                        <ul className="check-list">
                          {explainData.aiExplanation.advantages.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="list-heading">Things to consider</h3>
                        <ul className="check-list check-list--warn">
                          {explainData.aiExplanation.considerations.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h3 className="list-heading">How to prepare</h3>
                      <ol className="step-list">
                        {explainData.aiExplanation.howToPrepare.map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ol>
                    </div>
                  </>
                ) : (
                  <p className="meta">
                    AI explanation is not available right now - the suitability score and explanation above are still
                    fully valid on their own (see Advantages and Things to consider below).
                  </p>
                )}
                <p className="form-hint">{explainData.disclaimer}</p>
              </div>
            )}
          </Card>
        </Section>
      )}

      <Section title="Growing this crop">
        <div className="two-col">
          <Card>
            <Card.Header>
              <Card.Title icon={ThumbsUp}>Advantages</Card.Title>
            </Card.Header>
            <ul className="check-list">
              {crop.advantages.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <Card.Header>
              <Card.Title icon={AlertTriangle}>Things to consider</Card.Title>
            </Card.Header>
            <ul className="check-list check-list--warn">
              {crop.considerations.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <Card.Header>
              <Card.Title icon={Bug}>Common pests</Card.Title>
            </Card.Header>
            <div className="chip-row">
              {crop.commonPests.map((pst) => (
                <span className="chip" key={pst}>
                  {pst}
                </span>
              ))}
            </div>
          </Card>
          <Card>
            <Card.Header>
              <Card.Title icon={ListOrdered}>Cultivation stages</Card.Title>
            </Card.Header>
            <ol className="step-list">
              {crop.cultivationStages.map((st) => (
                <li key={st.stage}>
                  <strong>{st.stage}:</strong> {st.description}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </Section>

      {(e || marketPrice) && (
        <Section title="Economics">
          <div className="two-col">
            {e && (
              <Card>
                <Card.Header actions={<Badge variant="warning">Example</Badge>}>
                  <Card.Title icon={Wallet}>Example economics per acre</Card.Title>
                  <Card.Description>
                    {e.note || 'Prototype example figures - use the Cost & Profit estimator with your own values.'}
                  </Card.Description>
                </Card.Header>
                <dl className="detail-list detail-list--compact">
                  {ECON_ROWS.map(([key, label]) => (
                    <div className="detail-list__row" key={key}>
                      <dt>{label}</dt>
                      <dd>{currency(e[key])}</dd>
                    </div>
                  ))}
                  <div className="detail-list__row">
                    <dt>Expected yield</dt>
                    <dd>{Number(e.yieldPerAcreKg).toLocaleString('en-IN')} kg / acre</dd>
                  </div>
                  <div className="detail-list__row">
                    <dt>Selling price</dt>
                    <dd>{currency(e.sellingPricePerKg)} / kg</dd>
                  </div>
                </dl>
                <Card.Footer>
                  <Button to={`/profit?cropId=${crop._id}`} size="sm" icon={ArrowRight} iconPosition="right">
                    Calculate for my land
                  </Button>
                </Card.Footer>
              </Card>
            )}

            {marketPrice && (
              <Card>
                <Card.Header>
                  <Card.Title icon={LineChart}>Market price</Card.Title>
                </Card.Header>
                {marketPrice.available ? (
                  <>
                    <p className="big-number">
                      {currency(marketPrice.modalPrice)} <span className="meta">{marketPrice.unit}</span>
                    </p>
                    <p className="meta">
                      {marketPrice.market}
                      {marketPrice.location ? ` (${marketPrice.location})` : ''} · Range {currency(marketPrice.minPrice)} -{' '}
                      {currency(marketPrice.maxPrice)}
                    </p>
                    <p className="meta">{marketPrice.updatedLabel}</p>
                    <p className="meta">Source: {marketPrice.source}</p>
                    {marketPrice.stale && <p className="notice notice--warning">{marketPrice.staleNote}</p>}
                  </>
                ) : (
                  <>
                    <p className="meta">{marketPrice.message}</p>
                    {marketPrice.fallback && (
                      <p className="meta">
                        Example estimate: {currency(marketPrice.fallback.price)} {marketPrice.fallback.unit} -{' '}
                        {marketPrice.fallback.label}
                      </p>
                    )}
                  </>
                )}
              </Card>
            )}
          </div>
        </Section>
      )}

      {e && (
        <Card className="next-step">
          <div>
            <h2 className="card__title">Next step</h2>
            <p className="meta">See what {crop.name} could cost and earn on your land, then plan your inputs.</p>
          </div>
          <div className="form-actions">
            <Button to={`/profit?cropId=${crop._id}`} icon={ArrowRight} iconPosition="right">
              Estimate cost &amp; profit
            </Button>
            <Button to={`/inputs?cropId=${crop._id}`} variant="secondary">
              View input list
            </Button>
          </div>
        </Card>
      )}

      <p className="form-hint page-disclaimer">
        Source: {crop.source} Last updated: {new Date(crop.lastUpdated).toLocaleDateString()}.
      </p>
    </Page>
  );
}

export default CropDetail;
