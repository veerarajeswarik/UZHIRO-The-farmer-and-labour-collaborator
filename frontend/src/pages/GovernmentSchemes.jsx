import { useEffect, useMemo, useState } from 'react';
import {
  Landmark,
  Banknote,
  ShieldCheck,
  CreditCard,
  Droplets,
  Waves,
  TrendingUp,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  FileCheck2,
  Gift,
  Compass,
} from 'lucide-react';
import { getSchemes } from '../services/schemeService';
import { friendlyError } from '../services/errors';
import Page, { Section } from '../components/Page';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import SearchBar from '../components/SearchBar';
import FilterBar, { FilterChips } from '../components/FilterBar';
import SkeletonGrid from '../components/Skeleton';
import EmptyState, { ErrorState } from '../components/EmptyState';

// Maps each scheme's real `category` field (unchanged, from the backend) to
// a representative icon. Falls back to a generic government icon for any
// category not listed here, so new categories never break the page.
const CATEGORY_ICONS = {
  'Income Support': Banknote,
  Insurance: ShieldCheck,
  Credit: CreditCard,
  'Soil & Water': Droplets,
  Irrigation: Waves,
  Marketing: TrendingUp,
};

function iconForCategory(category) {
  return CATEGORY_ICONS[category] || Landmark;
}

// The flagship, most widely recognized scheme is highlighted as "Popular" -
// purely a presentational cue, based on the real scheme name already in the
// data (no data is invented or altered).
function isPopularScheme(scheme) {
  return scheme.name.toLowerCase().includes('pm-kisan');
}

function GovernmentSchemes() {
  const [status, setStatus] = useState('loading');
  const [schemes, setSchemes] = useState([]);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    getSchemes()
      .then((d) => {
        setSchemes(d.schemes);
        setStatus('ready');
      })
      .catch((err) => {
        setError(friendlyError(err, 'Schemes'));
        setStatus('error');
      });
  }, []);

  const categories = useMemo(
    () => [...new Set(schemes.map((s) => s.category).filter(Boolean))].sort(),
    [schemes]
  );

  const filteredSchemes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return schemes.filter((s) => {
      const matchesCategory = !category || s.category === category;
      const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [schemes, search, category]);

  const header = (
    <PageHeader
      eyebrow="Learn · Government support"
      pillar="neutral"
      title="Government Schemes"
      description="Discover schemes, financial support, insurance and irrigation programs for farmers - and verify every detail on the official source before you apply."
    />
  );

  if (status === 'loading') {
    return (
      <Page>
        {header}
        <SkeletonGrid count={6} label="Loading government schemes..." />
      </Page>
    );
  }

  if (status === 'error') {
    return (
      <Page>
        {header}
        <Card>
          <ErrorState title="Unable to load schemes" message={error} />
        </Card>
      </Page>
    );
  }

  const categoryOptions = [{ value: '', label: 'All schemes' }, ...categories.map((c) => ({ value: c, label: c }))];

  return (
    <Page>
      {header}

      <p className="notice">
        <BadgeCheck size={16} strokeWidth={2} aria-hidden="true" />
        <span>
          UZHIRO helps you discover schemes. Always verify eligibility, benefits and deadlines on the official government portal
          before applying.
        </span>
      </p>

      <FilterBar className="filter-bar--stacked">
        <SearchBar value={search} onChange={setSearch} placeholder="Search schemes by name or keyword..." />
        <FilterChips options={categoryOptions} value={category} onChange={setCategory} />
      </FilterBar>

      <Section
        className="page-section--flush"
        title={`${filteredSchemes.length} scheme${filteredSchemes.length === 1 ? '' : 's'} found`}
      >
        {filteredSchemes.length === 0 ? (
          <Card>
            <EmptyState icon={Landmark} title="No schemes match your search" description="Try a different keyword or category." />
          </Card>
        ) : (
          <div className="item-grid">
            {filteredSchemes.map((s) => {
              const Icon = iconForCategory(s.category);
              const expanded = expandedId === s._id;
              const popular = isPopularScheme(s);
              const keyBenefit = s.benefits?.[0];

              return (
                <Card as="article" className={`item-card scheme-card${popular ? ' scheme-card--popular' : ''}`} key={s._id}>
                  <div className="item-card__header">
                    <span className="icon-tile" aria-hidden="true">
                      <Icon size={20} strokeWidth={2} />
                    </span>
                    <span className="chip-row">
                      {popular && (
                        <Badge variant="warning">
                          <Star size={11} strokeWidth={2.5} fill="currentColor" aria-hidden="true" /> Popular
                        </Badge>
                      )}
                      {s.category && <span className="chip">{s.category}</span>}
                    </span>
                  </div>

                  <h3 className="item-card__title">{s.name}</h3>
                  <p className="item-card__body">{s.description}</p>

                  {keyBenefit && (
                    <div className="scheme-card__benefit">
                      <Gift size={15} strokeWidth={2} aria-hidden="true" />
                      <div>
                        <span className="scheme-card__benefit-label">Key benefit</span>
                        <p>{keyBenefit}</p>
                      </div>
                    </div>
                  )}

                  {expanded && (
                    <div className="scheme-card__details" id={`scheme-${s._id}`}>
                      <h4>
                        <FileCheck2 size={15} strokeWidth={2} aria-hidden="true" /> Eligibility
                      </h4>
                      <ul className="check-list">
                        {s.eligibility.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>

                      <h4>
                        <Gift size={15} strokeWidth={2} aria-hidden="true" /> Benefits
                      </h4>
                      <ul className="check-list">
                        {s.benefits.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>

                      <h4>
                        <Compass size={15} strokeWidth={2} aria-hidden="true" /> How to apply
                      </h4>
                      <p>{s.applicationInfo}</p>

                      <p className="meta">
                        Source: {s.sourceName} · Last updated: {new Date(s.lastUpdated).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  )}

                  <div className="item-card__footer">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setExpandedId(expanded ? null : s._id)}
                      aria-expanded={expanded}
                      aria-controls={`scheme-${s._id}`}
                    >
                      {expanded ? 'Hide details' : 'View details'}
                      {expanded ? (
                        <ChevronUp size={16} strokeWidth={2} aria-hidden="true" />
                      ) : (
                        <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
                      )}
                    </button>
                    {s.officialSourceUrl && (
                      <a href={s.officialSourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                        Official source
                        <ExternalLink size={14} strokeWidth={2} aria-hidden="true" />
                        <span className="visually-hidden"> (opens in a new tab)</span>
                      </a>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Section>
    </Page>
  );
}

export default GovernmentSchemes;
