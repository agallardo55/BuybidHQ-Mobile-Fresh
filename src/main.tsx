
// Cache bust: Force fresh build with React context fixes
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
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

// CRITICAL: This should be the FIRST log that appears
console.log('🚀 main.tsx: Starting app initialization');
console.log('🚀 main.tsx: If you see this, JavaScript is executing!');
console.log('🚀 main.tsx: Timestamp:', new Date().toISOString());

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ main.tsx: Failed to find root element');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Error: Root element not found</div>';
  throw new Error('Failed to find the root element');
}

console.log('✅ main.tsx: Root element found, rendering app');

try {
  const root = createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
  console.log('✅ main.tsx: App rendered successfully');
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
