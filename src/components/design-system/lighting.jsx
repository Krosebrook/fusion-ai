/**
 * Lighting System - Studio-Grade Presets
 * Professional 3-point lighting and cinematic setups
 */

export const lightingPresets = {
  // Three-Point Lighting (Classic)
  threePoint: {
    name: 'Three-Point Studio',
    description: 'Professional balanced lighting with depth',
    setup: {
      key: {
        name: 'Key Light',
        position: { x: 45, y: 45, z: 5 }, // degrees from subject
        intensity: 1.0,
        color: '#FFFFFF',
        temperature: 5600, // Kelvin (daylight)
        softness: 0.6,
        size: 'large', // Softbox equivalent
        distance: 'medium',
        purpose: 'Main illumination',
      },
      fill: {
        name: 'Fill Light',
        position: { x: -45, y: 30, z: 5 },
        intensity: 0.4,
        color: '#FFFFFF',
        temperature: 5600,
        softness: 0.8,
        size: 'large',
        distance: 'medium',
        purpose: 'Shadow softening',
      },
      rim: {
        name: 'Rim/Back Light',
        position: { x: 180, y: 60, z: 5 },
        intensity: 0.8,
        color: '#FFFFFF',
        temperature: 5600,
        softness: 0.3,
        size: 'medium',
        distance: 'far',
        purpose: 'Subject separation',
      },
    },
    ratio: '3:1', // Key to fill ratio
    mood: 'professional',
    useCases: ['interviews', 'product showcase', 'corporate', 'tutorials'],
  },

  // Natural Golden Hour
  goldenHour: {
    name: 'Golden Hour',
    description: 'Warm, natural sunset/sunrise lighting',
    setup: {
      sun: {
        name: 'Sun',
        position: { x: 60, y: 15, z: 10 }, // Low angle
        intensity: 0.9,
        color: '#FFB85C',
        temperature: 3200, // Warm
        softness: 0.5,
        size: 'large',
        distance: 'infinite',
        purpose: 'Primary source',
      },
      ambient: {
        name: 'Sky Fill',
        position: { x: 0, y: 90, z: 0 }, // Overhead dome
        intensity: 0.3,
        color: '#87CEEB',
        temperature: 6500, // Cool blue
        softness: 1.0,
        size: 'dome',
        distance: 'infinite',
        purpose: 'Ambient fill',
      },
      bounce: {
        name: 'Ground Bounce',
        position: { x: 0, y: -90, z: 0 },
        intensity: 0.2,
        color: '#D4AF37',
        temperature: 3200,
        softness: 0.9,
        size: 'large',
        distance: 'close',
        purpose: 'Underlight fill',
      },
    },
    ratio: '2:1',
    mood: 'warm, emotional',
    timeOfDay: '1 hour after sunrise or before sunset',
    useCases: ['hero sections', 'lifestyle', 'testimonials', 'emotional content'],
  },

  // High-Key Bright
  highKey: {
    name: 'High-Key',
    description: 'Bright, minimal shadows, optimistic',
    setup: {
      overhead: {
        name: 'Overhead Bank',
        position: { x: 0, y: 90, z: 2 },
        intensity: 1.2,
        color: '#FFFFFF',
        temperature: 6000,
        softness: 0.9,
        size: 'very large',
        distance: 'medium',
        purpose: 'Even illumination',
      },
      frontFill: {
        name: 'Front Fill',
        position: { x: 0, y: 30, z: 3 },
        intensity: 0.8,
        color: '#FFFFFF',
        temperature: 6000,
        softness: 0.8,
        size: 'large',
        distance: 'close',
        purpose: 'Fill shadows',
      },
      rim: {
        name: 'Edge Accent',
        position: { x: 180, y: 45, z: 4 },
        intensity: 0.5,
        color: '#FFFFFF',
        temperature: 6000,
        softness: 0.4,
        size: 'medium',
        distance: 'far',
        purpose: 'Separation',
      },
    },
    ratio: '1.5:1',
    mood: 'bright, optimistic, clean',
    useCases: ['product', 'e-commerce', 'healthcare', 'education'],
  },

  // Low-Key Dramatic
  lowKey: {
    name: 'Low-Key Dramatic',
    description: 'Dark, moody, high contrast',
    setup: {
      key: {
        name: 'Hard Key',
        position: { x: 90, y: 45, z: 5 },
        intensity: 1.5,
        color: '#FFFFFF',
        temperature: 4800,
        softness: 0.1,
        size: 'small', // Hard light
        distance: 'medium',
        purpose: 'Dramatic shadows',
      },
      rim: {
        name: 'Rim Accent',
        position: { x: 180, y: 60, z: 5 },
        intensity: 1.2,
        color: '#4A90E2',
        temperature: 7000, // Cool
        softness: 0.2,
        size: 'medium',
        distance: 'far',
        purpose: 'Subject separation',
      },
      fill: {
        name: 'Minimal Fill',
        position: { x: -45, y: 15, z: 3 },
        intensity: 0.1,
        color: '#1E293B',
        temperature: 3200,
        softness: 0.9,
        size: 'small',
        distance: 'close',
        purpose: 'Shadow detail',
      },
    },
    ratio: '8:1', // High contrast
    mood: 'dramatic, moody, mysterious',
    useCases: ['tech reveals', 'gaming', 'thriller', 'premium products'],
  },

  // Neon Cyberpunk
  neonCyberpunk: {
    name: 'Neon Cyberpunk',
    description: 'Futuristic RGB edge lighting',
    setup: {
      magenta: {
        name: 'Magenta Edge',
        position: { x: 120, y: 30, z: 5 },
        intensity: 1.0,
        color: '#E91E63',
        temperature: 6500,
        softness: 0.3,
        size: 'medium',
        distance: 'medium',
        purpose: 'Color accent',
      },
      cyan: {
        name: 'Cyan Edge',
        position: { x: -120, y: 30, z: 5 },
        intensity: 1.0,
        color: '#00B4D8',
        temperature: 7500,
        softness: 0.3,
        size: 'medium',
        distance: 'medium',
        purpose: 'Color accent',
      },
      key: {
        name: 'Neutral Key',
        position: { x: 0, y: 45, z: 5 },
        intensity: 0.6,
        color: '#FFFFFF',
        temperature: 5600,
        softness: 0.5,
        size: 'medium',
        distance: 'medium',
        purpose: 'Base light',
      },
      ambient: {
        name: 'Purple Ambient',
        position: { x: 0, y: 90, z: 0 },
        intensity: 0.2,
        color: '#8B5CF6',
        temperature: 6000,
        softness: 1.0,
        size: 'dome',
        distance: 'infinite',
        purpose: 'Atmosphere',
      },
    },
    ratio: '1:1', // Balanced edge lights
    mood: 'futuristic, energetic, tech',
    useCases: ['tech products', 'gaming', 'AI features', 'innovation'],
  },

  // Softbox Portrait
  softboxPortrait: {
    name: 'Softbox Portrait',
    description: 'Flattering soft light for faces',
    setup: {
      mainSoftbox: {
        name: 'Large Softbox',
        position: { x: 30, y: 45, z: 4 },
        intensity: 1.0,
        color: '#FFFFFF',
        temperature: 5600,
        softness: 0.9,
        size: 'very large', // 48" softbox
        distance: 'close',
        purpose: 'Wrap-around light',
      },
      reflector: {
        name: 'Reflector Fill',
        position: { x: -30, y: 30, z: 3 },
        intensity: 0.3,
        color: '#F5F5DC', // Warm bounce
        temperature: 5000,
        softness: 1.0,
        size: 'large',
        distance: 'close',
        purpose: 'Gentle fill',
      },
      hair: {
        name: 'Hair Light',
        position: { x: 180, y: 70, z: 6 },
        intensity: 0.7,
        color: '#FFFFFF',
        temperature: 5600,
        softness: 0.4,
        size: 'small',
        distance: 'far',
        purpose: 'Hair separation',
      },
    },
    ratio: '2:1',
    mood: 'flattering, professional',
    useCases: ['headshots', 'testimonials', 'team photos', 'about pages'],
  },

  // Rembrandt Lighting
  rembrandt: {
    name: 'Rembrandt',
    description: 'Classic portrait with triangle of light',
    setup: {
      key: {
        name: 'Key Light',
        position: { x: 45, y: 50, z: 5 },
        intensity: 1.0,
        color: '#FFFFFF',
        temperature: 5600,
        softness: 0.6,
        size: 'medium',
        distance: 'medium',
        purpose: 'Rembrandt triangle',
      },
      fill: {
        name: 'Fill Light',
        position: { x: -15, y: 30, z: 3 },
        intensity: 0.2,
        color: '#FFFFFF',
        temperature: 5600,
        softness: 0.8,
        size: 'large',
        distance: 'far',
        purpose: 'Shadow detail',
      },
      rim: {
        name: 'Rim Light',
        position: { x: 180, y: 60, z: 5 },
        intensity: 0.8,
        color: '#FFFFFF',
        temperature: 5600,
        softness: 0.3,
        size: 'small',
        distance: 'medium',
        purpose: 'Separation',
      },
    },
    ratio: '5:1',
    mood: 'classic, artistic, dimensional',
    signature: 'Triangle of light on shadow side of face',
    useCases: ['artistic portraits', 'executive photos', 'fine art', 'character'],
  },
};

export const lightModifiers = {
  softbox: {
    name: 'Softbox',
    effect: 'Soft, even spread',
    sizes: ['small (24")', 'medium (36")', 'large (48")', 'extra large (60"+)'],
    softness: 0.8,
  },
  umbrella: {
    name: 'Umbrella',
    effect: 'Broad, soft spread',
    types: ['white (soft)', 'silver (bright)', 'gold (warm)'],
    softness: 0.7,
  },
  beauty: {
    name: 'Beauty Dish',
    effect: 'Flattering with punch',
    sizes: ['22"', '28"'],
    softness: 0.5,
  },
  grid: {
    name: 'Grid',
    effect: 'Controlled directional beam',
    angles: ['10°', '20°', '30°', '40°'],
    softness: 0.2,
  },
  barn: {
    name: 'Barn Doors',
    effect: 'Shapeable light control',
    softness: 0.3,
  },
};

export default { lightingPresets, lightModifiers };