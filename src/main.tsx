
// Cache bust: Force fresh build with React context fixes
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { isAuthError } from './lib/errorHandler';

// Disable React DevTools in production to prevent inspection of component tree
if (import.meta.env.PROD && typeof window !== 'undefined') {
  const devToolsHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (devToolsHook) {
    for (const key in devToolsHook) {
      devToolsHook[key] = typeof devToolsHook[key] === 'function' ? () => {} : null;
    }
  }
}

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
  // Only render error if React failed to mount
  if (rootElement && !rootElement.hasChildNodes()) {
    // SECURITY: Use DOM manipulation instead of innerHTML to prevent XSS
    rootElement.textContent = '';
    const errorDiv = document.createElement('div');
    errorDiv.style.padding = '20px';
    errorDiv.style.color = 'red';

    const heading = document.createElement('h2');
    heading.textContent = 'Failed to load app';
    errorDiv.appendChild(heading);

    const errorMsg = document.createElement('p');
    errorMsg.textContent = `Error: ${error instanceof Error ? error.message : String(error)}`;
    errorDiv.appendChild(errorMsg);

    const instructions = document.createElement('p');
    instructions.textContent = 'Check the browser console for details.';
    errorDiv.appendChild(instructions);

    rootElement.appendChild(errorDiv);
  }
  throw error;
}
