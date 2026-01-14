/**
 * FlashFusion Design System Tokens
 * 15-Year Studio-Grade Visual Standards
 * 
 * Includes: Colors, Typography, Spacing, Motion, Shadows, Glows
 * Last Updated: Jan 14, 2026
 */

export const FLASHFUSION_TOKENS = {
  // ===== SEMANTIC COLORS =====
  colors: {
    // Primary Gradient (Logo & Accents)
    primary: {
      from: '#8B5CF6',      // Purple
      to: '#06B6D4',        // Cyan
      accent: '#FF7B00',    // Orange
    },

    // Secondary Gradient
    secondary: {
      from: '#EC4899',      // Pink/Magenta
      to: '#8B5CF6',        // Purple
      accent: '#F59E0B',    // Amber
    },

    // Semantic Button Colors
    buttons: {
      purple: 'hsl(246, 81%, 47%)',     // #8B5CF6
      warning: 'hsl(36, 80%, 62%)',     // #F59E0B
      error: 'hsl(0, 90%, 56%)',        // #EF4444
      info: 'hsl(217, 91%, 60%)',       // #3B82F6
    },

    // Forms & Neutral
    neutral: {
      background: 'hsl(250, 40%, 8%)',   // #0F1729
      surface: 'hsl(250, 45%, 8%)',      // #0E152A
      border: '#302238',                  // Border color
    },

    // Status Colors
    status: {
      success: '#10B981',     // Emerald
      warning: '#F59E0B',     // Amber
      error: '#EF4444',       // Red
      info: '#3B82F6',        // Blue
    },

    // Glow Effects (for neon accents)
    glow: {
      purple: '0 0 12px hsl(276, 85%, 65%, 0.6)',
      pink: '0 0 12px hsl(346, 72%, 70%, 0.6)',
      cyan: '0 0 12px hsl(185, 100%, 50%, 0.6)',
    },
  },

  // ===== TYPOGRAPHY =====
  typography: {
    fonts: {
      heading: '"Space Grotesk", system-ui, -apple-system, sans-serif',
      body: '"Inter", system-ui, -apple-system, sans-serif',
      mono: '"Fira Code", monospace',
    },

    sizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },

    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    lineHeight: {
      tight: 1.1,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },

    letterSpacing: {
      tight: '-0.02em',
      normal: '0em',
      wide: '0.02em',
      wider: '0.05em',
    },
  },

  // ===== SPACING =====
  spacing: {
    // 8px baseline grid
    xs: '4px',      // 0.5x
    sm: '8px',      // 1x
    md: '16px',     // 2x
    lg: '24px',     // 3x
    xl: '32px',     // 4x
    '2xl': '48px',  // 6x
    '3xl': '64px',  // 8x
    '4xl': '96px',  // 12x
  },

  // ===== BORDERS & RADIUS =====
  borders: {
    radius: {
      none: '0',
      xs: '2px',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      '2xl': '20px',
      full: '999px',
    },

    width: {
      thin: '0.5px',
      base: '1px',
      thick: '2px',
    },
  },

  // ===== SHADOWS =====
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

    // Neon Glow Shadows
    neon: {
      purple: '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)',
      pink: '0 0 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)',
      cyan: '0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)',
    },

    // Depth Shadows (glassmorphism)
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },

  // ===== MOTION & ANIMATION =====
  motion: {
    easing: {
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      elastic: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },

    duration: {
      fastest: '150ms',
      faster: '200ms',
      fast: '300ms',
      base: '500ms',
      slow: '800ms',
      slower: '1200ms',
    },

    transitions: {
      fade: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      slide: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      scale: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      glow: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // ===== COMPONENT DEFAULTS =====
  components: {
    button: {
      padding: {
        sm: '8px 16px',
        base: '10px 20px',
        lg: '12px 24px',
      },
      height: {
        sm: '32px',
        base: '40px',
        lg: '48px',
      },
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 600,
    },

    card: {
      padding: '16px',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },

    input: {
      padding: '10px 12px',
      borderRadius: '8px',
      borderWidth: '1px',
      fontSize: '14px',
      height: '40px',
    },

    badge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 600,
    },
  },

  // ===== RESPONSIVE BREAKPOINTS =====
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // ===== Z-INDEX STACK =====
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

/**
 * Quick Access Color Palette
 * For direct imports in components
 */
export const COLORS = {
  // Gradients
  PRIMARY_GRADIENT: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
  SECONDARY_GRADIENT: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
  ACCENT_GRADIENT: 'linear-gradient(135deg, #FF7B00, #E91E63)',

  // Brand Colors
  PURPLE: '#8B5CF6',
  CYAN: '#06B6D4',
  PINK: '#EC4899',
  ORANGE: '#FF7B00',

  // Dark Mode
  BG_DARK: '#0F1729',
  SURFACE_DARK: '#0E152A',
  BORDER_DARK: '#302238',

  // Neon Accents
  NEON_PURPLE: '#C084FC',
  NEON_CYAN: '#22D3EE',
  NEON_PINK: '#F472B6',

  // Status
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
};

/**
 * Utility Animations
 * For framer-motion and CSS animations
 */
export const ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  slideInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },

  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },

  glowPulse: {
    animate: {
      boxShadow: [
        '0 0 20px rgba(139, 92, 246, 0.4)',
        '0 0 40px rgba(139, 92, 246, 0.6)',
        '0 0 20px rgba(139, 92, 246, 0.4)',
      ],
    },
    transition: { duration: 3, repeat: Infinity },
  },

  spinSlow: {
    animate: { rotate: 360 },
    transition: { duration: 8, repeat: Infinity, ease: 'linear' },
  },
};

export default FLASHFUSION_TOKENS;