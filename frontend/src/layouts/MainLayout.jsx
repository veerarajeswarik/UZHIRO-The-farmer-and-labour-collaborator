import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCircle,
  Sprout,
  Calculator,
  ShoppingCart,
  Users,
  CloudSun,
  CalendarCheck,
  Bot,
  BookOpen,
  Landmark,
  ClipboardList,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/**
 * Base app shell. Nav items are declared once per role and rendered by a
 * single list so desktop (inline row) and mobile (drawer) stay in sync -
 * every link/role rule here is unchanged from the original nav, just
 * restructured with icons + active-state highlighting + a responsive
 * collapse instead of letting a long list wrap awkwardly.
 */

// Items beyond this count on the farmer role collapse into a "More" menu so
// the desktop nav never crowds - purely a presentational grouping.
const PRIMARY_LIMIT = 7;
const MORE_LABELS = new Set(['AI Assistant', 'Learning Hub', 'Government Schemes']);

function MainLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  function getNavItems() {
    if (!isAuthenticated) return [];
    if (user.role === 'admin') {
      return [{ to: '/admin', label: 'Admin Dashboard', icon: ShieldCheck }];
    }
    if (user.role === 'labourer') {
      return [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/labourer/profile', label: 'My Profile', icon: UserCircle },
        { to: '/hiring', label: 'Hiring Requests', icon: ClipboardList },
        { to: '/learning', label: 'Learning Hub', icon: BookOpen },
        { to: '/schemes', label: 'Government Schemes', icon: Landmark },
      ];
    }
    // farmer
    return [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/farmer/profile', label: 'Farm Profile', icon: UserCircle },
      { to: '/crops', label: 'Crop Selection', icon: Sprout },
      { to: '/profit', label: 'Cost & Profit', icon: Calculator },
      { to: '/inputs', label: 'Buy Inputs', icon: ShoppingCart },
      { to: '/labourers', label: 'Labour Marketplace', icon: Users },
      { to: '/weather', label: 'Weather', icon: CloudSun },
      { to: '/planner', label: 'Farm Planner', icon: CalendarCheck },
      { to: '/assistant', label: 'AI Assistant', icon: Bot },
      { to: '/hiring', label: 'My Hiring Requests', icon: ClipboardList },
      { to: '/learning', label: 'Learning Hub', icon: BookOpen },
      { to: '/schemes', label: 'Government Schemes', icon: Landmark },
    ];
  }

  const navItems = getNavItems();
  const primaryItems =
    navItems.length > PRIMARY_LIMIT ? navItems.filter((item) => !MORE_LABELS.has(item.label)) : navItems;
  const moreItems = navItems.length > PRIMARY_LIMIT ? navItems.filter((item) => MORE_LABELS.has(item.label)) : [];
  const moreActive = moreItems.some((item) => location.pathname.startsWith(item.to));

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <NavLink to="/" className="app-brand" onClick={() => setMenuOpen(false)}>
            <span className="app-brand__mark" aria-hidden="true">
              <Sprout size={20} strokeWidth={2.5} />
            </span>
            UZHIRO
          </NavLink>

          {isAuthenticated ? (
            <>
              <nav className="app-nav app-nav--desktop" aria-label="Main navigation">
                {primaryItems.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) => `app-nav__link${isActive ? ' is-active' : ''}`}
                  >
                    <Icon size={16} strokeWidth={2} aria-hidden="true" />
                    <span>{label}</span>
                  </NavLink>
                ))}

                {moreItems.length > 0 && (
                  <div className="app-nav__more">
                    <button
                      type="button"
                      className={`app-nav__link app-nav__more-toggle${moreActive ? ' is-active' : ''}`}
                      aria-expanded={moreOpen}
                      onClick={() => setMoreOpen((v) => !v)}
                      onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
                    >
                      <span>More</span>
                      <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
                    </button>
                    {moreOpen && (
                      <div className="app-nav__more-menu">
                        {moreItems.map(({ to, label, icon: Icon, end }) => (
                          <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) => `app-nav__more-link${isActive ? ' is-active' : ''}`}
                          >
                            <Icon size={16} strokeWidth={2} aria-hidden="true" />
                            <span>{label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </nav>

              <div className="app-header__actions">
                <span className="app-nav__user app-nav__user--desktop">
                  <span className="app-nav__avatar" aria-hidden="true">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  Hi, {user.name.split(' ')[0]}
                </span>
                <button type="button" className="btn btn-outline btn-sm app-nav__logout--desktop" onClick={handleLogout}>
                  <LogOut size={15} strokeWidth={2} aria-hidden="true" />
                  Log out
                </button>
                <button
                  type="button"
                  className="app-nav__toggle"
                  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </>
          ) : (
            <nav className="app-nav" aria-label="Main navigation">
              <NavLink to="/login" className="app-nav__link">
                Log in
              </NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </nav>
          )}
        </div>

        {isAuthenticated && (
          <div className={`app-nav__drawer${menuOpen ? ' is-open' : ''}`}>
            <nav className="app-nav__drawer-links" aria-label="Main navigation (mobile)">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `app-nav__link${isActive ? ' is-active' : ''}`}
                >
                  <Icon size={18} strokeWidth={2} aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="app-nav__drawer-footer">
              <span className="app-nav__user">Hi, {user.name.split(' ')[0]}</span>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
                <LogOut size={15} strokeWidth={2} aria-hidden="true" />
                Log out
              </button>
            </div>
          </div>
        )}
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
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/crops">Crop Selection</Link>
            <Link to="/profit">Cost &amp; Profit</Link>
            <Link to="/labourers">Labour Marketplace</Link>
            <Link to="/assistant">AI Assistant</Link>
            <Link to="/learning">Learning Hub</Link>
            <Link to="/schemes">Government Schemes</Link>
          </nav>
        </div>
        <div className="container">
          <p className="app-footer__legal">
            &copy; {new Date().getFullYear()} UZHIRO. Crop, cost and scheme information is provided as
            general guidance - always verify current eligibility, pricing and deadlines with official
            sources before making decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
