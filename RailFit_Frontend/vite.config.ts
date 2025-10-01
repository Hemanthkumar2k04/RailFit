import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    // PWA plugin removed - no service worker or manifest injection
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          
          // UI component libraries
          'ui-components': [
            '@radix-ui/react-slot',
            'class-variance-authority',
            'clsx',
            'tailwind-merge'
          ],
          
          // Large visualization library
          'charts': ['recharts'],
          
          // Icons library
          'icons': ['lucide-react'],
          
          // QR code functionality
          'qr-utils': ['qr-scanner', 'qrcode']
        }
      }
    },
    target: 'esnext',
    minify: 'esbuild',
    // Chunk size warnings at 1000kb
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    exclude: ['@rollup/rollup-linux-x64-gnu', '@rollup/rollup-linux-x64-musl'],
    include: ['qr-scanner']
  },
  define: {
    global: 'globalThis'
  },
  server: {
    open: true
  }
});