import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { QueryProvider } from '@/shared/providers/QueryProvider.tsx';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/shared/contexts/AuthContext.tsx';
import { UserProvider } from '@/shared/contexts/UserContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <UserProvider>
        <AuthProvider>
          <App />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </UserProvider>
    </QueryProvider>
  </StrictMode>,
);
