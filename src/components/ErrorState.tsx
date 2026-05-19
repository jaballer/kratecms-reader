interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-rose-300 bg-rose-50 p-6 text-rose-900 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-200"
    >
      <h2 className="mb-2 text-lg font-medium text-rose-900 dark:text-rose-100">
        {title}
      </h2>
      <p className="mb-4 text-sm">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center rounded-md border border-rose-300 bg-white px-3 py-1.5 text-sm font-medium text-rose-900 hover:bg-rose-100 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-100 dark:hover:bg-rose-900/60"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
