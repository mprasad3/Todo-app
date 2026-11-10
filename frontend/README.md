# Frontend

This folder is reserved for the React + Tailwind application. Use the UI prompt in the repository root to generate or implement the interface, then point `VITE_API_URL` at the backend (for example `http://localhost:4000/api/v1`).

Recommended setup:

```bash
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss @tailwindcss/vite
```

Keep API access in `src/services/tasks.js` and UI state in feature-level hooks or a lightweight store. Do not couple components directly to fetch calls.
