# Krate Reader

A React 19 + TypeScript + Tailwind SPA that reads posts from [KrateCMS](https://github.com/jaballer/kratecms) — a small Laravel-backed content platform — and renders them as a multi-media feed (text, audio, video).

Built primarily as a real-world testbed for senior-engineer React patterns: TanStack Query, accessible client-side routing, semantic HTML, focus management on route change, provider-aware media embeds.

## What's inside

- **Vite + React 19 + TypeScript + Tailwind v4** — current-gen stack, fast HMR, design tokens via `@theme`.
- **TanStack Query** for caching, `keepPreviousData` pagination, status-aware error handling.
- **React Router v7** (`createBrowserRouter`) with focus-on-`<h1>` route-change a11y, skip link, semantic landmarks.
- **Provider-aware media embeds** — YouTube (nocookie), SoundCloud (player URL transformed from share URLs).
- **Vite dev proxy** to the KrateCMS DDEV instance — no CORS configured upstream, so dev requests are same-origin.

## How to run

You need a reachable KrateCMS instance. The dev proxy currently points at `https://kratecms.ddev.site`.

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. The `/api/v1/*` calls are proxied to the configured Krate origin — see [vite.config.ts](vite.config.ts).

To target a different KrateCMS deployment, edit `KRATE_ORIGIN` in `vite.config.ts`. For production builds, you'll need real CORS on the API or a same-origin reverse proxy (Worker / Vercel rewrite / Nginx).

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

When the upstream is fixed, the unbox helper, the proxy, and the SoundCloud transform can be removed.

## Tech-stack rationale

| Decision | Why |
|---|---|
| TanStack Query over `Suspense + use()` | Caching, retries, `keepPreviousData`, devtools — all things `use()` would force you to reinvent. |
| React Router v7 over TanStack Router | Battle-tested. The `data router` (`createBrowserRouter`) is the current API. |
| Route by id, not slug | KrateCMS detail endpoint is id-only ([kratecms#576](https://github.com/jaballer/kratecms/issues/576)). |
| Client-side category filter | API ignores `?category=` ([kratecms#577](https://github.com/jaballer/kratecms/issues/577)). Acceptable at 18 posts; flagged in code. |
| Tailwind v4 `@theme` | CSS custom properties become utility classes for free. Dark mode + light mode share one variable set. |
| No CSS-in-JS, no UI kit | Showing the work, not pulling shadcn. |

## A11y notes

- Skip link in [Layout.tsx](src/components/Layout.tsx) jumps focus to `<main id="main">`.
- Focus moves to the page `<h1>` on route change ([PostDetailPage.tsx](src/pages/PostDetailPage.tsx) — `useEffect` + `tabIndex={-1}`). Screen reader users hear the new title.
- `aria-pressed` on filter chips, `aria-current="page"` on pagination, `role="alert"` on errors, `aria-live` on the "X shown" indicator.
- `prefers-reduced-motion` honored globally (CSS reset) and per-component (Tailwind `motion-reduce:`).
- Featured images use `loading="lazy"` + empty `alt=""` fallback when `featured_image_alt` is missing (decorative).

## What's not here

- **Auth / writes** — read-only by design.
- **SSR / SEO** — pure SPA. If indexability matters, switch to Next.js App Router or Astro.
- **Tests** — would add Playwright for the navigation + filter flows and Vitest for the unbox/transform helpers.
- **Production CORS story** — the Vite proxy is a dev convenience. Production needs real CORS upstream or a same-origin reverse proxy.

## License

MIT.
