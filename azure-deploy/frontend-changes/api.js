// ─── AZURE VERSION: api.js ───
// This replaces /app/frontend/src/api.js
// Key change: Uses relative '/api' URL instead of REACT_APP_BACKEND_URL
// Azure Static Web Apps automatically proxies /api/* to Azure Functions

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// ─── Articles ───
export const getArticles = (category) => {
  const params = category && category !== 'All Topics' ? { category } : {};
  return api.get('/articles', { params }).then(r => r.data);
};

export const getArticle = (slug) => api.get(`/articles/${slug}`).then(r => r.data);

// NOTE: Azure Functions routes differ slightly for POST/PUT/DELETE
// because managed functions have route limitations.
// POST uses /articles_create, PUT uses /articles/{slug}/update, DELETE uses /articles/{slug}/delete
export const createArticle = (data) => api.post('/articles_create', data).then(r => r.data);

export const updateArticle = (slug, data) => api.put(`/articles/${slug}/update`, data).then(r => r.data);

export const deleteArticle = (slug) => api.delete(`/articles/${slug}/delete`).then(r => r.data);

// ─── Categories ───
export const getCategories = () => api.get('/categories').then(r => r.data);

export const createCategory = (data) => api.post('/categories_create', data).then(r => r.data);

export const deleteCategory = (id) => api.delete(`/categories/${id}`).then(r => r.data);

// ─── Subscribers ───
export const subscribe = (email) => api.post('/subscribe', { email }).then(r => r.data);

export const getSubscribers = () => api.get('/subscribers').then(r => r.data);
