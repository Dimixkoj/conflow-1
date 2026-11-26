import { defineConfig } from 'vite';
export default defineConfig({
  root: 'renderer',
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'es2022',
    rollupOptions: {
      input: {
        main: 'renderer/index.html',
        constructionDelivery: 'renderer/construction-delivery.html'
      }
    }
  },
  server: { host: '0.0.0.0' }
});