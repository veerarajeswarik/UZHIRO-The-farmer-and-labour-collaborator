import request from './apiClient';

export function createHiringRequest(token, payload) {
  return request('/hiring', { method: 'POST', body: payload, token });
}

export function getFarmerRequests(token) {
  return request('/hiring/farmer', { token });
}

export function getLabourerRequests(token) {
  return request('/hiring/labourer', { token });
}

export function updateHiringStatus(token, id, status) {
  return request(`/hiring/${id}/status`, { method: 'PUT', body: { status }, token });
}
