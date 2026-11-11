import { request } from './httpClient.js';

export const taskService = {
  /**
   * GET /api/v1/tasks
   * Supports filtering by q, status, priority, week, date.
   */
  list(filters = {}) {
    return request('/tasks', { method: 'GET', params: filters });
  },

  /**
   * GET /api/v1/tasks/today
   * Returns tasks due today (UTC).
   */
  listToday() {
    return request('/tasks/today', { method: 'GET' });
  },

  /**
   * GET /api/v1/tasks/summary/weekly
   * Returns weekly open/completed/total counts, progressPercent, and Mon-Sun daily breakdown.
   */
  getWeeklySummary(week) {
    return request('/tasks/summary/weekly', {
      method: 'GET',
      params: week ? { week } : undefined,
    });
  },

  /**
   * POST /api/v1/tasks
   */
  create(taskData) {
    return request('/tasks', { method: 'POST', body: taskData });
  },

  /**
   * GET /api/v1/tasks/:id
   */
  getById(id) {
    return request(`/tasks/${id}`, { method: 'GET' });
  },

  /**
   * PATCH /api/v1/tasks/:id
   */
  update(id, updates) {
    return request(`/tasks/${id}`, { method: 'PATCH', body: updates });
  },

  /**
   * PATCH /api/v1/tasks/:id/toggle
   */
  toggleStatus(id) {
    return request(`/tasks/${id}/toggle`, { method: 'PATCH' });
  },

  /**
   * DELETE /api/v1/tasks/:id
   */
  remove(id) {
    return request(`/tasks/${id}`, { method: 'DELETE' });
  },
};
