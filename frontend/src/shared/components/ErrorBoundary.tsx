import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import type { PropsWithChildren } from 'react';
import { ErrorFallback } from './ErrorFallback';

export function ErrorBoundary({ children }: PropsWithChildren) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Unhandled React error:', error);
        console.error('Component stack:', errorInfo.componentStack);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
