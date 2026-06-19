import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        input: {
          home: path.resolve(__dirname, 'index.html'),
          app: path.resolve(__dirname, 'app.html'),
          ranks: path.resolve(__dirname, 'ranks/index.html'),
          coins: path.resolve(__dirname, 'coins/index.html'),
          bundles: path.resolve(__dirname, 'bundles/index.html'),
          orderTracker: path.resolve(__dirname, 'order-tracker/index.html'),
          terms: path.resolve(__dirname, 'terms/index.html'),
        },
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return;
            }

            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }

            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react';
            }

            if (id.includes('motion') || id.includes('lucide-react') || id.includes('react-hot-toast')) {
              return 'vendor-ui';
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
