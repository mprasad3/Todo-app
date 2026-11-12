# Local Setup & Execution Guide

Live Hosted Application: **[https://tododijiaccel.netlify.app/](https://tododijiaccel.netlify.app/)**

---

## 1. Prerequisites

- **Node.js** v18+ or v20+
- **npm** v9+
- **MongoDB** (running on `mongodb://127.0.0.1:27017/todo_assessment` or MongoDB Atlas URI)

---

## 2. Backend Setup (Port 4000)

```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Start the server with hot reload
npm run dev
```

- API Base URL: `http://localhost:4000/api/v1`
- Environment settings are in `backend/.env`:
  ```env
  NODE_ENV=development
  PORT=4000
  MONGODB_URI=mongodb://127.0.0.1:27017/todo_assessment
  CLIENT_ORIGIN=http://localhost:5173
  ```

---

## 3. Frontend Setup (Port 5173)

In a separate terminal window:

```bash
# Navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

- Frontend Web App URL: `http://localhost:5173`
- Environment settings are in `frontend/.env`:
  ```env
  VITE_API_URL=http://localhost:4000/api/v1
  ```

---

## 4. Production Build

To build the frontend for production:

```bash
cd frontend
npm run build
npm run preview
```
