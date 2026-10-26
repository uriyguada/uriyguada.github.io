import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  server: { port: 5181, host: true },
  build: { assetsInlineLimit: 0 },
});
