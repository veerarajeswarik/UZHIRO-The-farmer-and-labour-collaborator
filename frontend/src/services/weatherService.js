import request from './apiClient';

export function getWeather(token, location) {
  const query = location ? `?location=${encodeURIComponent(location)}` : '';
  return request(`/weather${query}`, { token });
}
