import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui-library/FormField';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CameraPresetSelector, CAMERA_PRESETS, LIGHTING_PRESETS } from '@/components/visual-engine/CameraPresets';
import { GlassmorphicCard } from '@/components/ui-library/GlassmorphicCard';
import { AIPresetGenerator } from './AIPresetGenerator';
import { Sparkles, Camera, Sun, Palette, Download, Zap } from 'lucide-react';
import { toast } from 'sonner';

export function ImageGenerationPanel() {
  const [prompt, setPrompt] = useState('');
  const [cameraPreset, setCameraPreset] = useState('cinematic');
  const [lightingPreset, setLightingPreset] = useState('golden');
  const [aiPreset, setAiPreset] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    const camera = aiPreset?.camera ? 
      `${aiPreset.camera.lens}, ISO ${aiPreset.camera.iso}, ${aiPreset.camera.shutterSpeed}` :
      `${CAMERA_PRESETS[cameraPreset].lens}, ${CAMERA_PRESETS[cameraPreset].description}`;
    
    const lighting = aiPreset?.lighting ?
      `${aiPreset.name} lighting: ${aiPreset.description}` :
      `${LIGHTING_PRESETS[lightingPreset].name}, ${LIGHTING_PRESETS[lightingPreset].description}`;
    
    const enhancedPrompt = `
      ${prompt}
      
      Camera: ${camera}
      Lighting: ${lighting}
      Style: Cinematic, professional photography, high detail, 8K resolution
    `.trim();

    setGenerating(true);
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: enhancedPrompt
      });
      setGeneratedImage(result.url);
      toast.success('Image generated successfully');
    } catch (error) {
      toast.error('Generation failed: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <GlassmorphicCard className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-orange-400" />
          Cinema-Grade Image Generation
        </h2>

        <div className="space-y-6">
          <FormField
            label="Prompt"
            placeholder="A serene mountain landscape at sunset..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            multiline
            icon={Palette}
          />

          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="presets">
                <Zap className="w-4 h-4 mr-2" />
                Quick Presets
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generator
              </TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="space-y-6 mt-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Camera Preset</span>
                </div>
                <CameraPresetSelector selected={cameraPreset} onSelect={setCameraPreset} />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sun className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Lighting Setup</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(LIGHTING_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => setLightingPreset(key)}
                      className={`
                        p-3 rounded-lg border transition-all text-left
                        ${lightingPreset === key 
                          ? 'border-orange-500 bg-orange-500/10' 
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                        }
                      `}
                    >
                      <span className="font-medium text-white text-sm block mb-1">{preset.name}</span>
                      <p className="text-xs text-gray-400">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="mt-6">
              <AIPresetGenerator 
                type="camera"
                onPresetGenerated={(preset) => {
                  setAiPreset(preset);
                  toast.success('AI preset applied to generation!');
                }}
              />
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-lg py-6"
          >
            {generating ? 'Generating...' : 'Generate Image'}
          </Button>
        </div>
      </GlassmorphicCard>

      {generatedImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <GlassmorphicCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Generated Image</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = generatedImage;
                  a.download = 'flashfusion-generated.png';
                  a.click();
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            <img 
              src={generatedImage} 
              alt="Generated" 
              className="w-full rounded-xl shadow-2xl"
            />
          </GlassmorphicCard>
        </motion.div>
      )}
    </div>
  );
}