import { Link } from 'react-router-dom';

/**
 * Shared premium button. Renders a <Link> when `to` is given, otherwise a
 * native <button> so existing onClick/type/disabled/form-submit call sites
 * keep working unchanged.
 */
function Button({
  variant = 'primary',
  size,
  to,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  children,
  ...rest
}) {
  const classes = ['btn', `btn-${variant}`, size ? `btn-${size}` : '', className]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon size={16} strokeWidth={2} aria-hidden="true" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={16} strokeWidth={2} aria-hidden="true" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}

export default Button;
