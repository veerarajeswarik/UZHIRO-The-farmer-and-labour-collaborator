/**
 * Placeholder cards shown while a list loads, sized like the real item
 * cards so the page doesn't jump when data arrives.
 */
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card skeleton-card" aria-hidden="true">
      <div className="skeleton-card__head">
        <span className="skeleton skeleton--circle" />
        <span className="skeleton skeleton--title" />
      </div>
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} className="skeleton skeleton--line" style={{ width: `${90 - i * 15}%` }} />
      ))}
      <span className="skeleton skeleton--button" />
    </div>
  );
}

function SkeletonGrid({ count = 6, label = 'Loading...' }) {
  return (
    <div role="status" aria-live="polite">
      <span className="visually-hidden">{label}</span>
      <div className="item-grid">
        {Array.from({ length: count }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export default SkeletonGrid;
