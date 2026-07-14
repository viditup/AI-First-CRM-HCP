import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const hcpApi = {
  list: (params) => client.get('/hcps', { params }),
  get: (id) => client.get(`/hcps/${id}`),
  create: (data) => client.post('/hcps', data),
};

export const interactionApi = {
  list: (params) => client.get('/interactions', { params }),
  get: (id) => client.get(`/interactions/${id}`),
  create: (data) => client.post('/interactions', data),
  update: (id, data) => client.put(`/interactions/${id}`, data),
  delete: (id) => client.delete(`/interactions/${id}`),
};

export const followUpApi = {
  list: (params) => client.get('/follow-ups', { params }),
  create: (data) => client.post('/follow-ups', data),
};

export const chatApi = {
  send: (message, conversationId) =>
    client.post('/chat', { message, conversation_id: conversationId }),
};

export default client;
