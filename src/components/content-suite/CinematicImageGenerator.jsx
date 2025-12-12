import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassmorphicCard } from '@/components/ui-library/GlassmorphicCard';
import { Sparkles, Camera, Sun, Download, Zap, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const CINEMATIC_STYLES = [
  {
    id: 'film-noir',
    name: 'Film Noir',
    camera: '35mm f/1.4, low angle, dramatic shadows',
    lighting: 'high contrast key light, deep shadows, rim lighting',
    style: 'black and white, 1940s aesthetic, chiaroscuro'
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    camera: '85mm f/1.2, natural perspective, shallow depth of field',
    lighting: 'golden hour natural light, warm tones, soft shadows',
    style: 'warm color grading, sun flare, soft focus'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    camera: '24mm f/2.8, wide angle, dynamic perspective',
    lighting: 'RGB neon lights, purple and blue tones, dramatic rim lighting',
    style: 'futuristic, high tech, neon aesthetic'
  },
  {
    id: 'studio',
    name: 'Studio Professional',
    camera: '85mm f/2.8, three-point lighting setup, neutral perspective',
    lighting: 'key light with softbox, fill light, rim light for depth',
    style: 'clean, professional, editorial quality'
  },
  {
    id: 'cinematic-wide',
    name: 'Cinematic Wide',
    camera: 'ARRI Alexa Mini, 35mm anamorphic lens, 2.39:1 aspect ratio',
    lighting: 'dramatic side lighting, color grading with teal-orange palette',
    style: 'blockbuster film aesthetic, lens flares, epic scale'
  },
  {
    id: 'portrait',
    name: 'Portrait Creamy',
    camera: '85mm f/1.2, Canon EOS R5, creamy bokeh background',
    lighting: 'soft window light, subtle fill, natural skin tones',
    style: 'shallow depth of field, dreamy bokeh, professional portrait'
  }
];

const MOTION_PRESETS = [
  { id: 'fade', name: 'Fade In', description: 'Gentle opacity transition' },
  { id: 'slide', name: 'Slide Up', description: 'Cinematic reveal from bottom' },
  { id: 'zoom', name: 'Zoom In', description: 'Dynamic scale entrance' },
  { id: 'parallax', name: 'Parallax', description: 'Layered depth movement' }
];

export function CinematicImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('cinematic-wide');
  const [customCamera, setCustomCamera] = useState('');
  const [customLighting, setCustomLighting] = useState('');
  const [motionPreset, setMotionPreset] = useState('fade');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    const style = CINEMATIC_STYLES.find(s => s.id === selectedStyle);
    
    const enhancedPrompt = `
      ${prompt}
      
      CAMERA SETUP: ${customCamera || style.camera}
      LIGHTING: ${customLighting || style.lighting}
      VISUAL STYLE: ${style.style}
      
      Additional specs: Cinematic composition, professional photography, 8K resolution, RAW format quality, color graded, film grain texture
    `.trim();

    setGenerating(true);
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: enhancedPrompt
      });
      
      setGeneratedImage({
        url: result.url,
        style: style.name,
        motion: motionPreset
      });
      
      toast.success('Cinematic image generated!');
    } catch (error) {
      toast.error('Generation failed: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const getMotionVariants = () => {
    switch (motionPreset) {
      case 'slide':
        return {
          initial: { opacity: 0, y: 60 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
        };
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
        };
      case 'parallax':
        return {
          initial: { opacity: 0, y: 40, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: { duration: 1, ease: [0.4, 0, 0.2, 1] }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.5 }
        };
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: generatedImage ? '1fr 1fr' : '1fr', gap: '32px' }}>
      {/* Configuration Panel */}
      <GlassmorphicCard className="p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-orange-400" />
          Cinematic Visual Generator
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Visual Description *
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic cityscape at sunset with flying vehicles..."
              rows={4}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>

          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="presets">
                <Zap className="w-4 h-4 mr-2" />
                Style Presets
              </TabsTrigger>
              <TabsTrigger value="custom">
                <Camera className="w-4 h-4 mr-2" />
                Custom Setup
              </TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="space-y-4 mt-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-300">Cinematic Style</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {CINEMATIC_STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`
                        p-3 rounded-lg border transition-all text-left
                        ${selectedStyle === style.id 
                          ? 'border-orange-500 bg-orange-500/10' 
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                        }
                      `}
                    >
                      <span className="font-medium text-white text-sm block mb-1">{style.name}</span>
                      <p className="text-xs text-slate-400">{style.camera.substring(0, 40)}...</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-300">Animation Preset</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {MOTION_PRESETS.map(motion => (
                    <button
                      key={motion.id}
                      onClick={() => setMotionPreset(motion.id)}
                      className={`
                        p-3 rounded-lg border transition-all text-left
                        ${motionPreset === motion.id 
                          ? 'border-pink-500 bg-pink-500/10' 
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                        }
                      `}
                    >
                      <span className="font-medium text-white text-sm block mb-1">{motion.name}</span>
                      <p className="text-xs text-slate-400">{motion.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  <Camera className="w-4 h-4 inline mr-1" />
                  Custom Camera Setup
                </label>
                <Textarea
                  value={customCamera}
                  onChange={(e) => setCustomCamera(e.target.value)}
                  placeholder="e.g., 85mm f/1.2, Canon EOS R5, shallow depth of field"
                  rows={2}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  <Sun className="w-4 h-4 inline mr-1" />
                  Custom Lighting Setup
                </label>
                <Textarea
                  value={customLighting}
                  onChange={(e) => setCustomLighting(e.target.value)}
                  placeholder="e.g., three-point lighting, softbox key light, natural fill"
                  rows={2}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-lg py-6 hover:opacity-90"
          >
            {generating ? 'Generating...' : 'Generate Cinematic Visual'}
          </Button>
        </div>
      </GlassmorphicCard>

      {/* Output Panel */}
      {generatedImage && (
        <motion.div
          {...getMotionVariants()}
        >
          <GlassmorphicCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Generated Visual</h3>
                <p className="text-sm text-slate-400">Style: {generatedImage.style} | Motion: {motionPreset}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = generatedImage.url;
                  a.download = `flashfusion-${selectedStyle}-${Date.now()}.png`;
                  a.click();
                  toast.success('Image downloaded!');
                }}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <img 
                src={generatedImage.url} 
                alt="Generated cinematic visual" 
                className="w-full"
                style={{
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-xs text-slate-300">
                  <strong>Camera:</strong> {customCamera || CINEMATIC_STYLES.find(s => s.id === selectedStyle)?.camera}
                </p>
              </div>
            </div>

            {/* Motion Preview Hint */}
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-slate-400">
                <Sparkles className="w-3 h-3 inline mr-1" />
                This image uses the <strong className="text-white">{motionPreset}</strong> animation preset. 
                When used in your app, it will animate with cinematic timing (cubic-bezier 0.4, 0, 0.2, 1).
              </p>
            </div>
          </GlassmorphicCard>
        </motion.div>
      )}
    </div>
  );
}