import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react-router-dom")) return "router-vendor";
              if (id.includes("react-dom") || id.includes("react")) return "react-vendor";
              if (id.includes("@supabase/supabase-js")) return "supabase-vendor";
              if (id.includes("recharts")) return "charts-vendor";
              if (id.includes("motion") || id.includes("framer-motion")) return "motion-vendor";

              if (
                id.includes("@radix-ui") ||
                id.includes("sonner") ||
                id.includes("lucide-react") ||
                id.includes("clsx") ||
                id.includes("class-variance-authority") ||
                id.includes("tailwind-merge") ||
                id.includes("date-fns") ||
                id.includes("embla-carousel-react") ||
                id.includes("react-hook-form") ||
                id.includes("@hookform/resolvers") ||
                id.includes("zod")
              ) {
                return "ui-vendor";
              }
            }

            return undefined;
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
