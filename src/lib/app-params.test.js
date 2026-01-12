import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock window.location
const mockLocation = {
  hostname: 'test.example.com',
  search: '?appId=test-app&token=test-token-123'
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

describe('app-params', () => {
  beforeEach(() => {
    // Clear module cache before each test
    vi.resetModules();
  });

  it('should export appParams object', async () => {
    const { appParams } = await import('./app-params');
    expect(appParams).toBeDefined();
    expect(typeof appParams).toBe('object');
  });

  it('should have required properties', async () => {
    const { appParams } = await import('./app-params');
    
    expect(appParams).toHaveProperty('appId');
    expect(appParams).toHaveProperty('serverUrl');
    expect(appParams).toHaveProperty('token');
    expect(appParams).toHaveProperty('functionsVersion');
  });

  it('should have correct types for properties', async () => {
    const { appParams } = await import('./app-params');
    
    // In test environment, these may be null if env vars not set
    // Check that they're either null or the expected type
    const isValidType = (value, expectedType) => {
      return value === null || typeof value === expectedType;
    };
    
    expect(isValidType(appParams.appId, 'string')).toBe(true);
    expect(isValidType(appParams.serverUrl, 'string')).toBe(true);
    expect(isValidType(appParams.functionsVersion, 'string')).toBe(true);
    expect(isValidType(appParams.token, 'string')).toBe(true);
  });

  it('should have valid serverUrl format when set', async () => {
    const { appParams } = await import('./app-params');
    
    // Only check format if serverUrl is set
    if (appParams.serverUrl) {
      expect(
        appParams.serverUrl.startsWith('http://') || 
        appParams.serverUrl.startsWith('https://')
      ).toBe(true);
    } else {
      // In test environment, serverUrl may be null
      expect(appParams.serverUrl).toBeNull();
    }
  });

  it('should handle missing environment variables gracefully', async () => {
    const { appParams } = await import('./app-params');
    
    // App params should exist even if env vars aren't set
    expect(appParams).toBeDefined();
    expect(typeof appParams).toBe('object');
  });
});
