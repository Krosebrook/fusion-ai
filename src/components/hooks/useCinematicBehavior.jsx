import { useState, useEffect, useCallback, useRef } from 'react';
import { cinematicEngine } from '@/components/cinematic-engine/CinematicInteractionEngine';

export function useCinematicBehavior(elementId, options = {}) {
  const [animationProfile, setAnimationProfile] = useState(cinematicEngine.getAnimationProfile());
  const [contentPriority, setContentPriority] = useState(null);
  const elementRef = useRef(null);

  useEffect(() => {
    // Subscribe to engine updates
    const unsubscribe = cinematicEngine.subscribe((event) => {
      if (event.type === 'profile-update') {
        setAnimationProfile(event.profile);
      }
    });

    // Get content priority
    const priority = cinematicEngine.getContentPriority(elementId);
    if (priority) {
      setContentPriority(priority);
    }

    return unsubscribe;
  }, [elementId]);

  // Track interactions
  const handleClick = useCallback((e) => {
    cinematicEngine.trackUserBehavior('click', {
      elementId,
      position: { x: e.clientX, y: e.clientY },
      timestamp: Date.now(),
    });
    options.onClick?.(e);
  }, [elementId, options]);

  const handleHover = useCallback((e) => {
    cinematicEngine.trackUserBehavior('hover', {
      elementId,
      position: { x: e.clientX, y: e.clientY },
      timestamp: Date.now(),
    });
    options.onHover?.(e);
  }, [elementId, options]);

  const handleDwell = useCallback((duration) => {
    cinematicEngine.trackUserBehavior('dwell', {
      elementId,
      duration,
    });
  }, [elementId]);

  // Dwell time tracking
  useEffect(() => {
    if (!elementRef.current) return;

    let enterTime = null;
    const element = elementRef.current;

    const handleMouseEnter = () => {
      enterTime = Date.now();
    };

    const handleMouseLeave = () => {
      if (enterTime) {
        const duration = Date.now() - enterTime;
        handleDwell(duration);
        enterTime = null;
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleDwell]);

  // Calculate dynamic animation properties
  const getAnimationProps = useCallback(() => {
    const base = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    };

    if (!contentPriority) return base;

    const emphasis = contentPriority.importance * animationProfile.intensity;
    const duration = 0.6 * animationProfile.speed;

    // Adjust based on priority
    const animations = {
      critical: {
        initial: { opacity: 0, scale: 0.8, y: 30 },
        animate: { 
          opacity: 1, 
          scale: 1, 
          y: 0,
          transition: {
            duration: duration * 1.2,
            ease: [0.22, 1, 0.36, 1], // Custom easing for emphasis
          }
        },
      },
      high: {
        initial: { opacity: 0, x: -20, scale: 0.95 },
        animate: { 
          opacity: 1, 
          x: 0, 
          scale: 1,
          transition: { duration, ease: [0.4, 0, 0.2, 1] }
        },
      },
      medium: {
        initial: { opacity: 0, y: 20 },
        animate: { 
          opacity: 1, 
          y: 0,
          transition: { duration: duration * 0.9 }
        },
      },
      low: {
        initial: { opacity: 0 },
        animate: { 
          opacity: 1,
          transition: { duration: duration * 0.7 }
        },
      },
    };

    return animations[contentPriority.priority] || base;
  }, [contentPriority, animationProfile]);

  return {
    elementRef,
    animationProfile,
    contentPriority,
    animationProps: getAnimationProps(),
    handlers: {
      onClick: handleClick,
      onMouseEnter: handleHover,
    },
  };
}