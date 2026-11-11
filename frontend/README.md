# Frontend

React + Tailwind (Vite) app for the Todo Task Manager, deployed on Netlify together with its API.

- The API lives in `netlify/server/index.ts` (Express, served as a Netlify Server on `/api/*`). It implements the same `/api/v1/sessions` and `/api/v1/tasks` endpoints described in `../backend/README.md`.
- Data is stored in Netlify Database (Postgres) via Drizzle ORM. The schema is in `db/schema.ts`; migrations live in `netlify/database/migrations/` and are applied automatically on deploy. After changing the schema run `npx drizzle-kit generate --name <change_name>`.
- The frontend calls the API on the same origin (`/api/v1`) by default. `VITE_API_URL` can override this; localhost URLs are ignored when the app isn't itself running on localhost.

Local development:

```bash
npm install
netlify dev
```
