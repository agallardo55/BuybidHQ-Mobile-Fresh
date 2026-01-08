
// Cache bust: Force fresh build with React context fixes
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { isAuthError } from './lib/errorHandler';

// Create a client with improved configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        if (isAuthError(error)) {
          return false;
        }
        // Don't retry more than 2 times
        return failureCount < 2;
      },
      refetchOnWindowFocus: false, // Disable for better UX
      refetchOnReconnect: true, // Refetch when internet connection is restored
    },
    mutations: {
      retry: false, // Never retry mutations by default
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

try {
  const root = createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
} catch (error) {
  console.error('❌ main.tsx: Failed to render app', error);
  // Only set innerHTML if React failed to mount
  if (rootElement && !rootElement.hasChildNodes()) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red;">
        <h2>Failed to load app</h2>
        <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
        <p>Check the browser console for details.</p>
      </div>
    `;
  }
  throw error;
}
