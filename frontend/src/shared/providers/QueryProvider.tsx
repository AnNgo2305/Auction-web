import { QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import { makeQueryClient } from '@/shared/api/query-client';

type Props = {
  children: React.ReactNode;
};

export function QueryProvider({ children }: Props) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
