# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` / `npm run preview` — production build (to `dist/`) / serve it
- `npm run lint` — oxlint (config in `.oxlintrc.json`)
- `npm test` — Node's built-in test runner over `src/**/*.test.js` (no Vite/DOM; tests cover pure `utils/` code)
- Single test file: `node --test src/utils/workouts.test.js`; single test: add `--test-name-pattern="<name>"`
- `npm run server` / `npm run server:dev` — Express API (`server:dev` restarts on change). Needs `.env`.
- `npm run test:server` — Node test runner over `server/tests/**/*.test.js` (separate from `npm test`)

## Backend (in progress: MongoDB becomes the source of truth, phased)

- `server/`: `index.js` (entry, connects then listens), `app.js` (`createApp()`, no listen, so tests import it), `config/env.js` + `config/db.js`, `middleware/` (`notFound`, `errorHandler`). Errors use `{ error: { code, message, details } }`. JSON body limit 100kb.
- Env (`.env`, never committed; template in `.env.example`): `MONGODB_URI` (required, MongoDB Atlas), `PORT` (default 3001), `VITE_DATA_SOURCE` (`local` | `api`, default `local`; not wired up yet).
- Dev: Vite proxies `/api` to Express (`vite.config.js`). Production: `NODE_ENV=production npm run server` serves `dist/` and `/api` from one origin.
- Server code may import the pure files in `src/utils/`; `utils/` itself stays free of fetch, localStorage and React.
- Progress and status live in `PROJECT_PROGRESS.md`.

## Working rules for backend phases

- Start each session by reading `CLAUDE.md` and `PROJECT_PROGRESS.md`; read other files only when needed.
- One phase per session. Stop when the done-criteria pass and the summary is written.
- Never read `node_modules`, `dist`, lock files or images. Search with grep/glob, then read only the line ranges needed.
- Read only the utils, hook and component files for the collection being worked on.
- Keep replies short: changed files, test results, open issues, next step. Don't print whole files.
- Update `PROJECT_PROGRESS.md` before a long step. If context fills up, update it and tell the user to run `/compact` or `/clear`.
- Delegate broad searches to a subagent and use only its conclusion.
- Update this file at the end of every phase.

## Architecture

FitTrack: a React 19 + Vite single-page fitness tracker (plain JSX, no TypeScript, no router). The browser app still stores everything in localStorage; the Express + MongoDB backend is being added behind a data-source flag. Charts use recharts, icons use lucide-react.

- **Navigation is state, not a router.** `App.jsx` holds `activePage` and renders the page by id. Sidebar entries come from `data/navItems.js`; ids without a dedicated page in `App.jsx` fall through to `pages/Placeholder.jsx`. To add a page: add a nav item, then add a branch in `App.jsx`.
- **No dummy data.** Everything is the user's own, persisted in localStorage; empty states show until they log something. Dashboard numbers come from `utils/dashboard.js` + `utils/progress.js` via the read-only `useProgressData` hook.
- **Backup.** `utils/appStorage.js` registers every collection (workouts, planner, weight, goals, profile; keys `fittrack.<name>.v1`) for Export/Import (`components/DataBackup.jsx`, sidebar footer). Import validates first, then replaces all data; `App.jsx` bumps `dataVersion` to remount pages. A new persisted collection must be added to `COLLECTIONS` there.
- **Persisted features** (Workouts, Planner, Weight, Goals, Profile) all follow the same layering (pure utils → storage → `use<Name>` hook → UI). Workouts splits it across four `utils/workout*.js` files; the others keep model, operations, validation and storage together in one `utils/<name>.js` (e.g. `goals.js`, which exports `GOALS_STORAGE_KEY`). Shown for Workouts:
  - `utils/workoutModel.js` — the canonical Workout/Exercise shape, id/date helpers, and form↔workout converters (forms hold strings; saved workouts hold numbers).
  - `utils/workoutOperations.js` — pure, immutable CRUD (return new arrays) plus sorting.
  - `utils/workoutValidation.js` — form validation.
  - `utils/workoutStorage.js` — the only code touching `localStorage` (key `fittrack.workouts.v1`); load never throws, save returns a boolean.
  - `hooks/useWorkouts.js` — owns state; every change goes through `commit()`, which updates React state and localStorage together and exposes `saveFailed`.
  - `components/workouts/*` and `pages/MyWorkouts.jsx` — UI.
- Utils take injectable dependencies (`storage`, `now`) so they can be unit-tested in plain Node; keep new logic in `utils/` the same way.
- Styles are per-area plain CSS files in `src/styles/` (no CSS framework/modules).
