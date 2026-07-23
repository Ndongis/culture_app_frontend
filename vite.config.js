import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import React from 'react';
export default defineConfig({
  plugins: [
    react(),

    // Plugin custom existant : sert les fichiers .br avec les bons en-têtes
    // en développement local (serveur Vite dev)
    {
      name: 'unity-brotli',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Extraire le chemin de l'URL sans les paramètres de requête (?v=...)
          const urlPath = req.url.split('?')[0];

          if (urlPath.endsWith('.br')) {
            // Appliquer l'encodage Brotli à tous les fichiers .br
            res.setHeader('Content-Encoding', 'br');

            // Assigner le bon type MIME selon l'extension d'origine
            if (urlPath.endsWith('.data.br')) {
              res.setHeader('Content-Type', 'application/octet-stream');
            } else if (urlPath.endsWith('.wasm.br')) {
              res.setHeader('Content-Type', 'application/wasm');
            } else if (urlPath.endsWith('.js.br')) {
              res.setHeader('Content-Type', 'application/javascript');
            }
          }

          next();
        });
      },
    },

    // Plugin PWA : rend l'app installable sur mobile (icône, plein écran, offline partiel)
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Musée Virtuel',
        short_name: 'Musée',
        description: 'Visite virtuelle du musée en 3D',
        theme_color: '#1a1a1a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          {
            src: '/logo192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logo512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // Exclure les gros fichiers Unity du cache automatique du service worker
        // (trop volumineux pour le cache par défaut, et déjà gérés par Unity Cache/IndexedDB)
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 Mo max pour le cache auto
        navigateFallbackDenylist: [/^\/musee3d\//], // ne pas intercepter les requêtes Unity
      },
    }),
  ],
});