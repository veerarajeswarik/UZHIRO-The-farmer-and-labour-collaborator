import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getArticleById } from '../services/learningService';
import { friendlyError } from '../services/errors';
import Page from '../components/Page';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import { ErrorState } from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

const BACK = { to: '/learning', label: 'Back to Learning Hub' };

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
          setError(friendlyError(err, 'This article'));
          setStatus('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === 'loading') {
    return (
      <Page>
        <PageHeader back={BACK} eyebrow="Learn" pillar="neutral" title="Loading article..." />
        <LoadingState label="Loading article..." />
      </Page>
    );
  }

  if (status === 'error') {
    return (
      <Page>
        <PageHeader back={BACK} eyebrow="Learn" pillar="neutral" title="Article" />
        <Card>
          <ErrorState title="Unable to load this article" message={error} />
        </Card>
      </Page>
    );
  }

  return (
    <Page className="page--reading">
      <PageHeader back={BACK} eyebrow={`Learn · ${article.category}`} pillar="neutral" title={article.title} description={article.summary} />

      <Card as="article" className="article-body">
        <p>{article.content}</p>
      </Card>

      <p className="form-hint page-disclaimer">
        Source: {article.source} · Last updated: {new Date(article.updatedAt).toLocaleDateString('en-IN')}
      </p>
    </Page>
  );
}

export default ArticleDetail;
