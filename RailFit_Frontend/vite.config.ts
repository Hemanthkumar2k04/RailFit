import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// ...existing code...
export default defineConfig({
  // ...existing config...
  plugins: [
    // ...other plugins...
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'RailFit',
        short_name: 'RailFit',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1976d2',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});