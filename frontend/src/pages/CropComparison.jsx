import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GitCompare, Trophy, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { compareCrops } from '../services/cropService';
import { friendlyError } from '../services/errors';
import Page from '../components/Page';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge, { StatusBadge } from '../components/Badge';
import IconTile from '../components/IconTile';
import EmptyState, { ErrorState } from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

const BACK = { to: '/crops', label: 'Back to Crop Selection' };

function money(n) {
  return `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function Suitability({ c }) {
  return (
    <div className="compare-suit">
      <StatusBadge status={c.level} label={`${c.level} suitability`} />
      <div className="progress-bar" aria-hidden="true">
        <div className="progress-bar__fill" style={{ width: `${c.score}%` }} />
      </div>
      <span className="meta">
        <strong>{c.score}/100</strong>
      </span>
    </div>
  );
}

function ExampleValue({ children }) {
  return (
    <span className="example-value">
      {children} <Badge variant="warning">Example</Badge>
    </span>
  );
}

// Rows only use values the compare API actually returns. Money rows show the
// crop's labelled example inputs - no derived cost/revenue/profit totals.
const ROWS = [
  { label: 'Suitability', render: (c) => <Suitability c={c} /> },
  { label: 'Soil compatibility', render: (c) => c.breakdown.soil.note },
  { label: 'Water requirement', render: (c) => c.crop.waterRequirement },
  { label: 'Season', render: (c) => c.crop.suitableSeasons.join(', ') },
  { label: 'Growing duration', render: (c) => `~${c.crop.cultivationDurationDays} days` },
  {
    label: 'Yield per acre',
    render: (c) =>
      c.crop.economics ? <ExampleValue>{Number(c.crop.economics.yieldPerAcreKg).toLocaleString('en-IN')} kg</ExampleValue> : '—',
  },
  {
    label: 'Selling price',
    render: (c) => (c.crop.economics ? <ExampleValue>{money(c.crop.economics.sellingPricePerKg)} / kg</ExampleValue> : '—'),
  },
  { label: 'Description', render: (c) => c.crop.description },
  {
    label: 'Advantages',
    render: (c) => (
      <ul className="check-list">
        {c.crop.advantages.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
    ),
  },
  {
    label: 'Considerations',
    render: (c) => (
      <ul className="check-list check-list--warn">
        {c.crop.considerations.map((cons) => (
          <li key={cons}>{cons}</li>
        ))}
      </ul>
    ),
  },
  {
    label: 'Next step',
    render: (c) => (
      <Button to={`/profit?cropId=${c.crop._id}`} variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
        Estimate cost &amp; profit
      </Button>
    ),
  },
];

function CropComparison() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const ids = (searchParams.get('ids') || '').split(',').filter(Boolean);
  const season = searchParams.get('season') || undefined;

  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ids.length < 2) {
      setStatus('error');
      setError('Select 2 or 3 crops from Crop Selection to compare them.');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    compareCrops(token, ids, season)
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setStatus('ready');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(friendlyError(err, 'These crops'));
          setStatus('error');
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString(), token]);

  const header = (
    <PageHeader
      back={BACK}
      eyebrow="Farm Intelligence"
      pillar="farm"
      title="Crop Comparison"
      description={
        status === 'ready'
          ? `Compare how each crop fits your farm for the ${data.season} season.`
          : 'Compare how each crop fits your farm, side by side.'
      }
    />
  );

  if (status === 'loading') {
    return (
      <Page>
        {header}
        <LoadingState label="Comparing crops..." />
      </Page>
    );
  }

  if (status === 'error') {
    const needsSelection = ids.length < 2;
    return (
      <Page>
        {header}
        <Card>
          {needsSelection ? (
            <EmptyState
              icon={GitCompare}
              title="Choose crops to compare"
              description={error}
              action={<Button to="/crops">Go to Crop Selection</Button>}
            />
          ) : (
            <ErrorState
              title="Unable to compare these crops"
              message={error}
              action={
                <Button to="/crops" variant="secondary">
                  Back to Crop Selection
                </Button>
              }
            />
          )}
        </Card>
      </Page>
    );
  }

  const best = data.comparison.find((c) => c.bestMatch);

  return (
    <Page>
      {header}

      {best && (
        <p className="notice">
          <Trophy size={16} strokeWidth={2} aria-hidden="true" />
          <span>
            <strong>{best.crop.name}</strong> is the best match for your farm conditions ({best.score}/100).
          </span>
        </p>
      )}

      {/* Desktop / tablet: side-by-side table */}
      <div className="table-wrap compare-desktop">
        <table className="compare-table">
          <thead>
            <tr>
              <th scope="col">Factor</th>
              {data.comparison.map((c) => (
                <th scope="col" key={c.crop._id} className={c.bestMatch ? 'best-match-col' : ''}>
                  <span className="compare-head">
                    <IconTile fallback="crop" />
                    <span>
                      {c.crop.name}
                      {c.bestMatch && <span className="best-match-flag">Best match</span>}
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {data.comparison.map((c) => (
                  <td key={c.crop._id} className={c.bestMatch ? 'best-match-col' : ''}>
                    {row.render(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: one card per crop */}
      <div className="compare-mobile item-grid">
        {data.comparison.map((c) => (
          <Card key={c.crop._id} className={`item-card${c.bestMatch ? ' crop-rec is-selected' : ''}`}>
            <div className="item-card__header">
              <div className="crop-rec__title">
                <IconTile fallback="crop" />
                <h2 className="item-card__title">{c.crop.name}</h2>
              </div>
              {c.bestMatch && <Badge variant="success">Best match</Badge>}
            </div>
            <dl className="detail-list detail-list--compact detail-list--stacked">
              {ROWS.map((row) => (
                <div className="detail-list__row" key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.render(c)}</dd>
                </div>
              ))}
            </dl>
          </Card>
        ))}
      </div>

      <p className="form-hint page-disclaimer">{data.disclaimer}</p>
    </Page>
  );
}

export default CropComparison;
