/**
 * Generic elevated card wrapper. Purely visual - callers keep owning their
 * own content/data. Optional parts (Card.Header/Title/Description/Content/
 * Footer) give every card the same internal rhythm.
 */
function Card({ as: Tag = 'div', hover = false, className = '', children, ...rest }) {
  const classes = ['card', hover ? 'card-hover' : '', className].filter(Boolean).join(' ');
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}

function CardHeader({ className = '', actions, children }) {
  return (
    <div className={`card__header ${className}`}>
      <div className="card__header-text">{children}</div>
      {actions && <div className="card__header-actions">{actions}</div>}
    </div>
  );
}

function CardTitle({ as: Tag = 'h3', icon: Icon, className = '', children }) {
  return (
    <Tag className={`card__title ${className}`}>
      {Icon && (
        <span className="card__title-icon" aria-hidden="true">
          <Icon size={18} strokeWidth={2} />
        </span>
      )}
      {children}
    </Tag>
  );
}

function CardDescription({ className = '', children }) {
  return <p className={`card__description ${className}`}>{children}</p>;
}

function CardContent({ className = '', children }) {
  return <div className={`card__content ${className}`}>{children}</div>;
}

function CardFooter({ className = '', children }) {
  return <div className={`card__footer ${className}`}>{children}</div>;
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
