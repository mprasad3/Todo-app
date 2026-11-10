# Todo Task Manager API

> **SDE-1 Assessment Project** — "Manage What To Do" mobile app backend

A RESTful API built with **Node.js / Express v5 / MongoDB** that powers a mobile Todo Task Manager. Users log in with just a username (no password), manage tasks with start/end times, search & filter, and track weekly progress.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [API Reference](#api-reference)
  - [Sessions](#sessions)
  - [Tasks](#tasks)
- [Error Handling](#error-handling)
- [Data Models](#data-models)

---

## Tech Stack

| Layer        | Technology              |
|--------------|-------------------------|
| Runtime      | Node.js v20+            |
| Framework    | Express v5              |
| Database     | MongoDB (via Mongoose)  |
| Auth         | Bearer token (SHA-256 hashed session) |
| Date utility | Native `Date` / UTC     |

---

## Project Structure

```
backend/
├── src/
│   ├── app.js                      # Express app setup & middleware
│   ├── server.js                   # HTTP server entry point
│   ├── config/
│   │   ├── database.js             # MongoDB connection
│   │   └── env.js                  # Environment variable loading
│   ├── controllers/
│   │   ├── session.controller.js   # Login / logout / current session
│   │   └── task.controller.js      # Full task CRUD + summary
│   ├── middleware/
│   │   └── require-session.js      # Bearer token auth middleware
│   ├── models/
│   │   ├── task.model.js           # Task schema
│   │   ├── user.model.js           # User schema
│   │   └── session.model.js        # Session schema
│   ├── routes/
│   │   ├── session.routes.js       # /api/v1/sessions
│   │   └── task.routes.js          # /api/v1/tasks
│   └── utils/
│       ├── async-handler.js        # asyncHandler wrapper
│       ├── session-token.js        # Token creation & hashing
│       └── week.js                 # weekRange() helper
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v20 or later
- MongoDB (local or Atlas)

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Start development server
npm run dev

# 5. Start production server
npm start
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/todo_assessment
CLIENT_ORIGIN=http://localhost:5173
```

| Variable         | Required | Default                        | Description                               |
|------------------|----------|--------------------------------|-------------------------------------------|
| `PORT`           | No       | `4000`                         | HTTP port the server listens on           |
| `MONGODB_URI`    | **Yes**  | —                              | MongoDB connection string                 |
| `NODE_ENV`       | No       | `development`                  | `development` or `production`             |
| `CLIENT_ORIGIN`  | No       | `http://localhost:5173`        | Allowed CORS origin (your frontend URL)   |

---

## Authentication

This API uses **username-only authentication** (no passwords). The flow:

1. `POST /api/v1/sessions` with `{ "username": "alice" }` → returns a **Bearer token**
2. Include the token in every subsequent request:
   ```
   Authorization: Bearer <token>
   ```
3. `DELETE /api/v1/sessions/current` to log out (revokes the token)

Tokens are stored **hashed** (SHA-256) in MongoDB. The raw token is only returned once at login.

---

## API Reference

**Base URL:** `http://localhost:3000/api/v1`

---

### Sessions

#### `POST /api/v1/sessions` — Login

Creates a new user (if first time) or finds existing, then issues a session token.

**Request**

```http
POST /api/v1/sessions
Content-Type: application/json

{
  "username": "alice"
}
```

**Response `201 Created`**

```json
{
  "data": {
    "token": "aef3c2d1b4...",
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "user": {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
      "username": "alice"
    }
  }
}
```

| Field       | Type   | Description                                      |
|-------------|--------|--------------------------------------------------|
| `token`     | string | Raw Bearer token — save this, it won't be shown again |
| `expiresAt` | ISO 8601 | When the session expires                       |
| `user`      | object | Logged-in user info                             |

---

#### `GET /api/v1/sessions/current` — Whoami

Returns the authenticated user's info.

**Request**

```http
GET /api/v1/sessions/current
Authorization: Bearer aef3c2d1b4...
```

**Response `200 OK`**

```json
{
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
      "username": "alice"
    },
    "session": {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e2",
      "expiresAt": "2025-12-31T23:59:59.000Z"
    }
  }
}
```

---

#### `DELETE /api/v1/sessions/current` — Logout

Revokes the current session token.

**Request**

```http
DELETE /api/v1/sessions/current
Authorization: Bearer aef3c2d1b4...
```

**Response `204 No Content`** (empty body)

---

### Tasks

All task endpoints require `Authorization: Bearer <token>`.

---

#### `GET /api/v1/tasks` — List Tasks

Returns all tasks for the authenticated user. Supports filtering and search.

**Query Parameters**

| Parameter  | Type   | Description                                                    |
|------------|--------|----------------------------------------------------------------|
| `q`        | string | Full-text search across title and description                  |
| `status`   | string | Filter by `in_progress` or `completed`                        |
| `priority` | string | Filter by `low`, `medium`, or `high`                          |
| `week`     | string | ISO date string — returns tasks for that calendar week (Mon–Sun) |
| `date`     | string | ISO date string (e.g. `2025-06-15`) — returns tasks for that day |

> `week` and `date` are mutually exclusive; `week` takes precedence.

**Request**

```http
GET /api/v1/tasks?status=in_progress&date=2025-06-15
Authorization: Bearer aef3c2d1b4...
```

**Response `200 OK`**

```json
{
  "data": [
    {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e3",
      "userId": "64a1b2c3d4e5f6a7b8c9d0e1",
      "title": "Design wireframes",
      "description": "Create Figma mockups for onboarding screen",
      "dueAt": "2025-06-15T00:00:00.000Z",
      "startAt": "2025-06-15T09:00:00.000Z",
      "endAt": "2025-06-15T11:00:00.000Z",
      "priority": "high",
      "status": "in_progress",
      "completedAt": null,
      "createdAt": "2025-06-14T10:00:00.000Z",
      "updatedAt": "2025-06-14T10:00:00.000Z"
    }
  ]
}
```

---

#### `GET /api/v1/tasks/today` — Tasks for Today

Returns tasks due today (UTC), sorted by `startAt` then `dueAt`.

**Request**

```http
GET /api/v1/tasks/today
Authorization: Bearer aef3c2d1b4...
```

**Response `200 OK`**

```json
{
  "data": [
    {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e3",
      "title": "Design wireframes",
      "dueAt": "2025-06-15T00:00:00.000Z",
      "startAt": "2025-06-15T09:00:00.000Z",
      "endAt": "2025-06-15T11:00:00.000Z",
      "status": "in_progress",
      "priority": "high"
    }
  ]
}
```

---

#### `POST /api/v1/tasks` — Create Task

Creates a new task.

**Request**

```http
POST /api/v1/tasks
Authorization: Bearer aef3c2d1b4...
Content-Type: application/json

{
  "title": "Design wireframes",
  "description": "Create Figma mockups for onboarding screen",
  "dueAt": "2025-06-15T00:00:00.000Z",
  "startAt": "2025-06-15T09:00:00.000Z",
  "endAt": "2025-06-15T11:00:00.000Z",
  "priority": "high"
}
```

**Body Fields**

| Field         | Type   | Required | Description                                       |
|---------------|--------|----------|---------------------------------------------------|
| `title`       | string | Yes      | Task title (max 140 chars)                        |
| `description` | string | No       | Task description (max 2000 chars)                 |
| `dueAt`       | ISO 8601 | Yes    | Due date/time                                     |
| `startAt`     | ISO 8601 | No     | Scheduled start time                              |
| `endAt`       | ISO 8601 | No     | Scheduled end time                                |
| `priority`    | string | No       | `low`, `medium` (default), or `high`              |
| `status`      | string | No       | `in_progress` (default) or `completed`            |

**Response `201 Created`**

```json
{
  "data": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e3",
    "userId": "64a1b2c3d4e5f6a7b8c9d0e1",
    "title": "Design wireframes",
    "description": "Create Figma mockups for onboarding screen",
    "dueAt": "2025-06-15T00:00:00.000Z",
    "startAt": "2025-06-15T09:00:00.000Z",
    "endAt": "2025-06-15T11:00:00.000Z",
    "priority": "high",
    "status": "in_progress",
    "completedAt": null,
    "createdAt": "2025-06-14T10:00:00.000Z",
    "updatedAt": "2025-06-14T10:00:00.000Z"
  }
}
```

---

#### `GET /api/v1/tasks/:id` — Get Single Task

Returns one task by its ID.

**Request**

```http
GET /api/v1/tasks/64a1b2c3d4e5f6a7b8c9d0e3
Authorization: Bearer aef3c2d1b4...
```

**Response `200 OK`**

```json
{
  "data": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e3",
    "title": "Design wireframes",
    "status": "in_progress",
    ...
  }
}
```

**Response `404 Not Found`**

```json
{
  "error": {
    "message": "Task not found"
  }
}
```

---

#### `PATCH /api/v1/tasks/:id` — Update Task

Partially updates a task. Only include fields you want to change.

**Request**

```http
PATCH /api/v1/tasks/64a1b2c3d4e5f6a7b8c9d0e3
Authorization: Bearer aef3c2d1b4...
Content-Type: application/json

{
  "title": "Design wireframes v2",
  "priority": "medium",
  "status": "completed"
}
```

**Updatable Fields:** `title`, `description`, `dueAt`, `startAt`, `endAt`, `priority`, `status`

> Setting `status` to `completed` automatically sets `completedAt` timestamp.  
> Setting `status` back to `in_progress` clears `completedAt`.

**Response `200 OK`** — returns the updated task object.

---

#### `PATCH /api/v1/tasks/:id/toggle` — Toggle Task Status

Toggles a task between `in_progress` ↔ `completed`. No request body needed.

**Request**

```http
PATCH /api/v1/tasks/64a1b2c3d4e5f6a7b8c9d0e3/toggle
Authorization: Bearer aef3c2d1b4...
```

**Response `200 OK`**

```json
{
  "data": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e3",
    "title": "Design wireframes",
    "status": "completed",
    "completedAt": "2025-06-15T14:30:00.000Z",
    ...
  }
}
```

---

#### `DELETE /api/v1/tasks/:id` — Delete Task

Permanently deletes a task.

**Request**

```http
DELETE /api/v1/tasks/64a1b2c3d4e5f6a7b8c9d0e3
Authorization: Bearer aef3c2d1b4...
```

**Response `204 No Content`** (empty body)

---

#### `GET /api/v1/tasks/summary/weekly` — Weekly Summary

Returns completion statistics for a calendar week (Mon–Sun), plus a day-by-day breakdown for progress visualization.

**Query Parameters**

| Parameter | Type     | Description                                                              |
|-----------|----------|--------------------------------------------------------------------------|
| `week`    | string   | Any ISO date within the desired week (e.g. `2025-06-15`). Defaults to current week. |

**Request**

```http
GET /api/v1/tasks/summary/weekly?week=2025-06-15
Authorization: Bearer aef3c2d1b4...
```

**Response `200 OK`**

```json
{
  "data": {
    "weekStart": "2025-06-09T00:00:00.000Z",
    "weekEnd": "2025-06-16T00:00:00.000Z",
    "open": 3,
    "completed": 7,
    "total": 10,
    "progressPercent": 70,
    "daily": [
      { "day": 1, "completed": 2, "in_progress": 1 },
      { "day": 2, "completed": 1, "in_progress": 0 },
      { "day": 3, "completed": 1, "in_progress": 1 },
      { "day": 4, "completed": 2, "in_progress": 0 },
      { "day": 5, "completed": 1, "in_progress": 1 },
      { "day": 6, "completed": 0, "in_progress": 0 },
      { "day": 7, "completed": 0, "in_progress": 0 }
    ]
  }
}
```

**`daily` array:** Index 0 = Monday, Index 6 = Sunday. Each entry has `completed` and `in_progress` counts.

---

## Error Handling

All errors follow a consistent shape:

```json
{
  "error": {
    "message": "Human-readable error description"
  }
}
```

| HTTP Status | Meaning                                     |
|-------------|---------------------------------------------|
| `400`       | Bad request (invalid input, malformed date) |
| `401`       | Missing or invalid Bearer token             |
| `403`       | Forbidden (token valid but revoked/expired) |
| `404`       | Resource not found                          |
| `500`       | Unexpected server error                     |

---

## Data Models

### User

```js
{
  _id:         ObjectId,
  username:    String,       // display name
  usernameKey: String,       // normalized lowercase for lookup
  createdAt:   Date,
  updatedAt:   Date
}
```

### Session

```js
{
  _id:       ObjectId,
  userId:    ObjectId,       // ref → User
  tokenHash: String,         // SHA-256 hash of raw Bearer token
  expiresAt: Date,
  revokedAt: Date | null,    // set on logout
  createdAt: Date,
  updatedAt: Date
}
```

### Task

```js
{
  _id:         ObjectId,
  userId:      ObjectId,     // ref → User
  title:       String,       // max 140 chars
  description: String,       // max 2000 chars
  dueAt:       Date,         // required — the task's due date
  startAt:     Date | null,  // optional scheduled start time
  endAt:       Date | null,  // optional scheduled end time
  priority:    "low" | "medium" | "high",
  status:      "in_progress" | "completed",
  completedAt: Date | null,  // auto-set when status → completed
  createdAt:   Date,
  updatedAt:   Date
}
```

**Indexes:**
- `{ userId, dueAt, status }` — compound index for efficient filtered queries
- `{ title: "text", description: "text" }` — full-text search index

---

## Quick Reference

| Method   | Endpoint                        | Auth | Description              |
|----------|---------------------------------|------|--------------------------|
| `POST`   | `/api/v1/sessions`              | No   | Login (username only)    |
| `GET`    | `/api/v1/sessions/current`      | Yes  | Get current user/session |
| `DELETE` | `/api/v1/sessions/current`      | Yes  | Logout                   |
| `GET`    | `/api/v1/tasks`                 | Yes  | List tasks (filterable)  |
| `GET`    | `/api/v1/tasks/today`           | Yes  | Tasks due today          |
| `GET`    | `/api/v1/tasks/summary/weekly`  | Yes  | Weekly stats + daily breakdown |
| `POST`   | `/api/v1/tasks`                 | Yes  | Create a task            |
| `GET`    | `/api/v1/tasks/:id`             | Yes  | Get a task               |
| `PATCH`  | `/api/v1/tasks/:id`             | Yes  | Update a task            |
| `PATCH`  | `/api/v1/tasks/:id/toggle`      | Yes  | Toggle complete/pending  |
| `DELETE` | `/api/v1/tasks/:id`             | Yes  | Delete a task            |
