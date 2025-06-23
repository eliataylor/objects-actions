import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    alias: {
      'next/server': resolve(__dirname, './src/test/mocks/next-server.ts'),
      'next/navigation': resolve(__dirname, './src/test/mocks/next-navigation.ts'),
    },
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
    },
  },
}); 