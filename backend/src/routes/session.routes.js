import { Router } from 'express';
import { currentSession, endSession, startSession } from '../controllers/session.controller.js';
import { requireSession } from '../middleware/require-session.js';
import { asyncHandler } from '../utils/async-handler.js';

export const sessionRouter = Router();
sessionRouter.post('/', asyncHandler(startSession));
sessionRouter.get('/current', requireSession, asyncHandler(currentSession));
sessionRouter.delete('/current', requireSession, asyncHandler(endSession));
