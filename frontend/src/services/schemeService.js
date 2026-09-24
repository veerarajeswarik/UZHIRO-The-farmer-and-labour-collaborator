import request from './apiClient';

export function getSchemes(params = {}) {
  const cleaned = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
  const query = new URLSearchParams(cleaned).toString();
  return request(`/schemes${query ? `?${query}` : ''}`);
}

export function getSchemeById(id) {
  return request(`/schemes/${id}`);
}
