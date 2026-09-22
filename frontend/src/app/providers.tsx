import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AssistantProvider } from '@/context/AssistantProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="skillforge-ui-theme">
        <AuthProvider>
          <AssistantProvider>
            {children}
          </AssistantProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
