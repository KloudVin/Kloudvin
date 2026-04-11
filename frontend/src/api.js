import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: `${API}/api`,
  withCredentials: true,
});

export const getArticles = (category) => {
  const params = category && category !== 'All Topics' ? { category } : {};
  return api.get('/articles', { params }).then(r => r.data);
};

export const getArticle = (slug) => api.get(`/articles/${slug}`).then(r => r.data);

export const createArticle = (data) => api.post('/articles', data).then(r => r.data);

export const updateArticle = (slug, data) => api.put(`/articles/${slug}`, data).then(r => r.data);

export const deleteArticle = (slug) => api.delete(`/articles/${slug}`).then(r => r.data);

export const getCategories = () => api.get('/categories').then(r => r.data);

export const createCategory = (data) => api.post('/categories', data).then(r => r.data);

export const deleteCategory = (id) => api.delete(`/categories/${id}`).then(r => r.data);

export const subscribe = (email) => api.post('/subscribe', { email }).then(r => r.data);

export const getSubscribers = () => api.get('/subscribers').then(r => r.data);
