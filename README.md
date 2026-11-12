# 📝 Todo Task Manager (Digiaccel Assessment)

A modern, responsive full-stack **Todo Task Manager** application built with a **React + Tailwind CSS** frontend and a **Node.js + Express + MongoDB** backend.

---

## 🌐 Live Hosted URL

- **Live Application:** [https://tododijiaccel.netlify.app/](https://tododijiaccel.netlify.app/)

---

## 📁 Repository Structure

```
Todo_task_digiaccel/
├── backend/                # Node.js + Express + MongoDB REST API (Port 4000)
│   ├── src/
│   │   ├── config/         # Database & environment configuration
│   │   ├── controllers/    # Session & Task controllers
│   │   ├── middleware/     # Authentication middleware
│   │   ├── models/         # Mongoose schemas (User, Task, Session)
│   │   ├── routes/         # Express API routes (/api/v1/...)
│   │   ├── utils/          # Token hashing & date utilities
│   │   ├── app.js          # Express app definition
│   │   └── server.js       # Server entry point
│   ├── .env                # Backend environment configuration
│   └── package.json
│
├── frontend/               # React 18 + Vite + Tailwind CSS v4 (Port 5173)
│   ├── src/
│   │   ├── components/     # UI components (Home, Search, Modal, Layout)
│   │   ├── config/         # Client environment config
│   │   ├── hooks/          # Custom hooks (useTasks, useSession)
│   │   ├── services/       # HTTP client & API services
│   │   └── utils/          # Date & storage utilities
│   ├── .env                # Frontend environment configuration
│   ├── package.json
│   └── vite.config.js
│
└── README.md               # Project documentation & local setup guide
```

---

## 🚀 Quick Start: Running Locally

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18 or v20+ recommended)
- **npm** (comes with Node.js)
- **MongoDB** running locally on port `27017` (or a MongoDB Atlas connection string)

---

### Step 1: Start the Backend Server

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure you have a `.env` file in the `backend/` folder (a default `.env` is already configured):
   ```env
   NODE_ENV=development
   PORT=4000
   MONGODB_URI=mongodb://127.0.0.1:27017/todo_assessment
   CLIENT_ORIGIN=http://localhost:5173
   ```
   > *Note: If using MongoDB Atlas, replace `MONGODB_URI` with your connection string.*

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   - The backend server will start on: **`http://localhost:4000`**
   - API endpoints base URL: **`http://localhost:4000/api/v1`**

---

### Step 2: Start the Frontend Application

1. Open a **new / separate terminal window** and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Verify your `.env` file in the `frontend/` folder:
   ```env
   VITE_API_URL=http://localhost:4000/api/v1
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   - **`http://localhost:5173`**

---

## 🛠️ Key Features

- **Username-Only Authentication:** Instant onboarding without passwords, secured with SHA-256 hashed bearer session tokens.
- **Continuous 3-Week Calendar Carousel:** Swipe left/right (touch or mouse drag) to navigate smoothly between weeks with zero jitter or blank space.
- **Slide-to-Delete Gesture:**
  - Works on **both Mobile (touch)** and **Desktop (mouse click-and-drag)**.
  - Partial swipe reveals the red delete action drawer.
  - Full swipe past threshold automatically triggers task deletion with smooth exit animations.
- **Interactive Search:** Live instant search with keyword text-highlighting and description matching.
- **Weekly Summary Cards:** Visual progress indicators for completed vs. pending tasks with one-click filtering.
- **Pinned Header Layout:** Top bar, date carousel, and summary cards remain anchored while only the task list scrolls.
- **Add / Edit Task Drawer:** 1:1 designed bottom sheet fitting all inputs (Title, Start Time, End Time, Date, Description) without unnecessary internal scrolling.

---

## 📡 API Endpoints Summary

Base URL: `http://localhost:4000/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/sessions` | Login / Create session by username |
| `GET` | `/sessions/current` | Get active session profile |
| `DELETE` | `/sessions/current` | Logout / Invalidate session |
| `GET` | `/tasks` | List tasks (supports `q`, `status`, `date`, `week`, `priority`) |
| `GET` | `/tasks/today` | List tasks due today |
| `POST` | `/tasks` | Create a new task |
| `GET` | `/tasks/:id` | Get task details |
| `PATCH` | `/tasks/:id` | Update task fields |
| `PATCH` | `/tasks/:id/toggle` | Toggle task completion status |
| `DELETE` | `/tasks/:id` | Delete a task |
| `GET` | `/tasks/summary/weekly` | Get weekly summary & completion stats |

---

## 🧪 Testing and Building

### Frontend Build
To test the production build of the frontend:
```bash
cd frontend
npm run build
npm run preview
```

### Backend Tests
To run backend tests:
```bash
cd backend
npm test
```
