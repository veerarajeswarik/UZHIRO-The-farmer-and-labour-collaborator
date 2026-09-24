import request from './apiClient';

// Reports
export const getReports = (token) => request('/admin/reports', { token });

// Users
export const listUsers = (token, params = {}) => {
  const cleaned = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined));
  const query = new URLSearchParams(cleaned).toString();
  return request(`/admin/users${query ? `?${query}` : ''}`, { token });
};
export const deactivateUser = (token, id) => request(`/admin/users/${id}/deactivate`, { method: 'PUT', token });
export const activateUser = (token, id) => request(`/admin/users/${id}/activate`, { method: 'PUT', token });
export const deleteUser = (token, id) => request(`/admin/users/${id}`, { method: 'DELETE', token });

// Crops
export const listAdminCrops = (token) => request('/admin/crops', { token });
export const createAdminCrop = (token, payload) => request('/admin/crops', { method: 'POST', body: payload, token });
export const updateAdminCrop = (token, id, payload) => request(`/admin/crops/${id}`, { method: 'PUT', body: payload, token });
export const deleteAdminCrop = (token, id) => request(`/admin/crops/${id}`, { method: 'DELETE', token });

// Products
export const listAdminProducts = (token) => request('/admin/products', { token });
export const createAdminProduct = (token, payload) => request('/admin/products', { method: 'POST', body: payload, token });
export const updateAdminProduct = (token, id, payload) => request(`/admin/products/${id}`, { method: 'PUT', body: payload, token });
export const deleteAdminProduct = (token, id) => request(`/admin/products/${id}`, { method: 'DELETE', token });

// Market prices
export const listAdminMarketPrices = (token) => request('/admin/market-prices', { token });
export const createAdminMarketPrice = (token, payload) => request('/admin/market-prices', { method: 'POST', body: payload, token });
export const deleteAdminMarketPrice = (token, id) => request(`/admin/market-prices/${id}`, { method: 'DELETE', token });

// Learning
export const listAdminArticles = (token) => request('/admin/learning', { token });
export const createAdminArticle = (token, payload) => request('/admin/learning', { method: 'POST', body: payload, token });
export const updateAdminArticle = (token, id, payload) => request(`/admin/learning/${id}`, { method: 'PUT', body: payload, token });
export const deleteAdminArticle = (token, id) => request(`/admin/learning/${id}`, { method: 'DELETE', token });

// Schemes
export const listAdminSchemes = (token) => request('/admin/schemes', { token });
export const createAdminScheme = (token, payload) => request('/admin/schemes', { method: 'POST', body: payload, token });
export const updateAdminScheme = (token, id, payload) => request(`/admin/schemes/${id}`, { method: 'PUT', body: payload, token });
export const deleteAdminScheme = (token, id) => request(`/admin/schemes/${id}`, { method: 'DELETE', token });
