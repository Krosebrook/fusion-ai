import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCameraControl } from '@/components/hooks/useCameraControl';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Camera, Video, Focus, ZoomIn, ZoomOut, Move, RotateCw,
  Maximize2, Minimize2, Settings
} from 'lucide-react';
import { GlassmorphicCard } from '@/components/ui-library/GlassmorphicCard';

export function CameraController({ onClose }) {
  const { cameraState, setPreset, pan, zoom, rotate } = useCameraControl();
  const [isExpanded, setIsExpanded] = useState(false);

  const presets = [
    { id: 'default', label: 'Default', icon: Camera, fov: 75 },
    { id: 'portrait', label: 'Portrait', icon: Focus, fov: 50 },
    { id: 'wide', label: 'Wide', icon: Maximize2, fov: 90 },
    { id: 'cinematic', label: 'Cinematic', icon: Video, fov: 35 },
    { id: 'dramatic', label: 'Dramatic', icon: RotateCw, fov: 65 },
  ];

  return (
    <GlassmorphicCard 
      className="fixed bottom-8 right-8 z-50 w-80"
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-white">Camera Controls</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8"
            >
              ×
            </Button>
          )}
        </div>
      </div>

      {/* Quick Presets */}
      <div className="p-4 space-y-3">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
          Camera Presets
        </div>
        <div className="grid grid-cols-2 gap-2">
          {presets.map(preset => {
            const Icon = preset.icon;
            const isActive = cameraState.preset === preset.id;
            
            return (
              <motion.button
                key={preset.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPreset(preset.id)}
                className={`
                  p-3 rounded-lg border transition-all
                  ${isActive 
                    ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }
                `}
              >
                <Icon className="w-4 h-4 mx-auto mb-1" />
                <div className="text-xs font-medium">{preset.label}</div>
                <div className="text-[10px] opacity-60">{preset.fov}° FOV</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Advanced Controls */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            {/* Position Controls */}
            <div className="p-4 space-y-4">
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                Position & Movement
              </div>

              {/* Pan Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Pan</span>
                  <Move className="w-3 h-3 text-gray-500" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => pan(-0.1, 0)}
                    className="bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    ←
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => pan(0, -0.1)}
                    className="bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    ↑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => pan(0.1, 0)}
                    className="bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    →
                  </Button>
                  <div />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => pan(0, 0.1)}
                    className="bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    ↓
                  </Button>
                </div>
              </div>

              {/* Zoom Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Zoom</span>
                  <div className="flex items-center gap-1">
                    <ZoomOut className="w-3 h-3 text-gray-500" />
                    <ZoomIn className="w-3 h-3 text-gray-500" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => zoom(-0.2)}
                    className="bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </Button>
                  <Slider
                    value={[cameraState.position.z]}
                    onValueChange={([val]) => zoom(val - cameraState.position.z, 200)}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => zoom(0.2)}
                    className="bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-xs text-center text-gray-500">
                  {cameraState.position.z.toFixed(1)}x
                </div>
              </div>

              {/* Rotation Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Rotation</span>
                  <RotateCw className="w-3 h-3 text-gray-500" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rotate(5, 0, 0)}
                    className="bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    Tilt ↑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rotate(-5, 0, 0)}
                    className="bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    Tilt ↓
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rotate(0, -5, 0)}
                    className="bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    Pan ←
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rotate(0, 5, 0)}
                    className="bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    Pan →
                  </Button>
                </div>
              </div>

              {/* Current State Display */}
              <div className="pt-3 border-t border-white/10">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  Current State
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500">Position</div>
                    <div className="text-gray-300 font-mono">
                      {cameraState.position.x.toFixed(2)}, {cameraState.position.y.toFixed(2)}, {cameraState.position.z.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">FOV</div>
                    <div className="text-gray-300 font-mono">
                      {cameraState.fov}°
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassmorphicCard>
  );
}