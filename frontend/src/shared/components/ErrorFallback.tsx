import type { FallbackProps } from 'react-error-boundary';

export function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground">An unexpected error occurred.</p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="rounded-md border px-4 py-2"
      >
        Try again
      </button>
    </div>
  );
}
