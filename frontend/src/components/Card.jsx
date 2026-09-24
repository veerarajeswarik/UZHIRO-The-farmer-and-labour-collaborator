/**
 * Generic elevated card wrapper. Purely visual - callers keep owning their
 * own content/data.
 */
function Card({ as: Tag = 'div', hover = false, className = '', children, ...rest }) {
  const classes = ['card', hover ? 'card-hover' : '', className].filter(Boolean).join(' ');
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}

export default Card;
