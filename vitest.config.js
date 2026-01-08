import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitest.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: 'jsdom',
    
    // Global test setup
    setupFiles: ['./src/test/setup.js'],
    
    // Enable globals (describe, it, expect, etc.)
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{js,jsx}',
        '**/*.spec.{js,jsx}',
        '**/dist/',
        '**/build/',
        '**/.{git,cache,output,temp}/',
        '**/{vite,vitest,postcss,tailwind,eslint}.config.{js,ts}',
      ],
      // Initial thresholds - can be increased incrementally
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
    },
    
    // Include test files
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    
    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
    ],
    
    // Test timeout
    testTimeout: 10000,
    
    // Hook timeout
    hookTimeout: 10000,
    
    // Watch options
    watch: {
      enabled: false, // Disable by default, enable with --watch flag
    },
  },
  
  // Resolve aliases to match Vite config
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
