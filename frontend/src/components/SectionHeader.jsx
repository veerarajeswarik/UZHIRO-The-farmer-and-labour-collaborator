/**
 * Eyebrow + heading + optional supporting copy used to open page sections
 * consistently across the app.
 */
function SectionHeader({ eyebrow, title, description, center = false, className = '' }) {
  return (
    <div className={`section-header ${center ? 'section-header--center' : ''} ${className}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

export default SectionHeader;
