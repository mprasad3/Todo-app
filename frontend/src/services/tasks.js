import { request } from './httpClient.js';

export const taskService = {
  list(filters = {}) {
    return request('/tasks', { method: 'GET', params: filters });
  },

  listToday() {
    return request('/tasks/today', { method: 'GET' });
  },

  getWeeklySummary(week) {
    return request('/tasks/summary/weekly', {
      method: 'GET',
      params: week ? { week } : undefined,
    });
  },

  create(taskData) {
    return request('/tasks', { method: 'POST', body: taskData });
  },

  getById(id) {
    return request(`/tasks/${id}`, { method: 'GET' });
  },

  update(id, updates) {
    return request(`/tasks/${id}`, { method: 'PATCH', body: updates });
  },

  toggleStatus(id) {
    return request(`/tasks/${id}/toggle`, { method: 'PATCH' });
  },

  remove(id) {
    return request(`/tasks/${id}`, { method: 'DELETE' });
  },
};
