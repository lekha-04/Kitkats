import axios from 'axios';
import { BASE_URL } from '../config';

const api = axios.create({
  baseURL: BASE_URL,
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  refresh: () =>
    api.post('/auth/refresh'),
};

export const chatAPI = {
  newConversation: () =>
    api.post('/chat/new'),

  listConversations: () =>
    api.get('/chat/conversations'),

  sendMessage: (message, tone = "witty", warmth = 0.7, conversation_id = null) =>
    api.post('/chat/send', { message, tone, warmth, conversation_id }),

  getHistory: (conversation_id, limit = 50) =>
    api.get(`/chat/history?conversation_id=${conversation_id}&limit=${limit}`),

  clearChat: (conversation_id) =>
    api.delete(`/chat/clear?conversation_id=${conversation_id}`),

  deleteConversation: (conversation_id) =>
    api.delete(`/chat/conversation?conversation_id=${conversation_id}`),
};

export const streamMessage = async (message, tone, warmth, conversationId, onToken, onDone, onError) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message, tone, warmth, conversation_id: conversationId }),
    });
    if (!response.ok) throw new Error(`Server error ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        try {
          const parsed = JSON.parse(raw);
          if (parsed.done) { onDone(parsed.conversation_id); return; }
          if (parsed.token !== undefined) onToken(parsed.token, parsed.conversation_id);
        } catch (_) {}
      }
    }
    onDone(null);
  } catch (err) {
    onError(err);
  }
};

export const userAPI = {
  getProfile: () =>
    api.get('/user/profile'),
  
  updateProfile: (data) =>
    api.put('/user/profile', data),
};

export default api;