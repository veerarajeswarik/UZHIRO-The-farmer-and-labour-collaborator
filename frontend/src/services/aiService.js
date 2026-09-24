import request from './apiClient';

export function sendChatMessage(token, payload) {
  return request('/ai/chat', { method: 'POST', body: payload, token });
}

export function getChatHistory(token) {
  return request('/ai/history', { token });
}

export function clearChatHistory(token) {
  return request('/ai/history', { method: 'DELETE', token });
}
