# PROJECT_PROGRESS

## Status per phase
| Phase | Status |
|---|---|
| 1 Inspect | Done |
| 2 Backend skeleton | Done (Atlas connected, /api/health returns db: connected) |
| 3 Models and APIs | Not started |
| 4 API client and adapters | Not started |
| 5 Hooks, UI states, migration | Not started |
| 6 Hardening and cleanup proposal | Not started |

## Baseline results (before Phase 2 changes; unchanged after)
- `npm test`: 63 pass, 0 fail
- `npm run lint`: no diagnostics
- `npm run build`: succeeds (existing "chunk larger than 500 kB" warning only)
- `npm run test:server` (new in Phase 2): 8 pass

## Completed work
- Phase 1: inventory of the 5 collections, shape mismatches and risks (see Decisions).
- Phase 2: `server/` skeleton (env config, Mongo connect, `/api/health`, `notFound`, `errorHandler`), scripts `server`, `server:dev`, `test:server`, `.env.example`, `.gitignore` (.env), `.claudeignore`, Vite `/api` proxy, CLAUDE.md backend notes.
- Phase 2 checks: missing `MONGODB_URI`, a wrong scheme and an unresolvable host each exit 1 with a clear message.

## Pending work
- Phases 3 to 6 per the brief.

## Decisions
- Express 5, ESM, server imports pure utils from `../src/utils/`: project is `"type": "module"`.
- Hosting: MongoDB Atlas (user choice). Tests will use mongodb-memory-server.
- Client keeps generating ids; stored as `clientId` (unique index), returned as `id`: hooks stay unchanged.
- Weight = `weightentries` collection plus a singleton settings doc; repository still returns `{entries, startingKg, targetKg}`.
- Disable Mongoose timestamps and nested `_id`: planner/weight responses must keep today's shapes; client workout/goal timestamps are preserved.
- Return records in insertion order (hidden sequence): planner order within a day is array order.
- Repositories keep `load`/`save(whole)`; API `save` diffs against the last-synced snapshot into per-record calls: avoids destructive bulk replace.
- Server validation: convert record to form (`workoutToForm`, `planToForm`, `goalToForm`) and reuse existing validators, plus a type guard and extra limits where the utils have none.
- Weight "not in the future" gets a one-day tolerance on the server: client `today` is local time.
- Stats endpoints reuse `progress.js` / `dashboard.js` and take `?today=`; display formatting (`formatDate`) stays on the client (locale).
- Phase 5 default: `useProgressData` derives from fetched records with the same utils: its shape (raw records) differs from server summaries.
- Pre-existing uncommitted edit to `CLAUDE.md` (persisted-features line) is included in the Phase 2 commit; `src/pages/CLAUDE.md` (identical copy, same edit) is left uncommitted.
- Phase 2: `/api/health` returns `{status, db}` and works without a DB connection so tests need no database.

## Known issues
- `npm run build` chunk-size warning (pre-existing, recharts).
- `src/pages/CLAUDE.md` is a byte-identical copy of the root `CLAUDE.md`: ask the user whether it is intentional.

## Files changed in the latest phase (Phase 2)
New: `server/index.js`, `server/app.js`, `server/config/{env,db}.js`, `server/middleware/{notFound,errorHandler}.js`, `server/tests/{env,app}.test.js`, `.env.example`, `.claudeignore`, `PROJECT_PROGRESS.md`.
Edited: `package.json` (scripts; deps express, mongoose, dotenv), `package-lock.json`, `.gitignore`, `vite.config.js`, `CLAUDE.md`.

## Next step
Phase 3 (models and APIs) in a fresh session.

