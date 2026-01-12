import { describe, it, expect, beforeEach } from 'vitest';
import { queryClientInstance } from './query-client';
import { QueryClient } from '@tanstack/react-query';

describe('queryClientInstance', () => {
  it('should be an instance of QueryClient', () => {
    expect(queryClientInstance).toBeInstanceOf(QueryClient);
  });

  it('should have refetchOnWindowFocus disabled', () => {
    const defaultOptions = queryClientInstance.getDefaultOptions();
    expect(defaultOptions.queries.refetchOnWindowFocus).toBe(false);
  });

  it('should have retry set to 1', () => {
    const defaultOptions = queryClientInstance.getDefaultOptions();
    expect(defaultOptions.queries.retry).toBe(1);
  });

  it('should have default query options configured', () => {
    const defaultOptions = queryClientInstance.getDefaultOptions();
    expect(defaultOptions.queries).toBeDefined();
    expect(typeof defaultOptions.queries).toBe('object');
  });

  it('should maintain same configuration across imports', () => {
    // Import again to verify configuration is consistent
    const { queryClientInstance: secondInstance } = require('./query-client');
    
    const firstOptions = queryClientInstance.getDefaultOptions();
    const secondOptions = secondInstance.getDefaultOptions();
    
    expect(firstOptions.queries.refetchOnWindowFocus).toBe(secondOptions.queries.refetchOnWindowFocus);
    expect(firstOptions.queries.retry).toBe(secondOptions.queries.retry);
  });
});
