import { Task } from '../models/task.model.js';
import { weekRange } from '../utils/week.js';

const allowedFields = ['title', 'description', 'dueAt', 'startAt', 'endAt', 'priority', 'status'];

function payload(body) {
  return Object.fromEntries(Object.entries(body).filter(([key]) => allowedFields.includes(key)));
}

function setCompletionTimestamp(task) {
  task.completedAt = task.status === 'completed' ? task.completedAt ?? new Date() : null;
}

function todayRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export async function createTask(req, res) {
  const task = new Task({ ...payload(req.body), userId: req.user._id });
  setCompletionTimestamp(task);
  await task.save();
  res.status(201).json({ data: task });
}

export async function listTasks(req, res) {
  const { q, status, week, date, priority } = req.query;
  const filter = { userId: req.user._id };

  if (q?.trim()) filter.$text = { $search: q.trim() };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  if (week) {
    const { start, end } = weekRange(week);
    filter.dueAt = { $gte: start, $lt: end };
  } else if (date) {
    const d = new Date(date);
    if (Number.isNaN(d.valueOf())) return res.status(400).json({ error: { message: 'Invalid date parameter' } });
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    filter.dueAt = { $gte: start, $lt: end };
  }

  const tasks = await Task.find(filter).sort({ dueAt: 1, startAt: 1, createdAt: -1 });
  res.json({ data: tasks });
}

export async function listTasksToday(req, res) {
  const { start, end } = todayRange();
  const tasks = await Task.find({
    userId: req.user._id,
    dueAt: { $gte: start, $lt: end }
  }).sort({ startAt: 1, dueAt: 1, createdAt: -1 });
  res.json({ data: tasks });
}

export async function getTask(req, res) {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) return res.status(404).json({ error: { message: 'Task not found' } });
  res.json({ data: task });
}

export async function updateTask(req, res) {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) return res.status(404).json({ error: { message: 'Task not found' } });
  task.set(payload(req.body));
  setCompletionTimestamp(task);
  await task.save();
  res.json({ data: task });
}

export async function toggleTaskStatus(req, res) {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) return res.status(404).json({ error: { message: 'Task not found' } });
  task.status = task.status === 'completed' ? 'in_progress' : 'completed';
  setCompletionTimestamp(task);
  await task.save();
  res.json({ data: task });
}

export async function deleteTask(req, res) {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!task) return res.status(404).json({ error: { message: 'Task not found' } });
  res.status(204).send();
}

export async function weeklySummary(req, res) {
  const { start, end } = weekRange(req.query.week);

  const counts = await Task.aggregate([
    { $match: { userId: req.user._id, dueAt: { $gte: start, $lt: end } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const byStatus = Object.fromEntries(counts.map(({ _id, count }) => [_id, count]));

  const dailyAgg = await Task.aggregate([
    { $match: { userId: req.user._id, dueAt: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: {
          dayOfWeek: { $dayOfWeek: '$dueAt' },
          status: '$status'
        },
        count: { $sum: 1 }
      }
    }
  ]);

  const days = Array.from({ length: 7 }, (_, i) => ({ day: i + 1, completed: 0, in_progress: 0 }));
  for (const item of dailyAgg) {
    // MongoDB $dayOfWeek returns 1 (Sun) to 7 (Sat); map to 0-indexed Mon-Sun
    const mongoDay = item._id.dayOfWeek;
    const idx = mongoDay === 1 ? 6 : mongoDay - 2;
    if (days[idx]) days[idx][item._id.status] = item.count;
  }

  const completed = byStatus.completed ?? 0;
  const inProgress = byStatus.in_progress ?? 0;
  const total = completed + inProgress;

  res.json({
    data: {
      weekStart: start.toISOString(),
      weekEnd: end.toISOString(),
      open: inProgress,
      completed,
      total,
      progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
      daily: days
    }
  });
}
