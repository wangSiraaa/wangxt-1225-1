import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/pond': 'http://localhost:3000',
      '/medication': 'http://localhost:3000',
      '/batch': 'http://localhost:3000',
      '/workorder': 'http://localhost:3000',
    },
  },
});
