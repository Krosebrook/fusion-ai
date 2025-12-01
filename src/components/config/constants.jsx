/**
 * FlashFusion Centralized Constants
 * Design tokens, colors, and shared configuration
 */

// Color Palette (Design System)
export const COLORS = {
  primary: '#FF7B00',
  secondary: '#00B4D8',
  accent: '#E91E63',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#8B5CF6',
  
  // Backgrounds
  bgDark: '#0F172A',
  bgCard: 'rgba(30, 41, 59, 0.5)',
  bgGlass: 'rgba(255, 255, 255, 0.05)',
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  
  // Borders
  borderLight: 'rgba(255, 255, 255, 0.1)',
  borderMedium: 'rgba(255, 255, 255, 0.2)',
};

// Gradients
export const GRADIENTS = {
  primary: 'from-orange-500 to-orange-600',
  secondary: 'from-cyan-500 to-blue-500',
  accent: 'from-pink-500 to-purple-500',
  success: 'from-green-500 to-emerald-500',
  hero: 'from-yellow-400 via-cyan-400 to-purple-400',
  card: 'from-white/5 to-white/10',
};

// Spacing Scale (8px baseline)
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

// Typography
export const TYPOGRAPHY = {
  fontHeading: "'Space Grotesk', sans-serif",
  fontBody: "'Inter', -apple-system, sans-serif",
  lineHeight: 1.5,
  
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
};

// Animation Easings
export const EASINGS = {
  smooth: [0.4, 0, 0.2, 1],
  spring: [0.34, 1.56, 0.64, 1],
  cinematic: [0.83, 0, 0.17, 1],
  anticipation: [0.68, -0.55, 0.27, 1.55],
};

// Breakpoints
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// API Limits
export const LIMITS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxProjectName: 100,
  maxDescription: 500,
  defaultPageSize: 20,
  maxPageSize: 100,
};

// Status Colors
export const STATUS_COLORS = {
  active: COLORS.success,
  inactive: COLORS.textMuted,
  pending: COLORS.warning,
  error: COLORS.error,
  completed: COLORS.success,
  running: COLORS.secondary,
  draft: COLORS.textMuted,
};

// Category Icons/Colors for various features
export const CATEGORY_STYLES = {
  development: { color: '#FF7B00', gradient: 'from-orange-500 to-red-500' },
  content: { color: '#00B4D8', gradient: 'from-blue-500 to-cyan-500' },
  analytics: { color: '#10B981', gradient: 'from-green-500 to-emerald-500' },
  security: { color: '#8B5CF6', gradient: 'from-purple-500 to-indigo-500' },
  commerce: { color: '#E91E63', gradient: 'from-pink-500 to-rose-500' },
  automation: { color: '#F59E0B', gradient: 'from-yellow-500 to-orange-500' },
};