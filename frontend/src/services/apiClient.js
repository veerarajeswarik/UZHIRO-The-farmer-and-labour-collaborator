/**
 * Thin fetch wrapper shared by every service module (auth, farmers, crops,
 * ...). Centralizes the API base URL, JSON handling, and the
 * {success, data | message} response contract used by the backend.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, { method = 'GET', body, token, headers = {} } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok || !payload || payload.success === false) {
    const message = payload?.message || 'Something went wrong. Please try again.';
    throw new Error(message);
  }

  return payload.data;
}

export default request;
