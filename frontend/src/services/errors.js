/**
 * Turns an API failure into a farmer-friendly message. Relies on
 * `err.status`, attached by apiClient.js:
 *  - 0            network failure / timeout (apiClient already wrote a friendly message)
 *  - 400/409/422  validation messages written for users - shown as-is
 *  - 429          rate-limit message from the server - shown as-is
 *  - 401/403/404  mapped to plain messages
 *  - 5xx / other  generic message; details go to the developer console only
 *
 * `passThrough` lists extra statuses whose server message should be shown
 * verbatim - e.g. Login passes [401, 403] so "Invalid email or password"
 * isn't turned into "Your session has expired".
 */
export function friendlyError(err, subject = 'This information', { passThrough = [] } = {}) {
  const status = err?.status;

  if (status === 0 && err.message) return err.message;
  if (passThrough.includes(status) && err.message) return err.message;
  if ((status === 400 || status === 409 || status === 422 || status === 429) && err.message) return err.message;
  if (status === 401) return 'Your session has expired. Please log in again.';
  if (status === 403) return "You don't have permission to access this.";
  if (status === 404) return `${subject} was not found.`;

  console.error(err);
  return 'Unable to load this information right now. Please try again.';
}

export default friendlyError;
