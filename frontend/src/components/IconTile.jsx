import {
  Sprout,
  Wheat,
  FlaskConical,
  Leaf,
  Bug,
  Wrench,
  Mountain,
  Droplets,
  Recycle,
  Package,
  Scissors,
  Warehouse,
  TrendingUp,
  BookOpen,
  Landmark,
} from 'lucide-react';

// The database has no image fields for crops/products/articles, so cards use
// a category icon in the "image" slot rather than a stock photo that would
// not depict the actual item.
const ICONS = {
  // Product categories
  Seeds: Sprout,
  Fertilizers: FlaskConical,
  'Organic Manure': Leaf,
  Pesticides: Bug,
  'Farming Tools': Wrench,
  // Learning categories
  'Crop cultivation': Wheat,
  'Soil management': Mountain,
  'Water management': Droplets,
  'Pest management': Bug,
  'Natural farming': Leaf,
  'Organic farming': Recycle,
  'Seed selection': Sprout,
  Harvesting: Scissors,
  Storage: Warehouse,
  'Market awareness': TrendingUp,
  // Generic kinds
  crop: Wheat,
  article: BookOpen,
  scheme: Landmark,
  product: Package,
};

function IconTile({ category, fallback = 'product', size = 'md', tone = 'green', className = '' }) {
  const Icon = ICONS[category] || ICONS[fallback] || Package;
  return (
    <span className={`icon-tile icon-tile--${size} icon-tile--${tone} ${className}`} aria-hidden="true">
      <Icon size={size === 'lg' ? 26 : 20} strokeWidth={2} />
    </span>
  );
}

export default IconTile;
