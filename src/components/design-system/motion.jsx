/**
 * Motion Design System
 * Disney's 12 Principles adapted for UI
 */

import { TOKENS } from './tokens';

export const MOTION_VARIANTS = {
  // Fade Animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: TOKENS.motion.easing.smooth }
  },

  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: TOKENS.motion.easing.smooth }
  },

  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: TOKENS.motion.easing.smooth }
  },

  // Scale Animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: TOKENS.motion.easing.smooth }
  },

  popIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.2, ease: TOKENS.motion.easing.bounce }
  },

  // Slide Animations
  slideInRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
    transition: { duration: 0.3, ease: TOKENS.motion.easing.smooth }
  },

  slideInLeft: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
    transition: { duration: 0.3, ease: TOKENS.motion.easing.smooth }
  },

  // Stagger Containers
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  },

  // Hover States
  hoverScale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: 'spring', stiffness: 400, damping: 17 }
  },

  hoverLift: {
    whileHover: { y: -4, boxShadow: TOKENS.shadows.lg },
    transition: { duration: 0.2, ease: TOKENS.motion.easing.smooth }
  },

  // Loading States
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1]
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: TOKENS.motion.easing.smooth
    }
  },

  spin: {
    animate: { rotate: 360 },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// Animation utilities
export const withMotion = (variants) => ({
  variants,
  initial: 'initial',
  animate: 'animate',
  exit: 'exit'
});

export const withStagger = (children, staggerDelay = 0.1) => ({
  variants: MOTION_VARIANTS.staggerContainer,
  initial: 'initial',
  animate: 'animate',
  transition: { staggerChildren: staggerDelay }
});

export default MOTION_VARIANTS;