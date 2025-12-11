/**
 * Cinematic Design System Configuration
 * Based on 15 years of UI/UX and creative direction experience
 */

export const CINEMA_CONFIG = {
  // Camera & Lens Settings
  camera: {
    presets: {
      'full-frame': {
        sensor: 'Full Frame 35mm',
        camera: 'Canon EOS R5 / Sony A7R IV',
        quality: 'cinema-grade'
      },
      'cinema': {
        sensor: 'Super 35mm',
        camera: 'ARRI Alexa Mini',
        quality: 'professional-film'
      }
    },
    lenses: {
      '35mm-f1.4': {
        focal: '35mm',
        aperture: 'f/1.4',
        use: 'Natural perspective, shallow depth of field',
        bokeh: 'creamy',
        distortion: 'minimal'
      },
      '85mm-f1.2': {
        focal: '85mm',
        aperture: 'f/1.2',
        use: 'Portrait, ultra-shallow DOF',
        bokeh: 'ultra-creamy',
        compression: 'flattering'
      },
      '24mm-f2.8': {
        focal: '24mm',
        aperture: 'f/2.8',
        use: 'Wide immersive views',
        coverage: 'expansive',
        distortion: 'minimal-barrel'
      }
    }
  },

  // Lighting Setups
  lighting: {
    'three-point': {
      key: { angle: 45, intensity: 100, color: '#FFFFFF' },
      fill: { angle: -45, intensity: 50, color: '#FFF5E1' },
      rim: { angle: 180, intensity: 75, color: '#00B4D8' }
    },
    'softbox': {
      type: 'diffused',
      softness: 'high',
      temperature: '5600K',
      use: 'Flattering portraits, product shots'
    },
    'golden-hour': {
      temperature: '3200K',
      direction: 'low-angle',
      quality: 'warm-soft',
      time: 'sunset/sunrise'
    },
    'rgb-edge': {
      primary: '#FF7B00',
      secondary: '#00B4D8',
      accent: '#E91E63',
      use: 'Futuristic tech accents'
    }
  },

  // Color Grading & LUTs
  color: {
    primary: {
      orange: '#FF7B00',
      cyan: '#00B4D8',
      pink: '#E91E63'
    },
    grading: {
      'teal-orange': {
        shadows: { h: 180, s: 30, l: 20 },
        midtones: { h: 40, s: 20, l: 50 },
        highlights: { h: 30, s: 50, l: 70 }
      },
      'muted-pastel': {
        saturation: 0.7,
        contrast: 0.85,
        brightness: 1.1
      },
      'cinematic': {
        lut: 'soft-contrast',
        blacks: 'lifted',
        highlights: 'rolled-off'
      }
    },
    palette: {
      dark: '#0F172A',      // Slate 900
      darker: '#020617',    // Slate 950
      glass: 'rgba(255, 255, 255, 0.05)',
      glassHover: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.1)'
    }
  },

  // Motion Design
  motion: {
    // Disney's 12 Principles adapted to UI
    principles: {
      anticipation: true,
      staging: true,
      timing: true,
      appeal: true
    },
    
    // Timing curves
    easing: {
      smooth: [0.4, 0, 0.2, 1],
      bounce: [0.68, -0.55, 0.265, 1.55],
      elastic: [0.175, 0.885, 0.32, 1.275],
      spring: { type: 'spring', damping: 15, stiffness: 100 }
    },

    // Durations
    duration: {
      micro: 150,    // Button presses
      fast: 200,     // Hovers, toggles
      base: 300,     // Standard transitions
      slow: 500,     // Complex animations
      deliberate: 800 // Hero sections
    },

    // Animation variants
    variants: {
      fadeInUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
      },
      scaleIn: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
      },
      slideInRight: {
        initial: { x: 100, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -100, opacity: 0 }
      },
      stagger: {
        animate: {
          transition: { staggerChildren: 0.1 }
        }
      }
    }
  },

  // Typography
  typography: {
    fonts: {
      heading: '"Space Grotesk", system-ui, sans-serif',
      body: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace'
    },
    scale: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem'     // 48px
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em'
    }
  },

  // Layout & Spacing
  layout: {
    grid: {
      columns: 12,
      gutter: '24px',
      maxWidth: '1400px'
    },
    spacing: {
      unit: 8, // Base spacing unit
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      '2xl': 48,
      '3xl': 64
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    }
  },

  // Effects & Filters
  effects: {
    glassmorphism: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
      base: '0 4px 12px rgba(0, 0, 0, 0.2)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.3)',
      xl: '0 16px 48px rgba(0, 0, 0, 0.4)',
      glow: '0 0 32px rgba(255, 123, 0, 0.3)'
    },
    blur: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px'
    }
  },

  // Accessibility
  accessibility: {
    contrastRatio: {
      min: 4.5,  // AA
      enhanced: 7 // AAA
    },
    focusRing: {
      width: '2px',
      offset: '2px',
      color: '#00B4D8'
    },
    animations: {
      respectReducedMotion: true
    }
  }
};

export default CINEMA_CONFIG;