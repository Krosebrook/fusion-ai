/**
 * Design System Tokens
 * Cinema-grade visual foundation
 */

export const TOKENS = {
  // Camera & Lens Configuration
  camera: {
    sensor: 'Full Frame 35mm',
    defaultLens: '35mm f/1.4',
    alternatives: ['85mm f/1.2', '24mm f/2.8'],
    depthOfField: 'shallow',
    focusMode: 'continuous'
  },

  // Lighting Presets
  lighting: {
    key: { angle: 45, intensity: 100, temp: '5600K' },
    fill: { angle: -45, intensity: 50, temp: '5200K' },
    rim: { angle: 180, intensity: 75, temp: '6500K' },
    ambient: { intensity: 20, temp: '5400K' }
  },

  // Color System
  colors: {
    primary: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#FF7B00',
      600: '#E66D00',
      700: '#C25800',
      800: '#9A4500',
      900: '#7C3600'
    },
    secondary: {
      50: '#E0F2FE',
      100: '#BAE6FD',
      200: '#7DD3FC',
      300: '#38BDF8',
      400: '#0EA5E9',
      500: '#00B4D8',
      600: '#0284C7',
      700: '#0369A1',
      800: '#075985',
      900: '#0C4A6E'
    },
    accent: {
      50: '#FCE7F3',
      100: '#FBCFE8',
      200: '#F9A8D4',
      300: '#F472B6',
      400: '#EC4899',
      500: '#E91E63',
      600: '#DB2777',
      700: '#BE185D',
      800: '#9D174D',
      900: '#831843'
    },
    neutral: {
      950: '#020617',
      900: '#0F172A',
      800: '#1E293B',
      700: '#334155',
      600: '#475569',
      500: '#64748B',
      400: '#94A3B8',
      300: '#CBD5E1',
      200: '#E2E8F0',
      100: '#F1F5F9',
      50: '#F8FAFC'
    }
  },

  // Typography Scale
  typography: {
    fontFamily: {
      heading: '"Space Grotesk", system-ui, sans-serif',
      body: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em'
    }
  },

  // Spacing System (8px baseline)
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem'
  },

  // Motion Design
  motion: {
    duration: {
      instant: '50ms',
      fast: '150ms',
      base: '300ms',
      slow: '500ms',
      slower: '800ms'
    },
    easing: {
      linear: 'linear',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }
  },

  // Shadows & Effects
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
    md: '0 8px 16px 0 rgba(0, 0, 0, 0.15)',
    lg: '0 16px 32px 0 rgba(0, 0, 0, 0.2)',
    xl: '0 24px 48px 0 rgba(0, 0, 0, 0.25)',
    glow: '0 0 32px rgba(255, 123, 0, 0.3)'
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    base: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    full: '9999px'
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // Z-Index Scale
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070
  }
};

export default TOKENS;