import { Session } from '../models/session.model.js';
import { User } from '../models/user.model.js';
import { createSessionToken, hashSessionToken } from '../utils/session-token.js';

const SESSION_LENGTH_MS = 24 * 60 * 60 * 1000;

function normaliseUsername(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

export async function startSession(req, res) {
  const username = normaliseUsername(req.body.username);
  if (username.length < 2 || username.length > 40) {
    return res.status(400).json({ error: { message: 'Username must be 2 to 40 characters' } });
  }

  const usernameKey = username.toLocaleLowerCase('en-US');
  const user = await User.findOneAndUpdate(
    { usernameKey },
    { $setOnInsert: { username, usernameKey } },
    { new: true, upsert: true, runValidators: true }
  );
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_LENGTH_MS);
  await Session.create({ userId: user._id, tokenHash: hashSessionToken(token), expiresAt });
  res.status(201).json({ data: { token, expiresAt, user: { id: user.id, username: user.username } } });
}

export async function currentSession(req, res) {
  res.json({ data: { expiresAt: req.session.expiresAt, user: { id: req.user.id, username: req.user.username } } });
}

export async function endSession(req, res) {
  req.session.revokedAt = new Date();
  await req.session.save();
  res.status(204).send();
}
