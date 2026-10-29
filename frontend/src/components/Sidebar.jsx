import { NavLink } from 'react-router-dom';
import { Sprout, LogOut, X, Moon, Sun } from 'lucide-react';
import { getNavGroups } from '../layouts/navItems';
import { useTheme } from '../hooks/useTheme';

const ROLE_LABEL = { farmer: 'Farmer', labourer: 'Labourer', admin: 'Administrator' };

/**
 * Fixed left navigation for authenticated users. Desktop: full width with
 * labels. Tablet: icon rail (labels become tooltips). Mobile: off-canvas
 * drawer controlled by MainLayout via `open` / `onClose`.
 */
function Sidebar({ user, open, onClose, onLogout }) {
  const groups = getNavGroups(user.role);
  const firstName = user.name.split(' ')[0];
  const { theme, toggleTheme } = useTheme();

  return (
    <aside id="app-sidebar" className={`sidebar${open ? ' is-open' : ''}`} aria-label="Main navigation">
      <div className="sidebar__brand">
        <NavLink to="/dashboard" className="sidebar__brand-link" title="UZHIRO">
          <span className="app-brand__mark" aria-hidden="true">
            <Sprout size={20} strokeWidth={2.5} />
          </span>
          <span className="sidebar__brand-text">
            <span className="sidebar__brand-name">UZHIRO</span>
            <span className="sidebar__brand-tag">Smart Farming Platform</span>
          </span>
        </NavLink>
        <button type="button" className="sidebar__close" aria-label="Close menu" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar__nav">
        {groups.map((group) => (
          <div
            className={`sidebar__group${group.pillar ? ` sidebar__group--pillar sidebar__group--${group.pillar}` : ''}`}
            key={group.label}
          >
            <span className="sidebar__group-label">
              {group.label}
              {group.pillarLabel && <span className="sidebar__pillar">{group.pillarLabel}</span>}
            </span>
            {group.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                title={label}
                className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}
              >
                <Icon size={18} strokeWidth={2} aria-hidden="true" />
                <span className="sidebar__link-label">{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user" title={user.name}>
          <span className="sidebar__avatar" aria-hidden="true">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <span className="sidebar__user-text">
            <span className="sidebar__user-name">Hi, {firstName}</span>
            <span className="sidebar__user-role">{ROLE_LABEL[user.role] || user.role}</span>
          </span>
        </div>
        <button
          type="button"
          className="sidebar__utility"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
        </button>
        <button type="button" className="sidebar__logout" onClick={onLogout} title="Log out">
          <LogOut size={17} strokeWidth={2} aria-hidden="true" />
          <span className="sidebar__link-label">Log out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
