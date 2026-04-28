import axios from 'axios';

const API_URL = 'http://localhost:9000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  refresh: () =>
    api.post('/auth/refresh'),
};

export const chatAPI = {
  sendMessage: (message, tone = "witty", warmth = 0.7) =>
    api.post('/chat/send', { message, tone, warmth }),
  
  getHistory: (limit = 50) =>
    api.get(`/chat/history?limit=${limit}`),
  
  clearChat: () =>
    api.delete('/chat/clear'),
};

export const userAPI = {
  getProfile: () =>
    api.get('/user/profile'),
  
  updateProfile: (data) =>
    api.put('/user/profile', data),
};

export default api;