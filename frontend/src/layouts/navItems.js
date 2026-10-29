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
  Wheat,
  Package,
  LineChart,
} from 'lucide-react';

/**
 * Sidebar navigation, grouped per role. Every link/role rule is the same as
 * the previous top nav - only the grouping is new. Admin sub-pages (formerly
 * a tab strip inside AdminLayout) live here so admins have one nav surface.
 */
const FARMER_GROUPS = [
  {
    label: 'Overview',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Farm',
    pillar: 'farm',
    pillarLabel: 'Farm Intelligence',
    items: [
      { to: '/farmer/profile', label: 'Farm Profile', icon: UserCircle },
      { to: '/crops', label: 'Crop Selection', icon: Sprout },
      { to: '/profit', label: 'Cost & Profit', icon: Calculator },
      { to: '/planner', label: 'Farm Planner', icon: CalendarCheck },
    ],
  },
  {
    label: 'Connect',
    pillar: 'labour',
    pillarLabel: 'Labour Connection',
    items: [
      { to: '/labourers', label: 'Labour Marketplace', icon: Users },
      { to: '/hiring', label: 'Hiring Requests', icon: ClipboardList },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/inputs', label: 'Buy Inputs', icon: ShoppingCart },
      { to: '/weather', label: 'Weather', icon: CloudSun },
      { to: '/assistant', label: 'AI Assistant', icon: Bot },
    ],
  },
  {
    label: 'Learn',
    items: [
      { to: '/learning', label: 'Learning Hub', icon: BookOpen },
      { to: '/schemes', label: 'Government Schemes', icon: Landmark },
    ],
  },
];

const LABOURER_GROUPS = [
  {
    label: 'Overview',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Connect',
    pillar: 'labour',
    pillarLabel: 'Labour Connection',
    items: [
      { to: '/labourer/profile', label: 'My Profile', icon: UserCircle },
      { to: '/hiring', label: 'Hiring Requests', icon: ClipboardList },
    ],
  },
  {
    label: 'Learn',
    items: [
      { to: '/learning', label: 'Learning Hub', icon: BookOpen },
      { to: '/schemes', label: 'Government Schemes', icon: Landmark },
    ],
  },
];

const ADMIN_GROUPS = [
  {
    label: 'Admin',
    items: [
      { to: '/admin', label: 'Overview', icon: ShieldCheck, end: true },
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/crops', label: 'Crops', icon: Wheat },
      { to: '/admin/products', label: 'Products', icon: Package },
      { to: '/admin/market-prices', label: 'Market Data', icon: LineChart },
      { to: '/admin/learning', label: 'Learning Content', icon: BookOpen },
      { to: '/admin/schemes', label: 'Government Schemes', icon: Landmark },
    ],
  },
];

export function getNavGroups(role) {
  if (role === 'admin') return ADMIN_GROUPS;
  if (role === 'labourer') return LABOURER_GROUPS;
  return FARMER_GROUPS;
}
