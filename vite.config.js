import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        // Exclure les assets lourds 3D du pré-cache d'installation
        globIgnores: ['**/musee3d/**'],
        // Ne pré-cacher que l'enveloppe légère de la PWA
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Musée Virtuel',
        short_name: 'Musée',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1a1a1a',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});