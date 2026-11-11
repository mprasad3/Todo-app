import { useCallback, useEffect, useState } from 'react';
import { taskService } from '../services/tasks.js';
import { getTodayDateStr, shiftDateStr } from '../utils/date.js';

const EMPTY_SUMMARY = {
  weekStart: null,
  weekEnd: null,
  open: 0,
  completed: 0,
  total: 0,
  progressPercent: 0,
  daily: [],
};

export function useTasks(isAuthenticated) {
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateStr());
  const [viewMode, setViewMode] = useState('day');
  const [statusFilter, setStatusFilter] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const todayStr = getTodayDateStr();
      const tasksPromise =
        viewMode === 'week'
          ? taskService.list({ week: selectedDate, ...(statusFilter ? { status: statusFilter } : {}) })
          : selectedDate === todayStr && !statusFilter
            ? taskService.listToday()
            : taskService.list({ date: selectedDate, ...(statusFilter ? { status: statusFilter } : {}) });

      const summaryPromise = taskService.getWeeklySummary(selectedDate);

      const [taskList, summary] = await Promise.all([tasksPromise, summaryPromise]);
      setTasks(Array.isArray(taskList) ? taskList : []);
      setWeeklySummary(summary || EMPTY_SUMMARY);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, selectedDate, viewMode, statusFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectDate = useCallback((dateStr) => {
    setSelectedDate(dateStr);
    setViewMode('day');
    setStatusFilter(null);
  }, []);

  const shiftWeek = useCallback((deltaWeeks) => {
    setSelectedDate((prev) => shiftDateStr(prev, deltaWeeks * 7));
  }, []);

  const toggleWeekView = useCallback(() => {
    setStatusFilter(null);
    setViewMode((prev) => (prev === 'week' ? 'day' : 'week'));
  }, []);

  const filterBySummaryCard = useCallback((targetStatus) => {
    setViewMode('week');
    setStatusFilter((prev) => (prev === targetStatus ? null : targetStatus));
  }, []);

  const createTask = useCallback(
    async (payload) => {
      setIsSaving(true);
      setError(null);
      try {
        const created = await taskService.create(payload);
        await refresh();
        return created;
      } catch (err) {
        setError(err.message || 'Failed to create task');
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [refresh]
  );

  const updateTask = useCallback(
    async (id, payload) => {
      setIsSaving(true);
      setError(null);
      try {
        const updated = await taskService.update(id, payload);
        await refresh();
        return updated;
      } catch (err) {
        setError(err.message || 'Failed to update task');
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [refresh]
  );

  const fetchTaskById = useCallback(async (id) => {
    return taskService.getById(id);
  }, []);

  const toggleTask = useCallback(
    async (id) => {
      const previous = tasks;
      setTasks((curr) =>
        curr.map((item) =>
          item._id === id
            ? { ...item, status: item.status === 'completed' ? 'in_progress' : 'completed' }
            : item
        )
      );
      try {
        await taskService.toggleStatus(id);
        await refresh();
      } catch (err) {
        setTasks(previous);
        setError(err.message || 'Failed to update task status');
      }
    },
    [tasks, refresh]
  );

  const deleteTask = useCallback(
    async (id) => {
      const previous = tasks;
      setTasks((curr) => curr.filter((item) => item._id !== id));
      try {
        await taskService.remove(id);
        await refresh();
      } catch (err) {
        setTasks(previous);
        setError(err.message || 'Failed to delete task');
      }
    },
    [tasks, refresh]
  );

  return {
    selectedDate,
    viewMode,
    statusFilter,
    tasks,
    weeklySummary,
    isLoading,
    isSaving,
    error,
    setError,
    refresh,
    selectDate,
    shiftWeek,
    toggleWeekView,
    filterBySummaryCard,
    createTask,
    updateTask,
    fetchTaskById,
    toggleTask,
    deleteTask,
  };
}
