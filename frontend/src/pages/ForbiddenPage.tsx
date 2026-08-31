import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button.tsx';

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="text-7xl font-bold">403</h1>
      <h2 className="mt-4 text-2xl font-semibold">Access Forbidden</h2>
      <p className="text-muted-foreground mt-2">
        You don't have permission to access this page.
      </p>

      <Button asChild className="mt-6">
        <Link to="/">Go back home</Link>
      </Button>
    </div>
  );
}
