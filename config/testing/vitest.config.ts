import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./config/testing/test-setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'test-setup.ts',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/*.config.js',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'src/components/**/*.stories.tsx',
        'src/main.tsx', // Entry point file
      ],
    },
  },
});