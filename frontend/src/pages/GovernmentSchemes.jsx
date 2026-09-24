import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
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
  Sprout,
} from 'lucide-react';
import { getSchemes } from '../services/schemeService';
import Spinner from '../components/Spinner';

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
        setError(err.message);
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

  if (status === 'loading') {
    return (
      <div className="container" style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
        <Spinner label="Loading government schemes..." />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container error-state">
        <p>Unable to load schemes. {error}</p>
      </div>
    );
  }

  return (
    <div className="schemes-page">
      {/* ---------- Hero ---------- */}
      <section className="schemes-hero">
        <div className="container schemes-hero__inner">
          <div className="schemes-hero__copy">
            <span className="schemes-badge">
              <BadgeCheck size={14} strokeWidth={2.5} aria-hidden="true" />
              Government Support
            </span>
            <h1 className="schemes-hero__title">Government Schemes for Farmers</h1>
            <p className="schemes-hero__subtitle">
              Discover real central government programs, financial support, insurance and irrigation schemes
              designed for farmers - and verify every detail through the official government source before you
              apply.
            </p>
          </div>

          <div className="schemes-hero__art" aria-hidden="true">
            <div className="schemes-hero__blob" />
            <div className="schemes-hero__icon-panel">
              <Landmark size={56} strokeWidth={1.75} className="schemes-hero__icon-main" />
              <span className="schemes-hero__icon-chip schemes-hero__icon-chip--1">
                <Sprout size={18} strokeWidth={2} />
              </span>
              <span className="schemes-hero__icon-chip schemes-hero__icon-chip--2">
                <ShieldCheck size={18} strokeWidth={2} />
              </span>
              <span className="schemes-hero__icon-chip schemes-hero__icon-chip--3">
                <Banknote size={18} strokeWidth={2} />
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* ---------- Search & filter ---------- */}
        <div className="schemes-toolbar">
          <label className="schemes-search">
            <Search size={18} strokeWidth={2} aria-hidden="true" />
            <input
              type="text"
              placeholder="Search schemes by name or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search schemes"
            />
          </label>

          <label className="schemes-select">
            <Filter size={16} strokeWidth={2} aria-hidden="true" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
              <option value="">All Schemes</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="schemes-results-count">
          {filteredSchemes.length} scheme{filteredSchemes.length === 1 ? '' : 's'} found
        </p>

        {/* ---------- Scheme cards ---------- */}
        {filteredSchemes.length === 0 ? (
          <p className="empty-state">No schemes match your search. Try a different keyword or category.</p>
        ) : (
          <div className="schemes-grid">
            {filteredSchemes.map((s) => {
              const Icon = iconForCategory(s.category);
              const expanded = expandedId === s._id;
              const popular = isPopularScheme(s);
              const keyBenefit = s.benefits?.[0];

              return (
                <article className={`scheme-card${popular ? ' scheme-card--popular' : ''}`} key={s._id}>
                  {popular && (
                    <span className="scheme-card__popular-badge">
                      <Star size={12} strokeWidth={2.5} fill="currentColor" />
                      Popular Scheme
                    </span>
                  )}

                  <div className="scheme-card__top">
                    <span className="scheme-card__icon">
                      <Icon size={22} strokeWidth={1.9} />
                    </span>
                    {s.category && <span className="scheme-card__category">{s.category}</span>}
                  </div>

                  <h2 className="scheme-card__title">{s.name}</h2>
                  <p className="scheme-card__description">{s.description}</p>

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
                    <div className="scheme-card__details">
                      <h3>
                        <FileCheck2 size={15} strokeWidth={2} aria-hidden="true" /> Eligibility
                      </h3>
                      <ul>
                        {s.eligibility.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>

                      <h3>
                        <Gift size={15} strokeWidth={2} aria-hidden="true" /> Benefits
                      </h3>
                      <ul>
                        {s.benefits.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>

                      <h3>
                        <Compass size={15} strokeWidth={2} aria-hidden="true" /> How to apply
                      </h3>
                      <p>{s.applicationInfo}</p>

                      <p className="scheme-card__source">
                        Source: {s.sourceName} · Last updated: {new Date(s.lastUpdated).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  )}

                  <div className="scheme-card__footer">
                    <button
                      type="button"
                      className="btn btn-primary scheme-card__view-btn"
                      onClick={() => setExpandedId(expanded ? null : s._id)}
                      aria-expanded={expanded}
                    >
                      {expanded ? 'Hide Details' : 'View Details'}
                      {expanded ? (
                        <ChevronUp size={16} strokeWidth={2.2} aria-hidden="true" />
                      ) : (
                        <ChevronDown size={16} strokeWidth={2.2} aria-hidden="true" />
                      )}
                    </button>
                    <a
                      href={s.officialSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary scheme-card__source-btn"
                    >
                      Official Source
                      <ExternalLink size={14} strokeWidth={2.2} aria-hidden="true" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* ---------- Trust section ---------- */}
      <section className="schemes-trust">
        <div className="container schemes-trust__inner">
          <h2>Apply with confidence</h2>
          <p>
            UZHIRO helps you discover schemes, but always verify eligibility, benefits and application deadlines on
            the official government portal before applying.
          </p>
          <ul className="schemes-trust__list">
            <li>
              <BadgeCheck size={18} strokeWidth={2.2} aria-hidden="true" /> Official government sources
            </li>
            <li>
              <FileCheck2 size={18} strokeWidth={2.2} aria-hidden="true" /> Eligibility information
            </li>
            <li>
              <Gift size={18} strokeWidth={2.2} aria-hidden="true" /> Scheme benefits
            </li>
            <li>
              <Compass size={18} strokeWidth={2.2} aria-hidden="true" /> Application guidance
            </li>
          </ul>
        </div>
      </section>

      {/* ---------- Page footer ---------- */}
      <footer className="schemes-footer">
        <div className="container schemes-footer__inner">
          <div>
            <span className="schemes-footer__brand">UZHIRO</span>
            <p className="schemes-footer__tagline">Smart agriculture. Better decisions. Stronger farmers.</p>
          </div>

          <nav className="schemes-footer__links" aria-label="Quick links">
            <Link to="/schemes">Government Schemes</Link>
            <Link to="/crops">Crop Selection</Link>
            <Link to="/profit">Cost &amp; Profit</Link>
            <Link to="/assistant">AI Assistant</Link>
            <Link to="/learning">Learning Hub</Link>
          </nav>
        </div>
        <div className="container">
          <p className="schemes-footer__disclaimer">
            Scheme eligibility, benefits and deadlines may change. Please verify details on the official government
            portal before applying.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default GovernmentSchemes;
