import request from './apiClient';

export function register(payload) {
  return request('/auth/register', { method: 'POST', body: payload });
}

export function login(payload) {
  return request('/auth/login', { method: 'POST', body: payload });
}

export function getMe(token) {
  return request('/auth/me', { token });
}
