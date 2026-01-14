
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Disable manual chunking to fix React createContext issues
          // manualChunks: undefined,
        },
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: !isProd, // Enable source maps in development only
    },
    esbuild: {
      // Strip console.* and debugger statements in production builds
      drop: isProd ? ['console', 'debugger'] : [],
    },
  };
});
