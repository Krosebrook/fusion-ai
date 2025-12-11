import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Sparkles, Camera, Sun, Loader2, Save, Download } from 'lucide-react';
import { toast } from 'sonner';

export function AIPresetGenerator({ type = 'camera', onPresetGenerated }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreset, setGeneratedPreset] = useState(null);

  const examples = type === 'camera' ? [
    'Moody film noir lighting with harsh shadows',
    'Dreamy golden hour portrait with soft focus',
    'Cyberpunk neon cityscape with RGB edge lighting',
    'High-contrast dramatic black and white',
    'Soft pastel studio lighting for product photography'
  ] : [
    'Slow-motion dramatic entrance with hero pose',
    'Fast-paced action sequence with quick cuts',
    'Smooth tracking shot following subject',
    'Epic reveal with camera pull-back',
    'Intimate close-up with shallow depth of field'
  ];

  const generatePreset = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setIsGenerating(true);
    try {
      const schema = type === 'camera' ? {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          camera: {
            type: 'object',
            properties: {
              lens: { type: 'string' },
              fov: { type: 'number' },
              aperture: { type: 'number' },
              iso: { type: 'number' },
              shutterSpeed: { type: 'string' }
            }
          },
          lighting: {
            type: 'object',
            properties: {
              setup: { type: 'string' },
              keyLight: { 
                type: 'object',
                properties: {
                  intensity: { type: 'number' },
                  color: { type: 'string' },
                  angle: { type: 'number' },
                  position: { type: 'string' }
                }
              },
              fillLight: {
                type: 'object',
                properties: {
                  intensity: { type: 'number' },
                  color: { type: 'string' },
                  angle: { type: 'number' }
                }
              },
              rimLight: {
                type: 'object',
                properties: {
                  intensity: { type: 'number' },
                  color: { type: 'string' },
                  angle: { type: 'number' }
                }
              },
              ambient: {
                type: 'object',
                properties: {
                  intensity: { type: 'number' },
                  color: { type: 'string' }
                }
              }
            }
          },
          postProcessing: {
            type: 'object',
            properties: {
              lut: { type: 'string' },
              filmGrain: { type: 'number' },
              vignette: { type: 'number' },
              colorGrading: { type: 'string' }
            }
          }
        }
      } : {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          duration: { type: 'number' },
          camera: {
            type: 'object',
            properties: {
              movement: { type: 'string' },
              speed: { type: 'string' },
              easing: { type: 'array', items: { type: 'number' } }
            }
          },
          transitions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                duration: { type: 'number' },
                easing: { type: 'string' }
              }
            }
          },
          effects: {
            type: 'object',
            properties: {
              motionBlur: { type: 'number' },
              speedRamp: { type: 'boolean' },
              frameRate: { type: 'number' }
            }
          }
        }
      };

      const systemPrompt = type === 'camera' 
        ? `You are a professional cinematographer and lighting director. Generate a detailed camera and lighting preset based on the user's description. Include specific technical values for:
        - Camera: lens (e.g., "35mm f/1.4"), field of view (degrees), aperture (f-stop), ISO, shutter speed
        - Lighting: complete 3-point setup with key, fill, rim, and ambient lights. Include intensity (0-2), hex colors, and angles in degrees
        - Post-processing: LUT name, film grain (0-1), vignette (0-1), color grading description
        
        Make it cinema-grade and production-ready.`
        : `You are a professional motion designer and video editor. Generate a detailed motion preset for video generation based on the user's description. Include:
        - Camera movement type (pan, tilt, dolly, zoom, tracking, etc.)
        - Speed (slow-motion, normal, fast-motion)
        - Easing curves as cubic-bezier arrays [x1, y1, x2, y2]
        - Transition types (cross-dissolve, wipe, fade, etc.) with durations
        - Effects like motion blur strength (0-1), speed ramping, and frame rate
        
        Make it cinematic and professional.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\nUser request: "${prompt}"`,
        response_json_schema: schema
      });

      setGeneratedPreset(result);
      onPresetGenerated?.(result);
      toast.success('Preset generated successfully!');
    } catch (error) {
      toast.error('Failed to generate preset: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const savePreset = () => {
    if (!generatedPreset) return;
    const blob = new Blob([JSON.stringify(generatedPreset, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedPreset.name.replace(/\s+/g, '-').toLowerCase()}-preset.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Preset saved to downloads');
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">
            AI {type === 'camera' ? 'Camera & Lighting' : 'Motion'} Preset Generator
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Describe your desired {type === 'camera' ? 'camera setup and lighting mood' : 'motion style'}
            </label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={examples[0]}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              onKeyPress={(e) => e.key === 'Enter' && generatePreset()}
            />
          </div>

          {/* Example Prompts */}
          <div className="flex flex-wrap gap-2">
            {examples.slice(0, 3).map((example, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(example)}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
              >
                {example}
              </button>
            ))}
          </div>

          <Button
            onClick={generatePreset}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Preset
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Generated Preset Display */}
      <AnimatePresence>
        {generatedPreset && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-white mb-2">{generatedPreset.name}</h4>
                <p className="text-sm text-gray-400">{generatedPreset.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={savePreset}
                  className="border-white/20 text-gray-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {type === 'camera' ? (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Camera Settings */}
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Camera className="w-4 h-4 text-purple-400" />
                    <h5 className="font-semibold text-white text-sm">Camera</h5>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lens</span>
                      <span className="text-white font-mono">{generatedPreset.camera.lens}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Aperture</span>
                      <span className="text-white font-mono">f/{generatedPreset.camera.aperture}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ISO</span>
                      <span className="text-white font-mono">{generatedPreset.camera.iso}</span>
                    </div>
                  </div>
                </div>

                {/* Lighting Setup */}
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sun className="w-4 h-4 text-yellow-400" />
                    <h5 className="font-semibold text-white text-sm">Lighting</h5>
                  </div>
                  <div className="space-y-2 text-sm">
                    {Object.entries(generatedPreset.lighting).map(([key, light]) => {
                      if (key === 'setup') return null;
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-gray-400 capitalize">{key.replace('Light', '')}</span>
                          <div className="flex items-center gap-2">
                            {light.color && (
                              <div 
                                className="w-4 h-4 rounded border border-white/20"
                                style={{ backgroundColor: light.color }}
                              />
                            )}
                            <span className="text-white font-mono text-xs">{light.intensity?.toFixed(1)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Motion Details */}
                <div className="bg-white/5 rounded-xl p-4">
                  <h5 className="font-semibold text-white text-sm mb-3">Motion Details</h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400 block mb-1">Movement</span>
                      <span className="text-white capitalize">{generatedPreset.camera.movement}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">Speed</span>
                      <span className="text-white capitalize">{generatedPreset.camera.speed}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">Duration</span>
                      <span className="text-white">{generatedPreset.duration}s</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">Frame Rate</span>
                      <span className="text-white">{generatedPreset.effects?.frameRate || 24} fps</span>
                    </div>
                  </div>
                </div>

                {/* Transitions */}
                {generatedPreset.transitions && generatedPreset.transitions.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <h5 className="font-semibold text-white text-sm mb-3">Transitions</h5>
                    <div className="space-y-2">
                      {generatedPreset.transitions.map((transition, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-400 capitalize">{transition.type}</span>
                          <span className="text-white">{transition.duration}s</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}