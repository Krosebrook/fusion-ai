/**
 * Visual Engine Settings
 * Cinema-grade presets for camera, lighting, and motion
 */

export const visualPresets = {
  // Camera presets based on professional cinema lenses
  camera: {
    portrait: {
      lens: '85mm f/1.2',
      fov: 28,
      aperture: 1.2,
      depthOfField: 'shallow',
      description: 'Creamy bokeh, ideal for hero shots and portraits',
    },
    natural: {
      lens: '35mm f/1.4',
      fov: 63,
      aperture: 1.4,
      depthOfField: 'medium',
      description: 'Natural perspective, versatile for most scenes',
    },
    wide: {
      lens: '24mm f/2.8',
      fov: 84,
      aperture: 2.8,
      depthOfField: 'deep',
      description: 'Immersive wide shots, environmental storytelling',
    },
  },

  // Lighting setups for different moods
  lighting: {
    studio: {
      type: '3-point',
      key: { intensity: 0.8, color: '#ffffff', angle: 45 },
      fill: { intensity: 0.4, color: '#e8f4ff', angle: -45 },
      rim: { intensity: 0.6, color: '#ff9d5c', angle: 135 },
      description: 'Professional studio lighting with clarity',
    },
    natural: {
      type: 'golden-hour',
      key: { intensity: 1.0, color: '#ffd89b', angle: 30 },
      fill: { intensity: 0.3, color: '#19547b', angle: -15 },
      ambient: { intensity: 0.2, color: '#87ceeb' },
      description: 'Warm natural light, soft shadows',
    },
    dramatic: {
      type: 'high-contrast',
      key: { intensity: 1.2, color: '#ffffff', angle: 60 },
      rim: { intensity: 0.9, color: '#00d4ff', angle: 120 },
      ambient: { intensity: 0.1, color: '#0a0a1a' },
      description: 'Cinematic edge lighting, moody atmosphere',
    },
    futuristic: {
      type: 'rgb-accent',
      key: { intensity: 0.7, color: '#ffffff', angle: 0 },
      accent1: { intensity: 0.8, color: '#ff00ff', angle: 90 },
      accent2: { intensity: 0.8, color: '#00ffff', angle: -90 },
      description: 'Cyberpunk RGB edge lighting',
    },
  },

  // Motion presets following Disney's 12 Principles
  motion: {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
      description: 'Gentle fade in/out',
    },
    slide: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
      description: 'Smooth slide with fade',
    },
    parallax: {
      scale: [1, 1.05],
      transition: { duration: 20, repeat: Infinity, ease: 'linear' },
      description: 'Subtle parallax pan for backgrounds',
    },
    bounce: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
      },
      description: 'Spring recoil with anticipation',
    },
    stagger: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      description: 'Cascading load-in for lists',
    },
  },

  // Color grading and LUTs
  colorGrading: {
    tealOrange: {
      shadows: '#0a2540',
      midtones: '#1a3a52',
      highlights: '#ff9d5c',
      description: 'Cinematic blockbuster look',
    },
    mutedPastel: {
      shadows: '#2d3748',
      midtones: '#9ca3af',
      highlights: '#fde8e8',
      description: 'Soft, approachable aesthetic',
    },
    cyberpunk: {
      shadows: '#0f0820',
      midtones: '#8b5cf6',
      highlights: '#ff00ff',
      accent: '#00ffff',
      description: 'Neon futuristic palette',
    },
  },

  // Glass morphism tokens
  glass: {
    light: {
      fill: 'rgba(255,255,255,0.10)',
      fillGradient: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.07))',
      border: 'rgba(255,255,255,0.18)',
      shadow: '0 18px 55px rgba(0,0,0,0.45)',
      blur: '18px',
      saturation: '1.3',
    },
    medium: {
      fill: 'rgba(255,255,255,0.14)',
      fillGradient: 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.10))',
      border: 'rgba(255,255,255,0.25)',
      shadow: '0 22px 65px rgba(0,0,0,0.50)',
      blur: '24px',
      saturation: '1.4',
    },
    dark: {
      fill: 'rgba(0,0,0,0.30)',
      fillGradient: 'linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.35))',
      border: 'rgba(255,255,255,0.15)',
      shadow: '0 18px 55px rgba(0,0,0,0.60)',
      blur: '20px',
      saturation: '1.2',
    },
  },
};

export default visualPresets;