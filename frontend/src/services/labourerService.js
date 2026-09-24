import request from './apiClient';

export function searchLabourers(params = {}) {
  const cleaned = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined));
  const query = new URLSearchParams(cleaned).toString();
  return request(`/labourers${query ? `?${query}` : ''}`);
}

export function getLabourerById(id) {
  return request(`/labourers/${id}`);
}

export function getOwnLabourerProfile(token) {
  return request('/labourers/profile', { token });
}

export function updateOwnLabourerProfile(token, payload) {
  return request('/labourers/profile', { method: 'PUT', body: payload, token });
}
