import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from './use-mobile';

describe('useIsMobile', () => {
  let matchMediaMock;
  let listeners = [];

  beforeEach(() => {
    listeners = [];
    
    // Mock window.matchMedia
    matchMediaMock = vi.fn((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event, handler) => {
        listeners.push(handler);
      }),
      removeEventListener: vi.fn((event, handler) => {
        const index = listeners.indexOf(handler);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    listeners = [];
  });

  it('should return false for desktop width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should return true for mobile width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 375,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should return true at breakpoint boundary (767px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 767,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should return false just above breakpoint (768px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 768,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should update when window is resized', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate resize to mobile
    act(() => {
      window.innerWidth = 375;
      listeners.forEach(listener => listener());
    });

    expect(result.current).toBe(true);
  });

  it('should clean up event listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile());
    
    expect(listeners.length).toBeGreaterThan(0);
    
    unmount();
    
    // Verify cleanup happened
    expect(matchMediaMock).toHaveBeenCalled();
  });

  it('should handle multiple resize events', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // First resize to mobile
    act(() => {
      window.innerWidth = 375;
      listeners.forEach(listener => listener());
    });
    expect(result.current).toBe(true);

    // Second resize back to desktop
    act(() => {
      window.innerWidth = 1200;
      listeners.forEach(listener => listener());
    });
    expect(result.current).toBe(false);
  });

  it('should use 768px as mobile breakpoint', () => {
    renderHook(() => useIsMobile());
    expect(matchMediaMock).toHaveBeenCalledWith('(max-width: 767px)');
  });
});
