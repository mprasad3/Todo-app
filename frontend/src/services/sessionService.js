import { request } from './httpClient.js';

export const sessionService = {
  login(username) {
    return request('/sessions', {
      method: 'POST',
      body: { username },
      skipAuth: true,
    });
  },

  getCurrent() {
    return request('/sessions/current', { method: 'GET' });
  },

  logout() {
    return request('/sessions/current', { method: 'DELETE' });
  },
};
