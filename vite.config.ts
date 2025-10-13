
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React core and router
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router')) {
              return 'react-vendor';
            }
            
            // Scheduler (React dependency)
            if (id.includes('scheduler')) {
              return 'react-vendor';
            }
            
            // Radix UI - split into smaller chunks
            if (id.includes('@radix-ui/react-dialog') || 
                id.includes('@radix-ui/react-dropdown-menu') ||
                id.includes('@radix-ui/react-select') ||
                id.includes('@radix-ui/react-popover')) {
              return 'ui-dialog-vendor';
            }
            
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            
            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            
            // Supabase
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'form-vendor';
            }
            
            // Zod validation (separate from forms as it's large)
            if (id.includes('zod')) {
              return 'zod-vendor';
            }
            
            // Icons
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            
            // Charts (Recharts and D3)
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'chart-vendor';
            }
            
            // Image compression (large library, separate chunk)
            if (id.includes('browser-image-compression')) {
              return 'image-vendor';
            }
            
            // Date utilities
            if (id.includes('date-fns')) {
              return 'date-vendor';
            }
            
            // CSS/Style utilities
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
              return 'style-vendor';
            }
            
            // Toast notifications
            if (id.includes('sonner')) {
              return 'toast-vendor';
            }
            
            // All other node_modules - catch remaining large libraries
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Disable sourcemaps in production for smaller builds
  },
}));
