import request from './apiClient';

export function getDashboard(token) {
  return request('/dashboard', { token });
}
