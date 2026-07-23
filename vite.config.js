import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),

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
  ],
});
