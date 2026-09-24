import request from './apiClient';

export function getFarmerProfile(token) {
  return request('/farmers/profile', { token });
}

export function updateFarmerProfile(token, payload) {
  return request('/farmers/profile', { method: 'PUT', body: payload, token });
}
