/**
 * Thin fetch wrapper shared by every service module (auth, farmers, crops,
 * ...). Centralizes the API base URL, JSON handling, and the
 * {success, data | message} response contract used by the backend.
 *
 * VITE_API_URL is required for production builds (vite.config.js refuses to
 * build without it); the localhost fallback only applies to `npm run dev`.
 */
function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  // Dev only: when the site is opened via the Vite "Network" URL (e.g. from a
  // phone on the same Wi-Fi), "localhost" would mean that device, not this
  // computer - so call the backend on the same host the page came from.
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const url = new URL(configured);
    const pageHost = window.location.hostname;
    if (['localhost', '127.0.0.1'].includes(url.hostname) && !['localhost', '127.0.0.1'].includes(pageHost)) {
      url.hostname = pageHost;
      return url.toString().replace(/\/$/, '');
    }
  }
  return configured;
}

const API_BASE_URL = resolveApiBaseUrl();

// Long enough for a free-tier host waking from sleep or a slow AI answer,
// short enough that a dead server doesn't leave a spinner forever.
const REQUEST_TIMEOUT_MS = 60000;

export const NETWORK_ERROR_MESSAGE = "Can't reach the UZHIRO server. Check your internet connection and try again.";
export const TIMEOUT_ERROR_MESSAGE =
  'The server is taking too long to respond (it may be starting up). Please try again in a moment.';

function networkError(message, cause) {
  const error = new Error(message);
  // status 0 = the request never got an HTTP response (offline, server down,
  // CORS refusal, timeout). The browser's raw "Failed to fetch" stays in the
  // console via `cause`, never on screen.
  error.status = 0;
  error.isNetworkError = true;
  error.cause = cause;
  return error;
}

async function request(path, { method = 'GET', body, token, headers = {} } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    console.error(`[api] ${method} ${path} failed:`, err);
    throw networkError(err.name === 'AbortError' ? TIMEOUT_ERROR_MESSAGE : NETWORK_ERROR_MESSAGE, err);
  } finally {
    clearTimeout(timer);
  }

  let payload;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok || !payload || payload.success === false) {
    const message = payload?.message || 'Something went wrong. Please try again.';
    const error = new Error(message);
    // Expose the HTTP status so callers can tell 401/403/404/5xx apart.
    error.status = res.status;
    throw error;
  }

  return payload.data;
}

export default request;
