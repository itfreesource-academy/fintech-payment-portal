import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/services/**/*.ts', 'src/routes/**/*.ts', 'src/middleware/**/*.ts'],
      exclude: ['src/tests/**', 'src/types/**']
    }
  }
});
