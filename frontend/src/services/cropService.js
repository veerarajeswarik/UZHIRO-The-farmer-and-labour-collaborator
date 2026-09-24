import request from './apiClient';

export function getCrops(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/crops${query ? `?${query}` : ''}`);
}

export function getCropById(id) {
  return request(`/crops/${id}`);
}

export function getRecommendations(token, season) {
  const query = season ? `?season=${encodeURIComponent(season)}` : '';
  return request(`/crops/recommendations${query}`, { token });
}

export function compareCrops(token, ids, season) {
  const params = new URLSearchParams({ ids: ids.join(',') });
  if (season) params.set('season', season);
  return request(`/crops/compare?${params.toString()}`, { token });
}

export function explainCrop(token, id, season) {
  const query = season ? `?season=${encodeURIComponent(season)}` : '';
  return request(`/crops/${id}/explain${query}`, { token });
}
