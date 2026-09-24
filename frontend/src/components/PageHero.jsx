/**
 * Image-backed hero band used on Landing, Dashboard, Weather, AI Assistant,
 * Government Schemes, Labour Marketplace, Learning Hub. `image` is an
 * external (Unsplash) URL. `floating` renders an optional glass card below
 * the copy (stats, quick info).
 */
function PageHero({
  image,
  eyebrow,
  title,
  description,
  actions,
  floating,
  compact = false,
  className = '',
}) {
  return (
    <section className={`page-hero ${compact ? 'page-hero--compact' : ''} ${className}`}>
      {image && (
        <div className="page-hero__bg" style={{ backgroundImage: `url(${image})` }} role="presentation" />
      )}
      <div className="page-hero__scrim" />
      <div className="container">
        <div className="page-hero__content fade-up">
          {eyebrow && <span className="eyebrow eyebrow-on-dark page-hero__eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {description && <p>{description}</p>}
          {actions && <div className="page-hero__actions">{actions}</div>}
        </div>
        {floating && <div className="page-hero__float fade-up">{floating}</div>}
      </div>
    </section>
  );
}

export default PageHero;
