import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sprout, ShoppingCart, Package, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getCrops } from '../services/cropService';
import { getFarmerProfile } from '../services/farmerService';
import { getInputChecklist } from '../services/productService';
import { friendlyError } from '../services/errors';
import Page, { Section } from '../components/Page';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import IconTile from '../components/IconTile';
import FilterBar, { FilterChips } from '../components/FilterBar';
import SearchBar from '../components/SearchBar';
import SkeletonGrid from '../components/Skeleton';
import { StatusBadge } from '../components/Badge';
import EmptyState, { ErrorState } from '../components/EmptyState';
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

  // Display-only refinement of the loaded list.
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

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
        setChecklistError(friendlyError(err, 'This input list'));
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
    setCategory('All');
    setSearchParams(id ? { cropId: id } : {});
  }

  const header = (
    <PageHeader
      eyebrow="Tools"
      pillar="neutral"
      title="Buy Inputs"
      description="Find the seeds, fertilizer and crop protection your farm needs - with real purchase links where available."
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

  const items = checklist?.checklist || [];
  const categories = ['All', ...items.map((i) => i.category)];
  const q = query.trim().toLowerCase();
  const visible = items.filter(
    (item) =>
      (category === 'All' || item.category === category) &&
      (!q || item.category.toLowerCase().includes(q) || item.options.some((o) => o.name.toLowerCase().includes(q)))
  );

  return (
    <Page>
      {header}

      <Card className="filter-card">
        <Card.Header>
          <Card.Title icon={Sprout}>What are you growing?</Card.Title>
        </Card.Header>
        <div className="form form-grid">
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

      <Section
        title={
          checklistStatus === 'ready' && checklist
            ? `Inputs for ${checklist.crop.name} · ${checklist.landAreaAcres} acre${checklist.landAreaAcres === 1 ? '' : 's'}`
            : 'Your input list'
        }
      >
        {checklistStatus === 'idle' && (
          <Card>
            <EmptyState
              icon={ShoppingCart}
              title="Choose a crop to see your inputs"
              description="Select a crop and your land area to get an estimated shopping list."
            />
          </Card>
        )}

        {checklistStatus === 'loading' && <SkeletonGrid count={3} label="Calculating your shopping list..." />}

        {checklistStatus === 'error' && (
          <Card>
            <ErrorState title="Unable to build your input list" message={checklistError} />
          </Card>
        )}

        {checklistStatus === 'ready' && checklist && (
          <>
            {items.length > 0 && (
              <FilterBar>
                <SearchBar value={query} onChange={setQuery} placeholder="Search inputs or products..." />
                <FilterChips options={categories} value={category} onChange={setCategory} />
              </FilterBar>
            )}

            {visible.length === 0 ? (
              <Card>
                <EmptyState icon={Package} title="No inputs match your search" description="Try a different search or category." />
              </Card>
            ) : (
              <div className="item-grid">
                {visible.map((item) => (
                  <Card className="item-card" key={item.category}>
                    <div className="item-card__header">
                      <div className="crop-rec__title">
                        <IconTile category={item.category} />
                        <div>
                          <h3 className="item-card__title">{item.category}</h3>
                          <span className="meta">{item.quantityLabel}</span>
                        </div>
                      </div>
                      <StatusBadge status={item.required ? 'required' : 'optional'} />
                    </div>

                    <p className="product-cost">
                      <span className="meta">Estimated cost</span>
                      <strong>{item.estimatedCost != null ? currency(item.estimatedCost) : 'Not available'}</strong>
                    </p>

                    {item.options.length === 0 ? (
                      <p className="form-hint">Purchase link unavailable for this input.</p>
                    ) : (
                      <ul className="product-options">
                        {item.options.map((opt) => (
                          <li key={opt.id}>
                            <div>
                              <p className="product-options__name">{opt.name}</p>
                              <p className="meta">
                                {currency(opt.estimatedPrice)} {opt.unit}
                                {opt.seller ? ` · ${opt.seller}` : ''}
                              </p>
                            </div>
                            {opt.purchaseStatus === 'available' && opt.purchaseUrl ? (
                              <a href={opt.purchaseUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                                View / Buy <ExternalLink size={14} strokeWidth={2} aria-hidden="true" />
                                <span className="visually-hidden"> {opt.name} (opens in a new tab)</span>
                              </a>
                            ) : (
                              <span className="meta product-options__na">Purchase link unavailable</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                ))}
              </div>
            )}

            <p className="form-hint page-disclaimer">{checklist.disclaimer}</p>
          </>
        )}
      </Section>
    </Page>
  );
}

export default InputChecklist;
