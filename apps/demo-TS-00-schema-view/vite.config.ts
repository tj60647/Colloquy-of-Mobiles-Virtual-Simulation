import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    outDir: './dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@lib': resolve(__dirname, '../../lib'),
    },
    dedupe: ['three'],
  },
  server: {
    port: 3000,
    open: true,
  },
});
