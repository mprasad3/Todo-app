import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { env } from './config/env.js';
import { taskRouter } from './routes/task.routes.js';
import { sessionRouter } from './routes/session.routes.js';

export const app = express();
app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: '32kb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/sessions', sessionRouter);
app.use('/api/v1/tasks', taskRouter);
app.use((_req, res) => res.status(404).json({ error: { message: 'Route not found' } }));
app.use((error, _req, res, _next) => {
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ error: { message: error.message } });
  }
  console.error(error);
  res.status(500).json({ error: { message: 'Internal server error' } });
});
