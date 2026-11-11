import crypto from "node:crypto";
import express from "express";
import { and, asc, desc, eq, gt, gte, ilike, isNull, lt, or, sql } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { sessions, tasks, users } from "../../db/schema.ts";

const SESSION_LENGTH_MS = 24 * 60 * 60 * 1000;
const PRIORITIES = ["low", "medium", "high"];
const STATUSES = ["in_progress", "completed"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const asyncHandler = (handler: any) => (req: any, res: any, next: any) =>
  Promise.resolve(handler(req, res, next)).catch(next);

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

function utcDayStart(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function dayRange(input?: string) {
  const d = input ? new Date(input) : new Date();
  if (Number.isNaN(d.valueOf())) throw new HttpError(400, "Invalid date parameter");
  const start = utcDayStart(d);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function weekRange(input?: string) {
  const date = input ? new Date(input) : new Date();
  if (Number.isNaN(date.valueOf())) throw new HttpError(400, "Invalid week date");
  const day = date.getUTCDay() || 7;
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - day + 1));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  return { start, end };
}

function serializeTask(task: typeof tasks.$inferSelect) {
  const { id, ...rest } = task;
  return { _id: id, ...rest };
}

function parseDate(value: unknown, field: string, required = false) {
  if (value === null || value === undefined || value === "") {
    if (required) throw new HttpError(400, `${field} is required`);
    return null;
  }
  const d = new Date(value as string);
  if (Number.isNaN(d.valueOf())) throw new HttpError(400, `${field} must be a valid date`);
  return d;
}

// Validates and normalises the writable task fields present in the body.
function taskFields(body: any, isCreate: boolean) {
  const out: Record<string, any> = {};
  const has = (k: string) => Object.prototype.hasOwnProperty.call(body ?? {}, k);

  if (isCreate || has("title")) {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) throw new HttpError(400, "title is required");
    if (title.length > 140) throw new HttpError(400, "title must be at most 140 characters");
    out.title = title;
  }
  if (has("description")) {
    const description = typeof body.description === "string" ? body.description.trim() : "";
    if (description.length > 2000) throw new HttpError(400, "description must be at most 2000 characters");
    out.description = description;
  }
  if (isCreate || has("dueAt")) out.dueAt = parseDate(body.dueAt, "dueAt", true);
  if (has("startAt")) out.startAt = parseDate(body.startAt, "startAt");
  if (has("endAt")) out.endAt = parseDate(body.endAt, "endAt");
  if (has("priority")) {
    if (!PRIORITIES.includes(body.priority)) throw new HttpError(400, "priority must be low, medium or high");
    out.priority = body.priority;
  }
  if (has("status")) {
    if (!STATUSES.includes(body.status)) throw new HttpError(400, "status must be in_progress or completed");
    out.status = body.status;
  }
  return out;
}

async function findOwnedTask(req: any) {
  const id = req.params.id;
  if (!UUID_RE.test(id)) throw new HttpError(404, "Task not found");
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, req.user.id)));
  if (!task) throw new HttpError(404, "Task not found");
  return task;
}

const requireSession = asyncHandler(async (req: any, res: any, next: any) => {
  const authorization = req.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) return res.status(401).json({ error: { message: "A session token is required" } });

  const [row] = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(eq(sessions.tokenHash, hashToken(token)), isNull(sessions.revokedAt), gt(sessions.expiresAt, new Date()))
    );
  if (!row) return res.status(401).json({ error: { message: "Session is invalid or expired" } });

  req.session = row.session;
  req.user = row.user;
  next();
});

const app = express();
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ---- Sessions ----
const sessionRouter = express.Router();

sessionRouter.post(
  "/",
  asyncHandler(async (req: any, res: any) => {
    const raw = req.body?.username;
    const username = typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";
    if (username.length < 2 || username.length > 40) {
      throw new HttpError(400, "Username must be 2 to 40 characters");
    }
    const usernameKey = username.toLocaleLowerCase("en-US");

    await db.insert(users).values({ username, usernameKey }).onConflictDoNothing({ target: users.usernameKey });
    const [user] = await db.select().from(users).where(eq(users.usernameKey, usernameKey));

    const token = crypto.randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_LENGTH_MS);
    await db.insert(sessions).values({ userId: user.id, tokenHash: hashToken(token), expiresAt });

    res.status(201).json({ data: { token, expiresAt, user: { id: user.id, username: user.username } } });
  })
);

sessionRouter.get("/current", requireSession, (req: any, res: any) => {
  res.json({
    data: { expiresAt: req.session.expiresAt, user: { id: req.user.id, username: req.user.username } },
  });
});

sessionRouter.delete(
  "/current",
  requireSession,
  asyncHandler(async (req: any, res: any) => {
    await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, req.session.id));
    res.status(204).send();
  })
);

// ---- Tasks ----
const taskRouter = express.Router();
taskRouter.use(requireSession);

taskRouter.get(
  "/summary/weekly",
  asyncHandler(async (req: any, res: any) => {
    const { start, end } = weekRange(req.query.week);
    const rows = await db
      .select({ dueAt: tasks.dueAt, status: tasks.status })
      .from(tasks)
      .where(and(eq(tasks.userId, req.user.id), gte(tasks.dueAt, start), lt(tasks.dueAt, end)));

    const days = Array.from({ length: 7 }, (_, i) => ({ day: i + 1, completed: 0, in_progress: 0 }));
    let completed = 0;
    let inProgress = 0;
    for (const row of rows) {
      const idx = (row.dueAt.getUTCDay() + 6) % 7; // Monday = 0 ... Sunday = 6
      if (row.status === "completed") {
        completed++;
        days[idx].completed++;
      } else {
        inProgress++;
        days[idx].in_progress++;
      }
    }
    const total = completed + inProgress;

    res.json({
      data: {
        weekStart: start.toISOString(),
        weekEnd: end.toISOString(),
        open: inProgress,
        completed,
        total,
        progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
        daily: days,
      },
    });
  })
);

taskRouter.get(
  "/today",
  asyncHandler(async (req: any, res: any) => {
    const { start, end } = dayRange();
    const rows = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, req.user.id), gte(tasks.dueAt, start), lt(tasks.dueAt, end)))
      .orderBy(sql`${tasks.startAt} asc nulls first`, asc(tasks.dueAt), desc(tasks.createdAt));
    res.json({ data: rows.map(serializeTask) });
  })
);

taskRouter.get(
  "/",
  asyncHandler(async (req: any, res: any) => {
    const { q, status, priority, week, date } = req.query;
    const conditions = [eq(tasks.userId, req.user.id)];

    if (typeof q === "string" && q.trim()) {
      const pattern = `%${q.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
      conditions.push(or(ilike(tasks.title, pattern), ilike(tasks.description, pattern))!);
    }
    if (status) {
      if (!STATUSES.includes(status)) throw new HttpError(400, "Invalid status filter");
      conditions.push(eq(tasks.status, status));
    }
    if (priority) {
      if (!PRIORITIES.includes(priority)) throw new HttpError(400, "Invalid priority filter");
      conditions.push(eq(tasks.priority, priority));
    }
    if (week || date) {
      const { start, end } = week ? weekRange(week) : dayRange(date);
      conditions.push(gte(tasks.dueAt, start), lt(tasks.dueAt, end));
    }

    const rows = await db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(asc(tasks.dueAt), sql`${tasks.startAt} asc nulls first`, desc(tasks.createdAt));
    res.json({ data: rows.map(serializeTask) });
  })
);

taskRouter.post(
  "/",
  asyncHandler(async (req: any, res: any) => {
    const fields = taskFields(req.body, true);
    const status = fields.status ?? "in_progress";
    const [task] = await db
      .insert(tasks)
      .values({
        ...(fields as any),
        userId: req.user.id,
        status,
        completedAt: status === "completed" ? new Date() : null,
      })
      .returning();
    res.status(201).json({ data: serializeTask(task) });
  })
);

taskRouter.get(
  "/:id",
  asyncHandler(async (req: any, res: any) => {
    res.json({ data: serializeTask(await findOwnedTask(req)) });
  })
);

taskRouter.patch(
  "/:id",
  asyncHandler(async (req: any, res: any) => {
    const existing = await findOwnedTask(req);
    const fields = taskFields(req.body, false);
    const status = fields.status ?? existing.status;
    const [task] = await db
      .update(tasks)
      .set({
        ...fields,
        completedAt: status === "completed" ? existing.completedAt ?? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, existing.id))
      .returning();
    res.json({ data: serializeTask(task) });
  })
);

taskRouter.patch(
  "/:id/toggle",
  asyncHandler(async (req: any, res: any) => {
    const existing = await findOwnedTask(req);
    const status = existing.status === "completed" ? "in_progress" : "completed";
    const [task] = await db
      .update(tasks)
      .set({ status, completedAt: status === "completed" ? new Date() : null, updatedAt: new Date() })
      .where(eq(tasks.id, existing.id))
      .returning();
    res.json({ data: serializeTask(task) });
  })
);

taskRouter.delete(
  "/:id",
  asyncHandler(async (req: any, res: any) => {
    const existing = await findOwnedTask(req);
    await db.delete(tasks).where(eq(tasks.id, existing.id));
    res.status(204).send();
  })
);

app.use("/api/v1/sessions", sessionRouter);
app.use("/api/v1/tasks", taskRouter);

app.use((_req, res) => res.status(404).json({ error: { message: "Route not found" } }));
app.use((error: any, _req: any, res: any, _next: any) => {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: { message: error.message } });
  }
  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ error: { message: "Invalid JSON body" } });
  }
  console.error(error);
  res.status(500).json({ error: { message: "Internal server error" } });
});

export const config = {
  path: "/api/*",
};

export default app;
