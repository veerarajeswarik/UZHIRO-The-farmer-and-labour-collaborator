import { Search } from 'lucide-react';

/**
 * Pill search input used inside FilterBar or standalone. Fully controlled -
 * callers keep owning value/state exactly as before.
 */
function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <label className={`search-bar ${className}`}>
      <Search size={16} strokeWidth={2} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </label>
  );
}

export default SearchBar;
