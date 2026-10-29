import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Page from './Page';
import Card from './Card';
import Button from './Button';
import LoadingState from './LoadingState';
import { ErrorState } from './EmptyState';

/**
 * Guards private routes. Optionally restrict to specific roles via
 * `roles` (e.g. <ProtectedRoute roles={['farmer']}>).
 */
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading, sessionError, retrySession, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState label="Checking your session..." />;
  }

  // Saved session exists but the server couldn't be reached to verify it -
  // don't bounce the user to /login, let them retry once the server is back.
  if (!isAuthenticated && sessionError) {
    return (
      <Page>
        <Card>
          <ErrorState
            title="Can't reach UZHIRO right now"
            message={sessionError}
            action={
              <div className="form-actions">
                <Button onClick={retrySession}>Try again</Button>
                <Button variant="ghost" onClick={logout}>
                  Log out
                </Button>
              </div>
            }
          />
        </Card>
      </Page>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
