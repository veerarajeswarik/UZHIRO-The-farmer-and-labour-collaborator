import request from './apiClient';

export function estimateProfit(token, payload) {
  return request('/profit/estimate', { method: 'POST', body: payload, token });
}
