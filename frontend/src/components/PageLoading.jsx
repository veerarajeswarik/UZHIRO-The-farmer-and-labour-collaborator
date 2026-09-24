import Spinner from './Spinner';

/**
 * Full-page fallback shown while a lazy-loaded route chunk is fetched
 * (see App.jsx). Brief on a warm cache/fast connection; visible mainly on
 * first navigation to a page or a slow connection.
 */
function PageLoading() {
  return (
    <div className="loading-state">
      <Spinner label="Loading page..." />
    </div>
  );
}

export default PageLoading;
