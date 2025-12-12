/**
 * Motion System - Cinematic Animation Presets
 * Based on Disney's 12 Principles of Animation adapted for UI
 */

export const motionPresets = {
  // Fade Variants
  fadeIn: {
    name: 'Fade In',
    description: 'Simple opacity transition',
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
    useCases: ['general reveals', 'content loading', 'overlays'],
  },

  fadeInUp: {
    name: 'Fade In Up',
    description: 'Fade with upward motion',
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
    useCases: ['hero content', 'cards', 'modals'],
  },

  fadeInDown: {
    name: 'Fade In Down',
    description: 'Fade with downward motion',
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
    useCases: ['notifications', 'dropdowns', 'tooltips'],
  },

  // Scale Variants
  scaleIn: {
    name: 'Scale In',
    description: 'Grow from center',
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
    useCases: ['buttons', 'icons', 'alerts'],
  },

  scaleInSpring: {
    name: 'Scale In Spring',
    description: 'Grow with bounce',
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.3 },
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
    useCases: ['success states', 'reactions', 'playful interactions'],
  },

  // Slide Variants
  slideInLeft: {
    name: 'Slide In Left',
    description: 'Enter from left',
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
    useCases: ['sidebars', 'drawers', 'panels'],
  },

  slideInRight: {
    name: 'Slide In Right',
    description: 'Enter from right',
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
    useCases: ['sidebars', 'notifications', 'contextual menus'],
  },

  // Zoom Variants
  zoomIn: {
    name: 'Zoom In',
    description: 'Dramatic scale with blur',
    initial: { opacity: 0, scale: 1.2, filter: 'blur(10px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
    transition: {
      duration: 0.6,
      ease: [0.645, 0.045, 0.355, 1],
    },
    useCases: ['hero images', 'feature highlights', 'dramatic reveals'],
  },

  // Parallax
  parallax: {
    name: 'Parallax',
    description: 'Depth-based motion',
    variants: {
      near: { y: -50 },
      mid: { y: -25 },
      far: { y: -10 },
    },
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
    useCases: ['hero sections', 'scrolling narratives', 'depth layers'],
  },

  // Stagger
  staggerChildren: {
    name: 'Stagger Children',
    description: 'Sequential child animations',
    container: {
      animate: {
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2,
        },
      },
    },
    item: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
    useCases: ['lists', 'grids', 'sequential reveals'],
  },

  // Flip
  flip: {
    name: 'Flip',
    description: '3D card flip',
    initial: { rotateY: 0 },
    animate: { rotateY: 180 },
    transition: {
      duration: 0.6,
      ease: [0.645, 0.045, 0.355, 1],
    },
    style: { transformStyle: 'preserve-3d' },
    useCases: ['cards', 'reveals', 'interactions'],
  },

  // Rotate
  rotateIn: {
    name: 'Rotate In',
    description: 'Spin entrance',
    initial: { opacity: 0, rotate: -180, scale: 0.5 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 180, scale: 0.5 },
    transition: {
      duration: 0.7,
      ease: [0.68, -0.55, 0.265, 1.55],
    },
    useCases: ['loading spinners', 'playful interactions', 'feature badges'],
  },

  // Blur
  blurIn: {
    name: 'Blur In',
    description: 'Focus transition',
    initial: { opacity: 0, filter: 'blur(20px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(20px)' },
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
    useCases: ['images', 'backgrounds', 'cinematic transitions'],
  },

  // Bounce
  bounce: {
    name: 'Bounce',
    description: 'Spring bounce effect',
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'reverse',
      },
    },
    useCases: ['attention grabbers', 'call-to-actions', 'scroll indicators'],
  },

  // Pulse
  pulse: {
    name: 'Pulse',
    description: 'Subtle scale pulse',
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
    useCases: ['live indicators', 'notifications', 'attention'],
  },

  // Glow
  glow: {
    name: 'Glow',
    description: 'Pulsing glow effect',
    animate: {
      boxShadow: [
        '0 0 20px rgba(255, 123, 0, 0.4)',
        '0 0 40px rgba(255, 123, 0, 0.6)',
        '0 0 20px rgba(255, 123, 0, 0.4)',
      ],
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
    useCases: ['premium features', 'CTAs', 'highlights'],
  },

  // Page Transitions
  pageTransition: {
    name: 'Page Transition',
    description: 'Smooth page change',
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
    useCases: ['route changes', 'navigation', 'view switches'],
  },

  // Modal
  modal: {
    name: 'Modal',
    description: 'Modal entrance with backdrop',
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    content: {
      initial: { opacity: 0, scale: 0.95, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: 20 },
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    useCases: ['dialogs', 'overlays', 'confirmations'],
  },
};

// Animation timing functions
export const easingFunctions = {
  // Standard
  linear: [0, 0, 1, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  
  // Cinematic
  cinematic: [0.645, 0.045, 0.355, 1],
  dramatic: [0.68, -0.55, 0.265, 1.55],
  smooth: [0.25, 0.46, 0.45, 0.94],
  
  // Material Design
  standard: [0.4, 0.0, 0.2, 1],
  deceleration: [0.0, 0.0, 0.2, 1],
  acceleration: [0.4, 0.0, 1, 1],
  sharp: [0.4, 0.0, 0.6, 1],
  
  // Custom
  bounce: [0.68, -0.6, 0.32, 1.6],
  anticipate: [0.175, 0.885, 0.32, 1.275],
};

// Duration scales
export const durations = {
  instant: 0.075,
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.7,
  slowest: 1.0,
};

// Spring configurations
export const springConfigs = {
  default: { stiffness: 260, damping: 20 },
  gentle: { stiffness: 120, damping: 14 },
  wobbly: { stiffness: 180, damping: 12 },
  stiff: { stiffness: 300, damping: 25 },
  slow: { stiffness: 100, damping: 20 },
  bouncy: { stiffness: 400, damping: 10 },
};

export default { motionPresets, easingFunctions, durations, springConfigs };