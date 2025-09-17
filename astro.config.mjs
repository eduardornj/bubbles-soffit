import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://bubblesenterprise.com',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      entryLimit: 10000,
    }),
  ],
  output: 'hybrid',
  build: {
    assets: 'assets',
    inlineStylesheets: 'auto',
    assetsPrefix: process.env.CDN_URL || undefined,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['./src/utils/calculator.js'],
        },
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
  },
  image: {
    domains: ['bubblesenterprise.com'],
    remotePatterns: [{
      protocol: 'https',
      hostname: '**.bubblesenterprise.com'
    }]
  },
  compressHTML: true,
  vite: {
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            if (id.includes('src/utils')) {
              return 'utils';
            }
          },
        },
      },
    },
    optimizeDeps: {
      exclude: ['@astrojs/react'],
      include: ['react', 'react-dom'],
    },
    server: {
      hmr: {
        overlay: false,
        clientPort: 3001,
        port: 24678,
      },
      middlewareMode: false,
      fs: {
        strict: false,
      },
      cors: true,
      proxy: {},
    },
    plugins: [
      {
        name: 'connection-limiter',
        configureServer(server) {
          // Limita conexões múltiplas
          const connections = new Set();
          server.middlewares.use((req, res, next) => {
            const clientIP = req.connection.remoteAddress;
            if (req.url === '/.well-known/appspecific/com.chrome.devtools.json') {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'DevTools integration disabled' }));
              return;
            }
            next();
          });
        },
      },
    ],
  },
  server: {
    port: 3001,
    host: '127.0.0.1', // Usa IP específico ao invés de true
    strictPort: true,
  },
});