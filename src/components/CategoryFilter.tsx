import { cn } from "../lib/cn";

interface CategoryFilterProps {
  categories: string[];
  active: string | null;
  onChange: (next: string | null) => void;
  counts?: Record<string, number>;
  total?: number;
}

export function CategoryFilter({
  categories,
  active,
  onChange,
  counts,
  total,
}: CategoryFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="flex flex-wrap items-center gap-2"
    >
      <FilterChip
        active={active === null}
        onClick={() => onChange(null)}
        label="All"
        count={total}
      />
      {categories.map((cat) => (
        <FilterChip
          key={cat}
          active={active === cat}
          onClick={() => onChange(cat)}
          label={cat}
          count={counts?.[cat]}
        />
      ))}
    </div>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}

function FilterChip({ active, onClick, label, count }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm capitalize transition-colors",
        active
          ? "border-accent-border bg-accent-bg text-accent"
          : "border-border bg-bg text-fg hover:border-accent-border hover:text-fg-strong",
      )}
    >
      <span>{label}</span>
      {typeof count === "number" ? (
        <span
          aria-hidden="true"
          className="text-xs tabular-nums text-fg opacity-70"
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
