// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryProvider } from '@/shared/providers/QueryProvider';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { UserProvider } from '@/shared/contexts/UserContext';
import { TooltipProvider } from '@/shared/ui/tooltip';

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <QueryProvider>
      <UserProvider>
        <AuthProvider>
          <TooltipProvider delayDuration={200}>
            <App />
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </AuthProvider>
      </UserProvider>
    </QueryProvider>
  // </StrictMode>,
);
