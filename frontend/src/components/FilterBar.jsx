/**
 * Shared filter chrome shell. Renders whatever children are passed (a
 * SearchBar, filter chips, selects) inside consistent card styling.
 */
function FilterBar({ children, className = '' }) {
  return <div className={`filter-bar ${className}`}>{children}</div>;
}

export function FilterChips({ options, value, onChange }) {
  return (
    <div className="filter-bar__chips">
      {options.map((opt) => {
        const optValue = typeof opt === 'string' ? opt : opt.value;
        const optLabel = typeof opt === 'string' ? opt : opt.label;
        return (
          <button
            key={optValue}
            type="button"
            className={`filter-chip ${value === optValue ? 'is-active' : ''}`}
            onClick={() => onChange(optValue)}
          >
            {optLabel}
          </button>
        );
      })}
    </div>
  );
}

export default FilterBar;
