import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { getArticles } from '../services/learningService';
import PageHero from '../components/PageHero';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1600&q=80';

const CATEGORIES = [
  'Crop cultivation',
  'Soil management',
  'Water management',
  'Pest management',
  'Natural farming',
  'Organic farming',
  'Seed selection',
  'Harvesting',
  'Storage',
  'Market awareness',
];

function LearningHub() {
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('loading');
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    getArticles({ category, q })
      .then((d) => {
        if (cancelled) return;
        setArticles(d.articles);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [category, q]);

  return (
    <div>
      <PageHero
        compact
        image={HERO_IMAGE}
        eyebrow="Learning Hub"
        title="Grow your farming knowledge"
        description="General farming guidance across crop cultivation, soil, water, pests, and more."
      />
      <div className="container" style={{ paddingBottom: '3rem' }}>

      <div className="filter-bar">
        <SearchBar value={q} onChange={setQ} placeholder="Search articles..." />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {status === 'loading' && <LoadingState label="Loading articles..." />}
      {status === 'error' && <p className="form-error">Unable to load articles. {error}</p>}

      {status === 'ready' &&
        (articles.length === 0 ? (
          <EmptyState icon={BookOpen} title="No articles found" description="Try a different search term or category." />
        ) : (
          <div className="crop-grid">
            {articles.map((a) => (
              <Link to={`/learning/${a._id}`} key={a._id} className="card card-hover crop-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="badge badge-medium">{a.category}</span>
                <span className="crop-card__name" style={{ marginTop: 'var(--space-sm)' }}>
                  {a.title}
                </span>
                <p className="crop-card__explanation">{a.summary}</p>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LearningHub;
