import request from './apiClient';

export function getMarketPrice(cropId) {
  return request(`/market-prices/${cropId}`);
}
