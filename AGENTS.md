# AGENTS.md

## High-Signal Guidance for Automation Agents

__Read this before modifying, building, or testing code in this repository.__

---

### Monorepo Structure
- Two main apps: `apps/backend` (Node.js/Express/TypeScript, SQLite) and `apps/frontend` (React, TS, Vite).
- **Backend:** Service and repository pattern; modules under `src/modules/*`.
- **Frontend:** Feature-foldered under `src/features/*`, common UI/hooks in `src/shared`.

### Install & Development
- Install dependencies _per app_, not at repo root:
  ```
  cd apps/backend && npm install
  cd apps/frontend && npm install
  ```
- Start backend:
  ```
  cd apps/backend
  npm run dev
  ```
- Start frontend:
  ```
  cd apps/frontend
  npm run dev
  ```
- Ports: backend (`3333`), frontend (`5173`).

### Environment & Data
- `.env` files are required for both apps. Backend needs valid `JWT_SECRET` or will crash in production.
- **NEVER copy your local `database.sqlite` over the Docker volume.** Use migration scripts (`node run_migrations.js`) for any prod schema changes.
- For backend dev, `.env` sets `DB_SOURCE` and CORS.

### Build, Typecheck, Lint
- _Frontend:_
  - Build: `npm run build`
  - Lint: `npm run lint`
- _Backend:_
  - Build: `npm run build` (outputs to `dist`)

### Test & Verification
- _Frontend:_
  - Unit/Integration: `npm test` (Jest/RTL)
  - Watch: `npm run test:watch`
  - Coverage: `npm run test:coverage`
- _Backend:_
  - Integration: `npm run test:performance-cycle` (creates its own temp SQLite DB)
  - Other tests are direct `.js`/`.ts` files; check for test scripts in `package.json`.
- Tests may include custom or ad-hoc scripts. Validate test result by script, not convention.

### DB & Admin Ops
- Run migrations: `npm run migrate` (backend)
- Seed data: `npm run seed`
- Company seed: `npm run seed:company-settings`
- Migrate notifications: `npm run migrate:notifications`
- Scripts often refer to local `.env` for DB path.

### Docker & Infra
- Source of truth: `docker-compose.yml` for ports, networks, volumes.
- Backend: host:container mapped as `3334:3333`.
- Do not copy/upload local DB after container is running—migrations only.
- Required env vars for prod: `JWT_SECRET`, `CORS_ORIGIN`, `DB_SOURCE`, etc.
- Uploads dir: `/app/public/uploads` (inside backend container).

### Security & API Constraints
- JWT auth required for all backend routes.
- Role-based access enforced server-side.
- Strict input validation (`express-validator` everywhere).
- For advanced modules (notifications/reports), see: `docs/FINAL_IMPLEMENTATION_STATUS.md`.

### Source of Truth
- If docs and config/scripts differ, scripts/config _take precedence_.
- For architecture/module reference, see these if present:
  - `docs/FINAL_IMPLEMENTATION_STATUS.md`
  - `apps/backend/IMPLEMENTATION_SUMMARY.md`
  - `docs/QWEN.md`

---

__When in doubt, check app-local scripts and config.__

This file is intended for use by all agents modifying, building, or testing this repository.
