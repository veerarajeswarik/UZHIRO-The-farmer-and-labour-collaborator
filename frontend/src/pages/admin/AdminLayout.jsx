import { Outlet, useLocation } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Page from '../../components/Page';

// Section titles for the header. Navigation between these lives in the
// sidebar (see layouts/navItems.js).
const SECTIONS = {
  '/admin': 'Platform overview',
  '/admin/users': 'Users',
  '/admin/crops': 'Crops',
  '/admin/products': 'Products',
  '/admin/market-prices': 'Market data',
  '/admin/learning': 'Learning content',
  '/admin/schemes': 'Government schemes',
};

function AdminLayout() {
  const { pathname } = useLocation();
  const title = SECTIONS[pathname.replace(/\/$/, '')] || 'Admin dashboard';

  return (
    <Page>
      <PageHeader
        eyebrow="Admin"
        title={title}
        description="Manage users, content and reference data. Visible to admin accounts only."
      />
      <Outlet />
    </Page>
  );
}

export default AdminLayout;
