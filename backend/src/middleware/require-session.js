import { Session } from '../models/session.model.js';
import { hashSessionToken } from '../utils/session-token.js';

export async function requireSession(req, res, next) {
  const authorization = req.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) return res.status(401).json({ error: { message: 'A session token is required' } });

  const session = await Session.findOne({
    tokenHash: hashSessionToken(token),
    revokedAt: null,
    expiresAt: { $gt: new Date() }
  }).populate('userId');
  if (!session) return res.status(401).json({ error: { message: 'Session is invalid or expired' } });

  req.session = session;
  req.user = session.userId;
  next();
}
