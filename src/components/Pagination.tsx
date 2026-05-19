import { cn } from "../lib/cn";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  lastPage,
  onChange,
}: PaginationProps) {
  if (lastPage <= 1) return null;

  const pages = Array.from({ length: lastPage }, (_, i) => i + 1);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < lastPage;

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-center gap-1"
    >
      <PageButton
        disabled={!hasPrev}
        onClick={() => onChange(currentPage - 1)}
        aria-label="Previous page"
        rel="prev"
      >
        ←
      </PageButton>

      {pages.map((p) => (
        <PageButton
          key={p}
          aria-label={`Page ${p}`}
          aria-current={p === currentPage ? "page" : undefined}
          active={p === currentPage}
          onClick={() => onChange(p)}
        >
          {p}
        </PageButton>
      ))}

      <PageButton
        disabled={!hasNext}
        onClick={() => onChange(currentPage + 1)}
        aria-label="Next page"
        rel="next"
      >
        →
      </PageButton>
    </nav>
  );
}

type PageButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  rel?: string;
};

function PageButton({
  active,
  className,
  children,
  disabled,
  ...rest
}: PageButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm tabular-nums transition-colors",
        active
          ? "border-accent bg-accent text-white"
          : "border-border bg-bg text-fg hover:border-accent-border hover:text-fg-strong",
        disabled && "cursor-not-allowed opacity-40 hover:border-border",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
