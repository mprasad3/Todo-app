import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  listTasksToday,
  toggleTaskStatus,
  updateTask,
  weeklySummary
} from '../controllers/task.controller.js';
import { asyncHandler } from '../utils/async-handler.js';
import { requireSession } from '../middleware/require-session.js';

export const taskRouter = Router();
taskRouter.use(requireSession);

taskRouter.get('/summary/weekly', asyncHandler(weeklySummary));
taskRouter.get('/today', asyncHandler(listTasksToday));
taskRouter.route('/').get(asyncHandler(listTasks)).post(asyncHandler(createTask));
taskRouter.route('/:id').get(asyncHandler(getTask)).patch(asyncHandler(updateTask)).delete(asyncHandler(deleteTask));
taskRouter.patch('/:id/toggle', asyncHandler(toggleTaskStatus));
