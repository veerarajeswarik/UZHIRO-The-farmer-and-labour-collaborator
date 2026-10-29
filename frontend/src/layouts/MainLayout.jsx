import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { Sprout, Menu, Moon, Sun } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import Sidebar from '../components/Sidebar';

const LEGAL_TEXT =
  'Crop, cost and scheme information is provided as general guidance - always verify current eligibility, pricing and deadlines with official sources before making decisions.';

function Brand() {
  return (
    <NavLink to="/" className="app-brand">
      <span className="app-brand__mark" aria-hidden="true">
        <Sprout size={20} strokeWidth={2.5} />
      </span>
      UZHIRO
    </NavLink>
  );
}

/**
 * Base app shell.
 * - Authenticated: fixed left Sidebar + main column (with a mobile top bar
 *   holding the hamburger). Nav links/role rules live in navItems.js.
 * - Public (Landing/Login/Register): slim top bar + marketing footer.
 */
function MainLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // The drawer is "open for a given path" - navigating anywhere closes it
  // without needing a setState-in-effect.
  const [drawerPath, setDrawerPath] = useState(null);
  const drawerOpen = drawerPath === location.pathname;
  const closeDrawer = () => setDrawerPath(null);

  // Escape closes the drawer; lock body scroll while it is open (mobile).
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawerPath(null);
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('is-drawer-open');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-drawer-open');
    };
  }, [drawerOpen]);

  function handleLogout() {
    setDrawerPath(null);
    // Clear the session synchronously first (Landing would bounce a still-
    // logged-in user to /dashboard), then go home. Any /login redirect the
    // current page's ProtectedRoute issues during that render is replaced.
    flushSync(() => logout());
    navigate('/', { replace: true });
  }

  if (isAuthenticated) {
    return (
      <div className="app-frame">
        <Sidebar user={user} open={drawerOpen} onClose={closeDrawer} onLogout={handleLogout} />
        <div
          className={`sidebar-scrim${drawerOpen ? ' is-visible' : ''}`}
          onClick={closeDrawer}
          aria-hidden="true"
        />

        <div className="app-main">
          <header className="mobile-topbar">
            <button
              type="button"
              className="mobile-topbar__toggle"
              aria-label="Open menu"
              aria-controls="app-sidebar"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerPath(location.pathname)}
            >
              <Menu size={22} />
            </button>
            <Brand />
          </header>

          <main className="app-content">
            <Outlet />
          </main>

          <footer className="app-footer-slim">
            <p>
              &copy; {new Date().getFullYear()} UZHIRO · Smart Agriculture. Better Decisions. {LEGAL_TEXT}
            </p>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <Brand />
          <nav className="app-nav" aria-label="Main navigation">
            <button
              type="button"
              className="sidebar__utility"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
            </button>
            <NavLink to="/login" className="app-nav__link">
              Log in
            </NavLink>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main className="app-content">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="container app-footer__inner">
          <div className="app-footer__brand">
            <NavLink to="/" className="app-brand app-brand--footer">
              <span className="app-brand__mark" aria-hidden="true">
                <Sprout size={20} strokeWidth={2.5} />
              </span>
              UZHIRO
            </NavLink>
            <p>Smart Agriculture. Better Decisions.</p>
          </div>

          <nav className="app-footer__links" aria-label="Footer navigation">
            <Link to="/learning">Learning Hub</Link>
            <Link to="/schemes">Government Schemes</Link>
            <Link to="/login">Log in</Link>
            <Link to="/register">Register</Link>
          </nav>
        </div>
        <div className="container">
          <p className="app-footer__legal">
            &copy; {new Date().getFullYear()} UZHIRO. {LEGAL_TEXT}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
