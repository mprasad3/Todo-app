import { request } from './httpClient.js';

export const sessionService = {
  /**
   * POST /api/v1/sessions
   * Creates or finds user by username and issues a Bearer session token.
   */
  login(username) {
    return request('/sessions', {
      method: 'POST',
      body: { username },
      skipAuth: true,
    });
  },

  /**
   * GET /api/v1/sessions/current
   * Validates the stored token and retrieves the current user & expiration.
   */
  getCurrent() {
    return request('/sessions/current', { method: 'GET' });
  },

  /**
   * DELETE /api/v1/sessions/current
   * Revokes the active session token.
   */
  logout() {
    return request('/sessions/current', { method: 'DELETE' });
  },
};
