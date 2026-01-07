/**
 * Tests for src/lib/utils.js
 * 
 * Example tests demonstrating the Vitest setup and testing utilities.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('foo', 'bar');
    expect(result).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('base', isActive && 'active');
    expect(result).toBe('base active');
  });

  it('should handle falsy values', () => {
    const result = cn('foo', false, null, undefined, 'bar');
    expect(result).toBe('foo bar');
  });

  it('should merge Tailwind classes correctly', () => {
    // twMerge should handle conflicting Tailwind classes
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toBe('py-1 px-4');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['foo', 'bar'], 'baz');
    expect(result).toBe('foo bar baz');
  });

  it('should handle objects with boolean values', () => {
    const result = cn({ foo: true, bar: false, baz: true });
    expect(result).toBe('foo baz');
  });
});

describe('isIframe check', () => {
  // Note: In a real testing environment, we'd need to mock window.self and window.top
  // For now, this is a placeholder to demonstrate how to structure such tests
  
  it('should be defined', async () => {
    // This test verifies the export exists
    // In jsdom environment, this will be false since we're not in an iframe
    const { isIframe } = await import('./utils');
    expect(typeof isIframe).toBe('boolean');
  });
});
