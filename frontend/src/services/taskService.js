import request from './apiClient';

export function getTasks(token, params = {}) {
  const cleaned = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined));
  const query = new URLSearchParams(cleaned).toString();
  return request(`/tasks${query ? `?${query}` : ''}`, { token });
}

export function createTask(token, payload) {
  return request('/tasks', { method: 'POST', body: payload, token });
}

export function updateTask(token, id, payload) {
  return request(`/tasks/${id}`, { method: 'PUT', body: payload, token });
}

export function completeTask(token, id) {
  return request(`/tasks/${id}/complete`, { method: 'PUT', token });
}

export function deleteTask(token, id) {
  return request(`/tasks/${id}`, { method: 'DELETE', token });
}

export function generateTasksFromCrop(token, payload) {
  return request('/tasks/generate-from-crop', { method: 'POST', body: payload, token });
}
