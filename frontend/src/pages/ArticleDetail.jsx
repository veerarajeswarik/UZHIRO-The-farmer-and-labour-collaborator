import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getArticleById } from '../services/learningService';
import Card from '../components/Card';
import LoadingState from '../components/LoadingState';

function ArticleDetail() {
  const { id } = useParams();
  const [status, setStatus] = useState('loading');
  const [article, setArticle] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getArticleById(id)
      .then((d) => {
        if (!cancelled) {
          setArticle(d.article);
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
  }, [id]);

  if (status === 'loading') {
    return <LoadingState label="Loading article..." />;
  }

  if (status === 'error') {
    return (
      <div className="container error-state">
        <p>Unable to load this article. {error}</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <Link to="/learning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
        <ArrowLeft size={16} strokeWidth={2} /> Back to Learning Hub
      </Link>

      <span className="badge badge-medium" style={{ marginTop: 'var(--space-md)', display: 'inline-block' }}>
        {article.category}
      </span>
      <h1 style={{ marginTop: 'var(--space-sm)' }}>{article.title}</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>{article.summary}</p>

      <Card style={{ marginTop: 'var(--space-lg)', maxWidth: 720 }}>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{article.content}</p>
      </Card>

      <p className="form-hint" style={{ marginTop: 'var(--space-lg)' }}>
        Source: {article.source}
      </p>
      <p className="form-hint">Last updated: {new Date(article.updatedAt).toLocaleDateString('en-IN')}</p>
    </div>
  );
}

export default ArticleDetail;
