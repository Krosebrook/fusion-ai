/**
 * Test Utilities
 * 
 * Reusable utilities for testing React components and application logic.
 * Provides custom render functions with common providers and helpers.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

/**
 * Create a test QueryClient with specific options for testing
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Disable retries in tests
        retry: false,
        // Don't cache queries in tests
        cacheTime: 0,
      },
      mutations: {
        // Disable retries in tests
        retry: false,
      },
    },
    // Suppress error logging in tests
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}

/**
 * Custom render function that wraps components with common providers
 * 
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @param {QueryClient} options.queryClient - Custom QueryClient instance
 * @param {boolean} options.withRouter - Whether to wrap with BrowserRouter (default: true)
 * @param {Object} options.renderOptions - Additional options to pass to RTL render
 * @returns {Object} RTL render result with custom utilities
 */
export function renderWithProviders(
  ui,
  {
    queryClient = createTestQueryClient(),
    withRouter = true,
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    let wrapped = (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    if (withRouter) {
      wrapped = <BrowserRouter>{wrapped}</BrowserRouter>;
    }

    return wrapped;
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

/**
 * Wait for a specific condition to be true
 * Useful for testing async behavior
 * 
 * @param {Function} callback - Function that returns a boolean
 * @param {Object} options - Wait options
 * @param {number} options.timeout - Maximum time to wait in ms (default: 1000)
 * @param {number} options.interval - Check interval in ms (default: 50)
 * @returns {Promise<void>}
 */
export function waitFor(callback, { timeout = 1000, interval = 50 } = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      if (callback()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, interval);
      }
    };

    check();
  });
}

/**
 * Create a mock function that tracks calls
 * Similar to jest.fn()
 * 
 * @param {Function} implementation - Optional function implementation
 * @returns {Function} Mock function with call tracking
 */
export function createMockFn(implementation = () => {}) {
  const mockFn = (...args) => {
    mockFn.calls.push(args);
    mockFn.callCount++;
    return implementation(...args);
  };

  mockFn.calls = [];
  mockFn.callCount = 0;

  return mockFn;
}

// Re-export commonly used testing library utilities
export { screen, fireEvent, waitFor as rtlWaitFor } from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';
