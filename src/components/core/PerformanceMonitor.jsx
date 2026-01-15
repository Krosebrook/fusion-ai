import { useEffect } from 'react';

/**
 * Performance monitoring utility
 * Tracks Core Web Vitals and custom metrics
 */

export class PerformanceMonitor {
  static metrics = {};

  /**
   * Mark performance measurement start
   */
  static mark(label) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-start`);
    }
  }

  /**
   * Measure performance from mark to now
   */
  static measure(label) {
    if (typeof performance !== 'undefined') {
      try {
        performance.mark(`${label}-end`);
        performance.measure(label, `${label}-start`, `${label}-end`);
        
        const measure = performance.getEntriesByName(label)[0];
        this.metrics[label] = measure.duration;
        
        // Log slow operations (>1s)
        if (measure.duration > 1000) {
          console.warn(`[Performance] ${label} took ${measure.duration.toFixed(2)}ms`);
        }
        
        return measure.duration;
      } catch (e) {
        // Mark doesn't exist, ignore
      }
    }
    return 0;
  }

  /**
   * Get Core Web Vitals
   */
  static getCoreWebVitals() {
    if (typeof window === 'undefined') return {};

    const vitals = {};

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      vitals.LCP = lastEntry.renderTime || lastEntry.loadTime;
    });
    
    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // Not supported
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        vitals.FID = entry.processingStart - entry.startTime;
      });
    });

    try {
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      // Not supported
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          vitals.CLS = clsValue;
        }
      }
    });

    try {
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      // Not supported
    }

    return vitals;
  }

  /**
   * Log all metrics to console
   */
  static logMetrics() {
    console.table(this.metrics);
    console.log('Core Web Vitals:', this.getCoreWebVitals());
  }

  /**
   * Send metrics to analytics
   */
  static async reportMetrics(endpoint) {
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: this.metrics,
          vitals: this.getCoreWebVitals(),
          timestamp: Date.now(),
        }),
      });
    } catch (e) {
      console.error('Failed to report metrics:', e);
    }
  }
}

/**
 * React Hook for performance monitoring
 */
export function usePerformanceMonitor(label) {
  useEffect(() => {
    PerformanceMonitor.mark(label);
    
    return () => {
      PerformanceMonitor.measure(label);
    };
  }, [label]);
}

/**
 * HOC for component performance tracking
 */
export function withPerformanceMonitoring(Component, label) {
  return function MonitoredComponent(props) {
    usePerformanceMonitor(label || Component.name);
    return <Component {...props} />;
  };
}