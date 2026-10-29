import request from './apiClient';

// Marketplace browsing is farmer-only on the backend (protect + authorize('farmer')),
// so these calls must send the JWT like every other protected service.
export function searchLabourers(token, params = {}) {
  const cleaned = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined));
  const query = new URLSearchParams(cleaned).toString();
  return request(`/labourers${query ? `?${query}` : ''}`, { token });
}

export function getLabourerById(token, id) {
  return request(`/labourers/${id}`, { token });
}

export function getOwnLabourerProfile(token) {
  return request('/labourers/profile', { token });
}

export function updateOwnLabourerProfile(token, payload) {
  return request('/labourers/profile', { method: 'PUT', body: payload, token });
}
