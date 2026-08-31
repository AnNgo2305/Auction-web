import { Link } from 'react-router-dom';
export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold">404</h1>
      <h2 className="text-2xl font-semibold">Page not found</h2>
      <p className="text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="rounded-md border px-4 py-2">
        Go home
      </Link>
    </div>
  );
}
