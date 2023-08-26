import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';

export default defineConfig(() => {
  return {
    base: process.env.NODE_ENV === 'development' ? '/' : '/dist/',
    build: {
      outDir: 'api/dist',
    },
    server: {
      port: 3000,
    },
    plugins: [react(), eslint()],
  };
});
