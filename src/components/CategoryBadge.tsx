import { cn } from "../lib/cn";
import type { PostCategory } from "../api/types";

const STYLES: Record<string, string> = {
  text: "bg-accent-bg text-accent border-accent-border",
  audio: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700",
  video: "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-700",
};

export function CategoryBadge({ category }: { category: PostCategory }) {
  const style = STYLES[category] ?? STYLES.text;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        style,
      )}
    >
      {category}
    </span>
  );
}
