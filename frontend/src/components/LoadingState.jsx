import Spinner from './Spinner';

/**
 * In-page loading placeholder (as opposed to PageLoading, which is the
 * route-level Suspense fallback). Same visual language, different context.
 */
function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="container loading-state">
      <Spinner label={label} />
    </div>
  );
}

export default LoadingState;
