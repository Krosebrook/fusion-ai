/**
 * Test Mocks
 * 
 * Mock data and mock functions for testing.
 * Provides reusable mock objects, API responses, and integration mocks.
 */

/**
 * Mock user data
 */
export const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
};

/**
 * Mock admin user data
 */
export const mockAdminUser = {
  id: 'admin-user-123',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
};

/**
 * Mock API responses
 */
export const mockApiResponses = {
  success: {
    status: 200,
    data: { success: true },
  },
  error: {
    status: 500,
    data: { error: 'Internal server error' },
  },
  notFound: {
    status: 404,
    data: { error: 'Not found' },
  },
  unauthorized: {
    status: 401,
    data: { error: 'Unauthorized' },
  },
};

/**
 * Mock Base44 SDK client
 * Use this to mock API calls in tests
 */
export const mockBase44Client = {
  auth: {
    signIn: () => Promise.resolve({ user: mockUser }),
    signOut: () => Promise.resolve(),
    getSession: () => Promise.resolve({ user: mockUser }),
  },
  functions: {
    call: (name, params) => {
      // Return different responses based on function name
      return Promise.resolve({ data: { success: true } });
    },
  },
  entities: {
    get: (type, id) => Promise.resolve({ id, type }),
    list: (type) => Promise.resolve([]),
    create: (type, data) => Promise.resolve({ id: 'new-id', ...data }),
    update: (type, id, data) => Promise.resolve({ id, ...data }),
    delete: (type, id) => Promise.resolve(),
  },
};

/**
 * Mock localStorage
 * Use this when testing code that uses localStorage
 */
export const mockLocalStorage = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

/**
 * Mock window.location
 * Use this when testing code that uses window.location
 */
export function mockLocation(url = 'http://localhost:5173/') {
  delete window.location;
  window.location = new URL(url);
}

/**
 * Mock fetch API
 * Use this when testing code that uses fetch
 * 
 * @param {Object} response - Mock response object
 * @param {number} response.status - HTTP status code
 * @param {*} response.data - Response data
 * @returns {Function} Mock fetch function
 */
export function createMockFetch(response = mockApiResponses.success) {
  return () =>
    Promise.resolve({
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      json: () => Promise.resolve(response.data),
      text: () => Promise.resolve(JSON.stringify(response.data)),
    });
}

/**
 * Mock console methods
 * Use this to suppress console output in tests
 * 
 * @returns {Object} Mocked console with restore function
 */
export function mockConsole() {
  const originalConsole = { ...console };
  const calls = {
    log: [],
    warn: [],
    error: [],
    info: [],
  };

  ['log', 'warn', 'error', 'info'].forEach((method) => {
    console[method] = (...args) => {
      calls[method].push(args);
    };
  });

  return {
    calls,
    restore: () => {
      Object.assign(console, originalConsole);
    },
  };
}

/**
 * Wait utility for async operations
 * 
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export function wait(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock setTimeout/setInterval for testing
 * Use this when testing code with timers
 * 
 * @returns {Object} Timer controls
 */
export function mockTimers() {
  const timers = [];
  let currentTime = 0;

  const originalSetTimeout = global.setTimeout;
  const originalSetInterval = global.setInterval;
  const originalClearTimeout = global.clearTimeout;
  const originalClearInterval = global.clearInterval;

  global.setTimeout = (fn, delay) => {
    const id = timers.length;
    timers.push({ fn, time: currentTime + delay, type: 'timeout' });
    return id;
  };

  global.setInterval = (fn, delay) => {
    const id = timers.length;
    timers.push({ fn, time: currentTime + delay, interval: delay, type: 'interval' });
    return id;
  };

  global.clearTimeout = (id) => {
    timers[id] = null;
  };

  global.clearInterval = (id) => {
    timers[id] = null;
  };

  return {
    advance: (ms) => {
      currentTime += ms;
      timers.forEach((timer, id) => {
        if (timer && timer.time <= currentTime) {
          timer.fn();
          if (timer.type === 'interval') {
            timers[id] = { ...timer, time: currentTime + timer.interval };
          } else {
            timers[id] = null;
          }
        }
      });
    },
    restore: () => {
      global.setTimeout = originalSetTimeout;
      global.setInterval = originalSetInterval;
      global.clearTimeout = originalClearTimeout;
      global.clearInterval = originalClearInterval;
    },
  };
}
