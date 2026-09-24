import request from './apiClient';

export function getProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/products${query ? `?${query}` : ''}`);
}

export function getInputChecklist(token, cropId, landAreaAcres) {
  const query = landAreaAcres ? `?landAreaAcres=${encodeURIComponent(landAreaAcres)}` : '';
  return request(`/products/for-crop/${cropId}${query}`, { token });
}
