# Testing Guide for FlashFusion

## Overview

This document provides comprehensive guidelines for testing the FlashFusion platform. The testing infrastructure is now operational and ready for use.

**Current Status:** ✅ Testing infrastructure operational (Q1 2026 Week 1 Complete)  
**Test Coverage:** 27 tests passing (100% coverage on tested files)  
**Target:** 40% overall coverage by Week 8 (Q1 2026)

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Open interactive test UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Testing Stack](#testing-stack)
- [Getting Started](#getting-started)
- [Testing Strategies](#testing-strategies)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

---

## Testing Philosophy

### Testing Pyramid

```
        /\
       /E2E\        <- Few (Critical user journeys)
      /------\
     /  INT   \     <- Some (Feature integrations)
    /----------\
   /   UNIT     \   <- Many (Individual functions)
  /--------------\
```

### Priorities

1. **Unit Tests (60%)** - Fast, isolated, many
2. **Integration Tests (30%)** - Feature interactions
3. **E2E Tests (10%)** - Critical user journeys

### Coverage Targets

| Component Type | Coverage Target | Current |
|----------------|-----------------|---------|
| Utilities | 90% | 100% (utils.js) |
| Hooks | 85% | 0% (planned Week 2-3) |
| Components | 75% | 100% (button.jsx) |
| Pages | 60% | 0% (planned Week 5-6) |
| Overall | 70% | 0% (baseline) |

### Current Test Files

- ✅ `src/lib/utils.test.js` - 8 tests (100% coverage)
- ✅ `src/components/ui/button.test.jsx` - 19 tests (100% coverage)
- 📁 `src/test/` - Test utilities, mocks, and setup

---

## Testing Stack

### ✅ Installed and Configured

```json
{
  "test-runner": "vitest v4.0.16",
  "ui-testing": "@testing-library/react",
  "user-simulation": "@testing-library/user-event",
  "matchers": "@testing-library/jest-dom",
  "environment": "jsdom",
  "coverage": "@vitest/coverage-v8",
  "interactive-ui": "@vitest/ui"
}
```

### Installation Complete

All testing dependencies are installed and configured. See `package.json` for versions:

```bash
# Already installed - no action needed
✅ vitest
✅ @vitest/ui
✅ @vitest/coverage-v8
✅ @testing-library/react
✅ @testing-library/jest-dom
✅ @testing-library/user-event
✅ jsdom
```

### 🔜 Planned (Future Phases)

```bash
# E2E Testing (Week 4)
npm install -D @playwright/test

# API Mocking (as needed)
npm install -D msw
```

---

## Getting Started

### Configuration Files

#### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### src/test/setup.ts

```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers for better DOM testing
// This adds matchers like toBeInTheDocument(), toBeVisible(), toHaveClass(), etc.
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.VITE_BASE44_URL = 'http://localhost:3000';
process.env.VITE_API_URL = 'http://localhost:3001';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Run tests in UI mode
npm test:ui

# Run E2E tests
npm test:e2e

# Run specific test file
npm test -- Button.test.jsx

# Run tests matching pattern
npm test -- --grep "authentication"
```

---

## Testing Strategies

### 1. Unit Testing

Test individual functions and components in isolation.

#### Example: Testing a Utility Function

```javascript
// src/utils/formatDate.test.js
import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('formats date as MM/DD/YYYY by default', () => {
    const date = new Date('2025-12-30');
    expect(formatDate(date)).toBe('12/30/2025');
  });

  it('handles custom format strings', () => {
    const date = new Date('2025-12-30');
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2025-12-30');
  });

  it('handles invalid dates', () => {
    expect(formatDate(null)).toBe('Invalid Date');
  });
});
```

#### Example: Testing a React Component

```javascript
// src/components/ui/Button.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Click me</Button>);
    expect(screen.getByText('Click me')).toHaveClass('custom-class');
  });
});
```

#### Example: Testing a Custom Hook

```javascript
// src/hooks/useAuth.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    // Clear any stored auth state
    localStorage.clear();
  });

  it('initializes with no user', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('loads user from storage on mount', async () => {
    localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Test' }));
    
    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
      expect(result.current.user).toEqual({ id: '1', name: 'Test' });
    });
  });

  it('handles login correctly', async () => {
    const { result } = renderHook(() => useAuth());
    
    await result.current.login({ email: 'test@example.com', password: 'pass' });
    
    expect(result.current.user).toBeTruthy();
  });
});
```

### 2. Integration Testing

Test how components work together.

```javascript
// src/pages/Dashboard.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { AuthProvider } from '../contexts/AuthContext';

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider value={{ user: mockUser, loading: false }}>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Dashboard Integration', () => {
  it('displays user information', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('fetches and displays dashboard data', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });
  });
});
```

### 3. API Mocking with MSW

```javascript
// src/test/mocks/handlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock user authentication
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    
    if (email === 'test@example.com' && password === 'password') {
      return HttpResponse.json({
        user: { id: '1', name: 'Test User', email },
        token: 'mock-token',
      });
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // Mock pipeline generation
  http.post('/api/generate-pipeline', async ({ request }) => {
    const { description } = await request.json();
    
    return HttpResponse.json({
      success: true,
      config: {
        projectType: 'react',
        buildCommand: 'npm run build',
        testCommand: 'npm test',
      },
    });
  }),
];
```

```javascript
// src/test/mocks/server.js
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```javascript
// src/test/setup.ts (add this)
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 4. E2E Testing with Playwright

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('user can sign in', async ({ page }) => {
    await page.goto('/');
    
    // Click sign in button
    await page.click('text=Sign In');
    
    // Fill in credentials
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('displays error for invalid credentials', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});
```

```typescript
// tests/e2e/pipeline.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Pipeline Generation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('generates pipeline from description', async ({ page }) => {
    await page.goto('/ai-pipeline-generator');
    
    // Enter description
    await page.fill(
      'textarea[name="description"]',
      'React app with Jest tests, deploy to Vercel'
    );
    
    // Generate
    await page.click('button:has-text("Generate Pipeline")');
    
    // Wait for result
    await page.waitForSelector('.pipeline-config');
    
    // Verify output
    await expect(page.locator('text=react')).toBeVisible();
    await expect(page.locator('text=npm run build')).toBeVisible();
  });
});
```

---

## Writing Tests

### Test Structure

Follow the AAA pattern:

```javascript
it('descriptive test name', () => {
  // Arrange - Set up test data and environment
  const user = { name: 'Test', id: '1' };
  
  // Act - Perform the action being tested
  const result = formatUser(user);
  
  // Assert - Verify the result
  expect(result).toBe('Test (ID: 1)');
});
```

### Naming Conventions

```javascript
// ✅ Good - Descriptive and specific
it('returns empty array when no items match filter')
it('disables submit button when form is invalid')
it('shows error message for network failures')

// ❌ Bad - Too vague
it('works correctly')
it('handles edge cases')
it('tests the component')
```

### Test Organization

```
src/
├── components/
│   └── ui/
│       ├── Button.jsx
│       └── Button.test.jsx      ← Test next to component
├── hooks/
│   ├── useAuth.js
│   └── useAuth.test.js          ← Test next to hook
└── utils/
    ├── formatDate.js
    └── formatDate.test.js       ← Test next to utility
```

---

## Best Practices

### 1. Test Behavior, Not Implementation

```javascript
// ❌ Bad - Testing implementation details
it('sets state to true when button is clicked', () => {
  const { result } = renderHook(() => useState(false));
  // Testing internal state
});

// ✅ Good - Testing user-visible behavior
it('shows success message when form is submitted', () => {
  render(<Form />);
  fireEvent.submit(screen.getByRole('button'));
  expect(screen.getByText('Success!')).toBeVisible();
});
```

### 2. Use Data-Testid Sparingly

```javascript
// ❌ Bad - Over-reliance on test IDs
<div data-testid="user-profile">...</div>

// ✅ Good - Use semantic queries
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email address')
screen.getByText('Welcome back')
```

### 3. Keep Tests Independent

```javascript
// ❌ Bad - Tests depend on each other
describe('Counter', () => {
  let count = 0;
  
  it('increments', () => {
    count++;
    expect(count).toBe(1);
  });
  
  it('increments again', () => {
    count++; // Depends on previous test
    expect(count).toBe(2);
  });
});

// ✅ Good - Each test is independent
describe('Counter', () => {
  it('increments from 0 to 1', () => {
    const counter = new Counter();
    counter.increment();
    expect(counter.value).toBe(1);
  });
  
  it('increments from any value', () => {
    const counter = new Counter(5);
    counter.increment();
    expect(counter.value).toBe(6);
  });
});
```

### 4. Use Factories for Test Data

```javascript
// src/test/factories.js
export const createUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  ...overrides,
});

export const createPipeline = (overrides = {}) => ({
  id: '1',
  name: 'Test Pipeline',
  projectType: 'react',
  ...overrides,
});

// In tests
const admin = createUser({ role: 'admin' });
const pipeline = createPipeline({ projectType: 'node' });
```

### 5. Mock External Dependencies

```javascript
// Mock axios
vi.mock('axios');

// Mock custom modules
vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock environment variables
vi.stubEnv('VITE_API_URL', 'http://test-api.com');
```

### 6. Test Error Scenarios

```javascript
describe('fetchUser', () => {
  it('handles network errors', async () => {
    apiClient.get.mockRejectedValueOnce(new Error('Network error'));
    
    await expect(fetchUser('1')).rejects.toThrow('Network error');
  });

  it('handles 404 responses', async () => {
    apiClient.get.mockResolvedValueOnce({ status: 404 });
    
    const result = await fetchUser('999');
    expect(result).toBeNull();
  });
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run typecheck
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

### Quality Gates

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
```

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)

---

*Last Updated: January 8, 2026*
*Version: 1.1*
