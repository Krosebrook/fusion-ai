/**
 * Camera System - Cinema-Grade Presets
 * Based on professional camera specs (Canon EOS R5, Sony A7R IV, ARRI Alexa Mini)
 */

export const cameraPresets = {
  // Portrait Photography
  portrait: {
    name: 'Portrait',
    description: 'Shallow depth of field, creamy bokeh',
    lens: '85mm f/1.2',
    focalLength: 85,
    aperture: 1.2,
    fov: 28, // Field of view in degrees
    sensor: 'Full Frame (36x24mm)',
    equivalentFull: '85mm',
    depthOfField: {
      enabled: true,
      focalLength: 85,
      fStop: 1.2,
      bokehQuality: 'high',
      bokehShape: 'circular',
    },
    characteristics: {
      compression: 'natural',
      distortion: 'minimal',
      bokeh: 'creamy',
      separation: 'excellent',
    },
    useCases: ['headshots', 'close-ups', 'product detail', 'testimonials'],
  },

  // Standard View
  standard: {
    name: 'Standard',
    description: 'Natural perspective, versatile composition',
    lens: '50mm f/1.8',
    focalLength: 50,
    aperture: 1.8,
    fov: 46,
    sensor: 'Full Frame (36x24mm)',
    equivalentFull: '50mm',
    depthOfField: {
      enabled: true,
      focalLength: 50,
      fStop: 1.8,
      bokehQuality: 'medium',
      bokehShape: 'circular',
    },
    characteristics: {
      compression: 'natural',
      distortion: 'none',
      bokeh: 'smooth',
      separation: 'good',
    },
    useCases: ['general', 'documentation', 'storytelling', 'walk-through'],
  },

  // Wide Angle
  wide: {
    name: 'Wide Angle',
    description: 'Immersive view, environmental context',
    lens: '24mm f/2.8',
    focalLength: 24,
    aperture: 2.8,
    fov: 84,
    sensor: 'Full Frame (36x24mm)',
    equivalentFull: '24mm',
    depthOfField: {
      enabled: true,
      focalLength: 24,
      fStop: 2.8,
      bokehQuality: 'low',
      bokehShape: 'circular',
    },
    characteristics: {
      compression: 'exaggerated',
      distortion: 'barrel (subtle)',
      bokeh: 'deep focus',
      separation: 'moderate',
    },
    useCases: ['architecture', 'interiors', 'landscapes', 'group shots'],
  },

  // Cinematic
  cinematic: {
    name: 'Cinematic',
    description: 'Film-like shallow DOF, dramatic focus',
    lens: '35mm f/1.4',
    focalLength: 35,
    aperture: 1.4,
    fov: 63,
    sensor: 'Full Frame (36x24mm)',
    equivalentFull: '35mm',
    depthOfField: {
      enabled: true,
      focalLength: 35,
      fStop: 1.4,
      bokehQuality: 'very high',
      bokehShape: 'circular',
    },
    characteristics: {
      compression: 'slightly compressed',
      distortion: 'minimal',
      bokeh: 'dreamy',
      separation: 'excellent',
    },
    useCases: ['hero sections', 'feature highlights', 'emotional content', 'demos'],
  },

  // Macro Detail
  macro: {
    name: 'Macro',
    description: 'Extreme close-up, fine detail capture',
    lens: '100mm f/2.8 Macro',
    focalLength: 100,
    aperture: 2.8,
    fov: 24,
    sensor: 'Full Frame (36x24mm)',
    equivalentFull: '100mm',
    depthOfField: {
      enabled: true,
      focalLength: 100,
      fStop: 2.8,
      bokehQuality: 'high',
      bokehShape: 'circular',
    },
    characteristics: {
      compression: 'compressed',
      distortion: 'none',
      bokeh: 'smooth',
      separation: 'excellent',
      magnification: '1:1',
    },
    useCases: ['product details', 'textures', 'features', 'micro-interactions'],
  },

  // Telephoto
  telephoto: {
    name: 'Telephoto',
    description: 'Compressed perspective, isolated subjects',
    lens: '135mm f/2',
    focalLength: 135,
    aperture: 2.0,
    fov: 18,
    sensor: 'Full Frame (36x24mm)',
    equivalentFull: '135mm',
    depthOfField: {
      enabled: true,
      focalLength: 135,
      fStop: 2.0,
      bokehQuality: 'very high',
      bokehShape: 'circular',
    },
    characteristics: {
      compression: 'very compressed',
      distortion: 'none',
      bokeh: 'extremely creamy',
      separation: 'outstanding',
    },
    useCases: ['isolating subjects', 'testimonials', 'executive portraits', 'product showcase'],
  },

  // Anamorphic
  anamorphic: {
    name: 'Anamorphic',
    description: 'Widescreen cinematic with characteristic flares',
    lens: 'Anamorphic 50mm T2.9',
    focalLength: 50,
    aperture: 2.9,
    fov: 54, // Horizontal squeeze factor applied
    sensor: 'Full Frame (36x24mm)',
    equivalentFull: '50mm (2.39:1)',
    aspectRatio: 2.39,
    depthOfField: {
      enabled: true,
      focalLength: 50,
      fStop: 2.9,
      bokehQuality: 'high',
      bokehShape: 'oval',
      horizontalStretch: true,
    },
    characteristics: {
      compression: 'natural',
      distortion: 'characteristic',
      bokeh: 'oval',
      separation: 'excellent',
      flares: 'horizontal streaks',
    },
    useCases: ['cinematic hero', 'film-style', 'dramatic reveals', 'brand videos'],
  },
};

export const cameraMovements = {
  // Static compositions
  locked: {
    name: 'Locked Off',
    description: 'Static, stable composition',
    stability: 'perfect',
    useCases: ['talking head', 'product showcase', 'UI demos'],
  },

  // Dynamic movements
  dollyIn: {
    name: 'Dolly In',
    description: 'Smooth push toward subject',
    speed: 'slow',
    easing: 'easeInOut',
    useCases: ['reveals', 'emphasis', 'transitions'],
  },

  dollyOut: {
    name: 'Dolly Out',
    description: 'Pull back to reveal context',
    speed: 'slow',
    easing: 'easeInOut',
    useCases: ['establishing shots', 'context reveal', 'endings'],
  },

  pan: {
    name: 'Pan',
    description: 'Horizontal camera rotation',
    speed: 'medium',
    easing: 'smooth',
    useCases: ['panoramic views', 'following action', 'reveals'],
  },

  tilt: {
    name: 'Tilt',
    description: 'Vertical camera rotation',
    speed: 'medium',
    easing: 'smooth',
    useCases: ['architecture', 'vertical reveals', 'height emphasis'],
  },

  crane: {
    name: 'Crane',
    description: 'Vertical elevation change',
    speed: 'slow',
    easing: 'smooth',
    useCases: ['dramatic reveals', 'transitions', 'scale emphasis'],
  },

  tracking: {
    name: 'Tracking',
    description: 'Parallel movement with subject',
    speed: 'matched',
    easing: 'smooth',
    useCases: ['following action', 'product tours', 'walkthroughs'],
  },

  handheld: {
    name: 'Handheld',
    description: 'Subtle organic movement',
    stability: 'slightly unstable',
    frequency: 'low',
    amplitude: 'minimal',
    useCases: ['documentary feel', 'intimacy', 'realism'],
  },
};

export default { cameraPresets, cameraMovements };