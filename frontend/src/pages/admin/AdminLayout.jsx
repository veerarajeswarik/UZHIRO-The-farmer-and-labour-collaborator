import { NavLink, Outlet } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';

const TABS = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/crops', label: 'Crops' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/market-prices', label: 'Market Data' },
  { to: '/admin/learning', label: 'Learning Content' },
  { to: '/admin/schemes', label: 'Government Schemes' },
];

function AdminLayout() {
  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Admin dashboard"
        description="Manage users, content and reference data. Visible to admin accounts only."
      />
      <div className="container" style={{ paddingBottom: '3rem' }}>

      <nav style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-md)' }}>
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) => `filter-chip${isActive ? ' is-active' : ''}`}
          >
            {t.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'var(--space-lg)' }}>
        <Outlet />
      </div>
      </div>
    </div>
  );
}

export default AdminLayout;
