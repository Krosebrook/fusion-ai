import React from 'react';
import { Camera, Circle } from 'lucide-react';

export const CAMERA_PRESETS = {
  portrait: {
    name: 'Portrait',
    lens: '85mm f/1.2',
    fov: 28,
    aperture: 1.2,
    description: 'Creamy bokeh, subject isolation',
    icon: Camera,
    settings: {
      depthOfField: 'shallow',
      focusDistance: 2.5,
      blurStrength: 0.8,
    }
  },
  cinematic: {
    name: 'Cinematic',
    lens: '35mm f/1.4',
    fov: 63,
    aperture: 1.4,
    description: 'Natural perspective, film look',
    icon: Camera,
    settings: {
      depthOfField: 'medium',
      focusDistance: 5,
      blurStrength: 0.5,
      filmGrain: 0.15,
    }
  },
  wide: {
    name: 'Wide Angle',
    lens: '24mm f/2.8',
    fov: 84,
    aperture: 2.8,
    description: 'Immersive landscapes',
    icon: Camera,
    settings: {
      depthOfField: 'deep',
      focusDistance: 10,
      blurStrength: 0.2,
    }
  },
  macro: {
    name: 'Macro',
    lens: '100mm f/2.8',
    fov: 24,
    aperture: 2.8,
    description: 'Close-up details',
    icon: Circle,
    settings: {
      depthOfField: 'ultra-shallow',
      focusDistance: 0.3,
      blurStrength: 0.95,
    }
  },
};

export const LIGHTING_PRESETS = {
  studio: {
    name: 'Studio 3-Point',
    description: 'Professional clarity',
    setup: {
      key: { intensity: 1.2, color: '#FFFFFF', angle: 45 },
      fill: { intensity: 0.6, color: '#E8F4F8', angle: -30 },
      rim: { intensity: 0.8, color: '#FFE5CC', angle: 135 },
    }
  },
  golden: {
    name: 'Golden Hour',
    description: 'Warm, natural light',
    setup: {
      sun: { intensity: 1.5, color: '#FFB366', angle: 15 },
      ambient: { intensity: 0.4, color: '#FFF5E6' },
    }
  },
  dramatic: {
    name: 'Dramatic Edge',
    description: 'High contrast, moody',
    setup: {
      main: { intensity: 1.8, color: '#FFFFFF', angle: 60 },
      edge: { intensity: 1.2, color: '#00B4D8', angle: 120 },
      ambient: { intensity: 0.2, color: '#1A1A2E' },
    }
  },
  neon: {
    name: 'Cyberpunk Neon',
    description: 'Futuristic RGB accents',
    setup: {
      left: { intensity: 1.0, color: '#FF00FF', angle: -45 },
      right: { intensity: 1.0, color: '#00FFFF', angle: 45 },
      ambient: { intensity: 0.3, color: '#0A0A1E' },
    }
  },
};

export function CameraPresetSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(CAMERA_PRESETS).map(([key, preset]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`
            p-4 rounded-xl border transition-all text-left
            ${selected === key 
              ? 'border-orange-500 bg-orange-500/10' 
              : 'border-white/10 bg-white/5 hover:border-white/20'
            }
          `}
        >
          <div className="flex items-center gap-2 mb-2">
            <preset.icon className="w-4 h-4 text-orange-400" />
            <span className="font-medium text-white text-sm">{preset.name}</span>
          </div>
          <p className="text-xs text-gray-400">{preset.lens}</p>
          <p className="text-xs text-gray-500 mt-1">{preset.description}</p>
        </button>
      ))}
    </div>
  );
}