export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-3 py-12 text-sm text-fg"
    >
      <span
        aria-hidden="true"
        className="inline-block size-5 animate-spin rounded-full border-2 border-border border-t-accent motion-reduce:animate-none"
      />
      <span>{label}…</span>
    </div>
  );
}
