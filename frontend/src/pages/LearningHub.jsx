import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { getArticles } from '../services/learningService';
import { friendlyError } from '../services/errors';
import Page, { Section } from '../components/Page';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import IconTile from '../components/IconTile';
import SearchBar from '../components/SearchBar';
import FilterBar, { FilterChips } from '../components/FilterBar';
import SkeletonGrid from '../components/Skeleton';
import EmptyState, { ErrorState } from '../components/EmptyState';

const BANNER_IMAGE =
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

const CATEGORY_OPTIONS = [{ value: '', label: 'All' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))];

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
        setError(friendlyError(err, 'Articles'));
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [category, q]);

  return (
    <Page>
      <PageHeader
        eyebrow="Learn"
        pillar="neutral"
        title="Learning Hub"
        description="Practical farming knowledge - crop cultivation, soil, water, pests, harvesting and selling."
      />

      <div className="image-banner" style={{ backgroundImage: `url(${BANNER_IMAGE})` }}>
        <div className="image-banner__content">
          <strong>Learn a little, grow a lot.</strong>
          <span>Short, practical guides you can use on your farm this season.</span>
        </div>
      </div>

      <FilterBar className="filter-bar--stacked">
        <SearchBar value={q} onChange={setQ} placeholder="Search articles..." />
        <FilterChips options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
      </FilterBar>

      <Section className="page-section--flush" title={status === 'ready' ? `Articles · ${articles.length}` : 'Articles'}>
        {status === 'loading' && <SkeletonGrid count={6} label="Loading articles..." />}
        {status === 'error' && (
          <Card>
            <ErrorState title="Unable to load articles" message={error} />
          </Card>
        )}

        {status === 'ready' &&
          (articles.length === 0 ? (
            <Card>
              <EmptyState icon={BookOpen} title="No articles found" description="Try a different search term or category." />
            </Card>
          ) : (
            <div className="item-grid">
              {articles.map((a) => (
                <Card as={Link} to={`/learning/${a._id}`} key={a._id} hover className="item-card article-card">
                  <div className="item-card__header">
                    <IconTile category={a.category} fallback="article" />
                    <span className="chip">{a.category}</span>
                  </div>
                  <h3 className="item-card__title">{a.title}</h3>
                  <p className="item-card__body clamp-3">{a.summary}</p>
                  <span className="article-card__more">
                    Read article <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
                  </span>
                </Card>
              ))}
            </div>
          ))}
      </Section>
    </Page>
  );
}

export default LearningHub;
