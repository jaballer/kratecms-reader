# Krate Reader

A React 19 + TypeScript + Tailwind SPA that reads posts from [KrateCMS](https://github.com/jaballer/kratecms) — a small Laravel-backed content platform — and renders them as a multi-media feed (text, audio, video).

**[Live demo →](https://kratecms-reader.netlify.app)** · [![Netlify Status](https://api.netlify.com/api/v1/badges/site/deploy-status)](https://app.netlify.com/sites/kratecms-reader/deploys) · [![License: MIT](https://img.shields.io/badge/License-MIT-aa3bff.svg)](LICENSE)

Built primarily as a real-world testbed for senior-engineer React patterns: TanStack Query, accessible client-side routing, semantic HTML, focus management on route change, provider-aware media embeds.

## What's inside

- **Vite + React 19 + TypeScript + Tailwind v4** — current-gen stack, fast HMR, design tokens via `@theme`.
- **TanStack Query** for caching, `keepPreviousData` pagination, status-aware error handling.
- **React Router v7** (`createBrowserRouter`) with focus-on-`<h1>` route-change a11y, skip link, semantic landmarks.
- **Provider-aware media embeds** — YouTube (nocookie), SoundCloud (player URL transformed from share URLs).
- **Vite dev proxy** to the KrateCMS DDEV instance — no CORS configured upstream, so dev requests are same-origin.
- **Playwright E2E** — 12 specs covering filter behavior, focus-on-route-change, aria-current pagination, skip link, 404, console-cleanliness.

## How to run

You need a reachable KrateCMS instance. The dev proxy currently points at `https://kratecms.ddev.site`; the deployed site at [kratecms-reader.netlify.app](https://kratecms-reader.netlify.app) proxies to `https://kratecms.com` via [`netlify.toml`](netlify.toml).

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. The `/api/v1/*` calls are proxied to the configured Krate origin — see [vite.config.ts](vite.config.ts).

To target a different KrateCMS deployment, edit `KRATE_ORIGIN` in `vite.config.ts`. For production builds, the [`netlify.toml`](netlify.toml) edge proxy handles same-origin forwarding to `kratecms.com`.

## Tests

Playwright E2E suite — 12 specs across 4 files. Run from the project root:

```bash
npm run e2e          # headless, against the local dev server
npm run e2e:ui       # Playwright UI mode for debugging
npm run e2e:prod     # smoke-test the deployed Netlify URL
```

The config auto-starts the Vite dev server when running locally — no separate `npm run dev` needed in another terminal. See [playwright.config.ts](playwright.config.ts).

| Spec | Covers |
|---|---|
| [e2e/homepage.spec.ts](e2e/homepage.spec.ts) | Post list renders, category filter toggles `aria-pressed`, pagination updates `aria-current` |
| [e2e/detail.spec.ts](e2e/detail.spec.ts) | Click-through to `/posts/:id`, focus moves to the H1, iframe `title` attribute |
| [e2e/errors.spec.ts](e2e/errors.spec.ts) | Missing post id renders 404 alert with no retry button; unknown route shows page-not-found |
| [e2e/a11y.spec.ts](e2e/a11y.spec.ts) | First Tab reveals the skip link; landmark count; no console errors on a typical browse session |

## Project structure

```
src/
  api/
    types.ts          Post, Author, pagination types (raw + normalized)
    client.ts         fetch wrapper, ApiError, meta unboxing
    queries.ts        TanStack Query queryOptions
  components/
    Layout.tsx        Header, footer, <Outlet />, skip link
    PostCard.tsx      Grid card with featured image + meta
    CategoryBadge.tsx
    CategoryFilter.tsx
    Pagination.tsx
    MediaEmbed.tsx    Provider-aware (YouTube + SoundCloud)
    Spinner.tsx
    ErrorState.tsx
  pages/
    PostListPage.tsx
    PostDetailPage.tsx
  lib/
    cn.ts             clsx + tailwind-merge
    format.ts         Intl date formatting
  App.tsx             Router + QueryClient
  main.tsx
  index.css           Tailwind + design tokens + a11y resets
```

## Known KrateCMS API quirks (with filed issues)

These are upstream issues in the API that this reader works around. Each has a tracking issue in the [kratecms repo](https://github.com/jaballer/kratecms/issues?q=is%3Aissue+label%3Aarea%3Aapi):

| # | Issue | Workaround here |
|---|---|---|
| [kratecms#574](https://github.com/jaballer/kratecms/issues/574) | `meta.{current_page,last_page,per_page,total}` returned as `[v, v]` arrays | `unbox()` in [src/api/client.ts](src/api/client.ts) |
| [kratecms#575](https://github.com/jaballer/kratecms/issues/575) | CORS preflight missing `Access-Control-Allow-Origin` | Vite dev proxy in [vite.config.ts](vite.config.ts) |
| [kratecms#576](https://github.com/jaballer/kratecms/issues/576) | `/posts/{slug}` returns 404, detail is id-only | Routes use `/posts/:id` |
| [kratecms#577](https://github.com/jaballer/kratecms/issues/577) | Query filters (`?category=`, `?slug=`) silently ignored | Client-side filter on cached page (acceptable at ~18 posts; would break at scale) |
| [kratecms#578](https://github.com/jaballer/kratecms/issues/578) | SoundCloud `embed_url` is a share URL, blocked by `X-Frame-Options` | Provider transform in [src/components/MediaEmbed.tsx](src/components/MediaEmbed.tsx) |
| [kratecms#579](https://github.com/jaballer/kratecms/issues/579) | `author.email` exposed on public response | Never rendered in UI |
| [kratecms#580](https://github.com/jaballer/kratecms/issues/580) | Public reads return `Cache-Control: no-cache, private` | TanStack Query in-memory cache covers it for now |
| [kratecms#581](https://github.com/jaballer/kratecms/issues/581) | `category: "audio"` posts have a native MP3 on kratecms.com but the file URL isn't in the API response | Type + render path live in [MediaEmbed.tsx](src/components/MediaEmbed.tsx); ships behind the data |

When the upstream is fixed, the unbox helper, the proxy, and the SoundCloud transform can be removed.

## Tech-stack rationale

| Decision | Why |
|---|---|
| TanStack Query over `Suspense + use()` | Caching, retries, `keepPreviousData`, devtools — all things `use()` would force you to reinvent. |
| React Router v7 over TanStack Router | Battle-tested. The `data router` (`createBrowserRouter`) is the current API. |
| Slug URLs (client-side resolution) | KrateCMS detail endpoint is id-only ([kratecms#576](https://github.com/jaballer/kratecms/issues/576)). We fetch the merged list once and resolve `slug → post` in memory. Legacy `/posts/:id` URLs `<Navigate replace>` to the canonical slug. Acceptable at ~18 posts; would move to a server-side slug route at scale. |
| Native `<audio>` for audio posts | KrateCMS API doesn't expose the file URL yet ([kratecms#581](https://github.com/jaballer/kratecms/issues/581)). The `Post` type and `MediaEmbed` already declare and render the `audio_url` field; once upstream ships it, audio-category posts get a real `<audio>` player with no further React-side changes. |
| Client-side category filter | API ignores `?category=` ([kratecms#577](https://github.com/jaballer/kratecms/issues/577)). Acceptable at 18 posts; flagged in code. |
| Tailwind v4 `@theme` | CSS custom properties become utility classes for free. Dark mode + light mode share one variable set. |
| No CSS-in-JS, no UI kit | Showing the work, not pulling shadcn. |
| Playwright over Vitest + Testing Library | The high-value tests for this app are end-to-end (routing, focus, pagination). Vitest would be overkill for the 2-3 pure helpers (`unbox`, `youtubeIdFromUrl`). Would add Vitest if the API client grew. |
| Netlify Edge Proxy over per-request CORS | The upstream API doesn't ship CORS headers ([kratecms#575](https://github.com/jaballer/kratecms/issues/575)). The proxy makes the browser see same-origin requests; works dev and prod with no code branches. |

## A11y notes

- Skip link in [Layout.tsx](src/components/Layout.tsx) jumps focus to `<main id="main">`.
- Focus moves to the page `<h1>` on route change ([PostDetailPage.tsx](src/pages/PostDetailPage.tsx) — `useEffect` + `tabIndex={-1}`). Screen reader users hear the new title.
- `aria-pressed` on filter chips, `aria-current="page"` on pagination, `role="alert"` on errors, `aria-live` on the "X shown" indicator.
- `prefers-reduced-motion` honored globally (CSS reset) and per-component (Tailwind `motion-reduce:`).
- Featured images use `loading="lazy"` + empty `alt=""` fallback when `featured_image_alt` is missing (decorative).

## What's not here

- **Auth / writes** — read-only by design.
- **SSR / SEO** — pure SPA. If indexability matters, switch to Next.js App Router or Astro.
- **Vitest unit tests** — the high-leverage tests for this app are end-to-end, which Playwright covers. Would add Vitest if the API client grows beyond the current `unbox`/`youtubeIdFromUrl` helpers.
- **CI workflow** — `.github/workflows/e2e.yml` running Playwright on PRs would be the natural next step.
- **Visual regression** — Percy / Chromatic-style snapshot diffing isn't wired up; the OG card and component grid could benefit.

## License

[MIT](LICENSE).
