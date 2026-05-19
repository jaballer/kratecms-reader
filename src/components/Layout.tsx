import { NavLink, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <NavLink
            to="/"
            className="flex items-baseline gap-2 font-heading text-xl font-medium text-fg-strong no-underline"
          >
            <span className="text-accent">Krate</span>
            <span className="text-sm tracking-wide text-fg uppercase">
              Reader
            </span>
          </NavLink>
          <nav aria-label="Primary">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm no-underline ${
                  isActive ? "text-fg-strong" : "text-fg hover:text-fg-strong"
                }`
              }
            >
              All posts
            </NavLink>
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-5 py-10">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-border">
        <div className="mx-auto max-w-5xl px-5 py-6 text-sm text-fg">
          A React 19 demo against the{" "}
          <a
            href="https://kratecms.ddev.site/api/v1/posts"
            className="text-accent underline underline-offset-4"
          >
            KrateCMS API
          </a>
          .
        </div>
      </footer>
    </div>
  );
}
