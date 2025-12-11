/**
 * Production Performance Monitoring
 * Tracks page load, API calls, renders, and user interactions
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoads: [],
      apiCalls: [],
      renders: [],
      interactions: []
    };
    this.thresholds = {
      slowAPI: 2000, // 2s
      slowRender: 16, // 60fps threshold
      slowLoad: 3000 // 3s
    };
  }

  // Track page load performance
  trackPageLoad(pageName) {
    if (!window.performance) return;

    const perfData = performance.getEntriesByType('navigation')[0];
    if (!perfData) return;

    const metrics = {
      pageName,
      timestamp: Date.now(),
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      dns: perfData.domainLookupEnd - perfData.domainLookupStart,
      tcp: perfData.connectEnd - perfData.connectStart,
      ttfb: perfData.responseStart - perfData.requestStart,
      download: perfData.responseEnd - perfData.responseStart,
    };

    this.metrics.pageLoads.push(metrics);

    if (metrics.loadComplete > this.thresholds.slowLoad) {
      console.warn(`Slow page load detected: ${pageName}`, metrics);
    }

    return metrics;
  }

  // Track API call performance
  trackAPICall(endpoint, duration, status) {
    const metric = {
      endpoint,
      duration,
      status,
      timestamp: Date.now()
    };

    this.metrics.apiCalls.push(metric);

    if (duration > this.thresholds.slowAPI) {
      console.warn(`Slow API call: ${endpoint} (${duration}ms)`);
    }

    return metric;
  }

  // Track component render time
  trackRender(componentName, duration) {
    const metric = {
      componentName,
      duration,
      timestamp: Date.now()
    };

    this.metrics.renders.push(metric);

    if (duration > this.thresholds.slowRender) {
      console.warn(`Slow render: ${componentName} (${duration}ms)`);
    }

    return metric;
  }

  // Track user interactions
  trackInteraction(action, element, metadata = {}) {
    const metric = {
      action,
      element,
      metadata,
      timestamp: Date.now()
    };

    this.metrics.interactions.push(metric);
    return metric;
  }

  // Get performance summary
  getSummary() {
    return {
      avgPageLoad: this.average(this.metrics.pageLoads, 'loadComplete'),
      avgAPICall: this.average(this.metrics.apiCalls, 'duration'),
      avgRender: this.average(this.metrics.renders, 'duration'),
      totalInteractions: this.metrics.interactions.length,
      slowAPICalls: this.metrics.apiCalls.filter(m => m.duration > this.thresholds.slowAPI).length,
      slowRenders: this.metrics.renders.filter(m => m.duration > this.thresholds.slowRender).length
    };
  }

  average(array, key) {
    if (!array.length) return 0;
    return array.reduce((sum, item) => sum + item[key], 0) / array.length;
  }

  // Clear old metrics (keep last 100 of each)
  cleanup() {
    Object.keys(this.metrics).forEach(key => {
      if (this.metrics[key].length > 100) {
        this.metrics[key] = this.metrics[key].slice(-100);
      }
    });
  }

  // Export metrics for analytics
  export() {
    return {
      ...this.metrics,
      summary: this.getSummary(),
      timestamp: Date.now()
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React hook for performance tracking
export function usePerformanceTrack(componentName) {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      performanceMonitor.trackRender(componentName, duration);
    };
  }, [componentName]);
}

// HOC for automatic performance tracking
export function withPerformanceTracking(Component, componentName) {
  return function PerformanceTrackedComponent(props) {
    const startTime = React.useRef(performance.now());

    React.useEffect(() => {
      const duration = performance.now() - startTime.current;
      performanceMonitor.trackRender(componentName, duration);
    }, []);

    return <Component {...props} />;
  };
}