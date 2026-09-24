import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { compareCrops } from '../services/cropService';
import LoadingState from '../components/LoadingState';

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
          setError(err.message);
          setStatus('error');
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString(), token]);

  if (status === 'loading') {
    return <LoadingState label="Comparing crops..." />;
  }

  if (status === 'error') {
    return (
      <div className="container error-state">
        <p>{error}</p>
        <Link to="/crops" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
          Back to crop selection
        </Link>
      </div>
    );
  }

  const rows = [
    { label: 'Suitability', render: (c) => `${c.score}/100 (${c.level})` },
    { label: 'Soil compatibility', render: (c) => c.breakdown.soil.note },
    { label: 'Water requirement', render: (c) => c.crop.waterRequirement },
    { label: 'Season', render: (c) => c.crop.suitableSeasons.join(', ') },
    { label: 'Cultivation duration', render: (c) => `~${c.crop.cultivationDurationDays} days` },
    { label: 'Description', render: (c) => c.crop.description },
    {
      label: 'Advantages',
      render: (c) => (
        <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
          {c.crop.advantages.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      ),
    },
    {
      label: 'Considerations',
      render: (c) => (
        <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
          {c.crop.considerations.map((cons) => (
            <li key={cons}>{cons}</li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <Link to="/crops" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
        <ArrowLeft size={16} strokeWidth={2} /> Back to crop selection
      </Link>
      <h1 style={{ marginTop: 'var(--space-md)' }}>Crop comparison</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>Season: {data.season}</p>

      <div className="compare-table-wrap" style={{ marginTop: 'var(--space-lg)' }}>
        <table className="compare-table">
          <thead>
            <tr>
              <th>Factor</th>
              {data.comparison.map((c) => (
                <th key={c.crop._id} className={c.bestMatch ? 'best-match-col' : ''}>
                  {c.crop.name}
                  {c.bestMatch && <div className="best-match-flag">Best Match</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
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

      <p className="form-hint" style={{ marginTop: 'var(--space-lg)' }}>
        {data.disclaimer}
      </p>
    </div>
  );
}

export default CropComparison;
