import { cn } from "../lib/cn";

interface CategoryFilterProps {
  categories: readonly string[];
  active: string | null;
  onChange: (next: string | null) => void;
}

export function CategoryFilter({
  categories,
  active,
  onChange,
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
      />
      {categories.map((cat) => (
        <FilterChip
          key={cat}
          active={active === cat}
          onClick={() => onChange(cat)}
          label={cat}
        />
      ))}
    </div>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

function FilterChip({ active, onClick, label }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm capitalize transition-colors",
        active
          ? "border-accent-border bg-accent-bg text-accent"
          : "border-border bg-bg text-fg hover:border-accent-border hover:text-fg-strong",
      )}
    >
      {label}
    </button>
  );
}
