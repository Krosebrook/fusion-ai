import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { PersonalizationService } from '@/components/services/PersonalizationService';

/**
 * usePageTracking - Auto-track page views and time spent
 */
export function usePageTracking(pageName) {
  const location = useLocation();
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    // Track page view on mount
    PersonalizationService.trackPageView(pageName || location.pathname);

    // Track time spent on page when leaving
    return () => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      PersonalizationService.trackPageView(
        pageName || location.pathname,
        duration
      );
    };
  }, [pageName, location.pathname]);
}