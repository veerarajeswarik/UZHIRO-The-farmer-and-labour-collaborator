import request from './apiClient';

export function getArticles(params = {}) {
  const cleaned = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
  const query = new URLSearchParams(cleaned).toString();
  return request(`/learning${query ? `?${query}` : ''}`);
}

export function getArticleById(id) {
  return request(`/learning/${id}`);
}
