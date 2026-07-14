# AGENTS.md

## Cursor Cloud specific instructions

### What this repo is
`krate-react` ("Krate Reader") is a **frontend-only** React 19 + TypeScript + Vite SPA. It has **no backend and no database in this repo** — it is a read-only consumer of the external **KrateCMS** REST API (`/api/v1/*`). See `README.md` for the full architecture.

### Standard commands
Commands are defined in `package.json` (`dev`, `build`, `lint`, `preview`, `e2e`, `e2e:ui`, `e2e:prod`). Use those; they are documented in `README.md`. The dev server runs on `http://localhost:5173`.

### API proxy / data source (non-obvious)
The app always fetches same-origin `/api/v1/*`; a proxy resolves the real backend:
- **Local dev:** `vite.config.ts` proxies `/api` to `https://kratecms.ddev.site` — this is a **local KrateCMS ddev instance that does NOT exist in the cloud VM**, so with the committed config the feed will fail to load / show empty & error states.
- **Production:** `netlify.toml` proxies `/api/*` to `https://kratecms.com`.
- To exercise the app with **real data** in the cloud, temporarily point `KRATE_ORIGIN` in `vite.config.ts` at `https://kratecms.com` (public, reachable). **Do not commit that change** — it is a test-only override.

### E2E tests (non-obvious)
`npm run e2e` auto-starts the dev server (`playwright.config.ts` `webServer`) — no separate `npm run dev` needed. The specs assert against **specific KrateCMS seed data** (posts with slugs `memories` and `hiking-bars`, post id `34`, and multiple pages of posts). That seed lives in a local KrateCMS ddev instance. Against the **production** `kratecms.com` API the dataset differs (only ~12 posts / 1 page, and `memories`/`hiking-bars` return 404), so ~4 of 21 specs fail on data expectations even though the app and harness are healthy. A fully green suite requires a KrateCMS backend seeded to match the specs — not available from this repo alone.
