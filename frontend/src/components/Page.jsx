/**
 * Standard page frame used by every in-app page:
 *   <Page>
 *     <PageHeader ... />
 *     <PageHero compact ... />   (optional context band)
 *     <Section title="...">...</Section>
 *   </Page>
 * Centres content at the shared max width with the shared gutters, so pages
 * never set their own container/padding.
 */
function Page({ className = '', children }) {
  return <div className={`page ${className}`}>{children}</div>;
}

export function Section({ title, description, actions, className = '', children, ...rest }) {
  return (
    <section className={`page-section ${className}`} {...rest}>
      {(title || actions) && (
        <div className="page-section__head">
          <div>
            {title && <h2 className="page-section__title">{title}</h2>}
            {description && <p className="page-section__description">{description}</p>}
          </div>
          {actions && <div className="page-section__actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export default Page;
