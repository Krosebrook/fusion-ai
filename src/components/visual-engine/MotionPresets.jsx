import React from 'react';

export const MOTION_PRESETS = {
  // Easing curves based on cinema principles
  easings: {
    smooth: [0.4, 0, 0.2, 1], // Default Material Design
    spring: [0.34, 1.56, 0.64, 1], // Bouncy spring
    cinematic: [0.83, 0, 0.17, 1], // Film-like acceleration
    anticipation: [0.68, -0.55, 0.27, 1.55], // Disney anticipation
  },

  // Animation presets
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },

  slideInRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },

  cinemaEntry: {
    initial: { opacity: 0, y: 30, rotateX: -15 },
    animate: { opacity: 1, y: 0, rotateX: 0 },
    transition: { 
      duration: 0.8, 
      ease: [0.83, 0, 0.17, 1],
      rotateX: { duration: 1.2 }
    },
  },

  stagger: {
    container: {
      animate: {
        transition: {
          staggerChildren: 0.05,
          delayChildren: 0.1,
        }
      }
    },
    item: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    }
  },

  parallax: {
    scrollBased: (offset = 0.5) => ({
      y: offset * 100,
      transition: { ease: [0.4, 0, 0.2, 1] }
    })
  },
};

export function useScrollParallax(ref, speed = 0.5) {
  const [offset, setOffset] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrolled = window.scrollY;
        setOffset(scrolled * speed);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref, speed]);

  return offset;
}