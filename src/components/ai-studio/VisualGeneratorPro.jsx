/**
 * Visual Generator Pro
 * Advanced visual asset generation
 */

import React, { useState } from 'react';
import { generationService } from '../services/GenerationService';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { CinematicInput } from '../atoms/CinematicInput';
import { Image, Palette, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { exportService } from '../services/ExportService';

export function VisualGeneratorPro() {
  const [assetType, setAssetType] = useState('icon');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  // Icon State
  const [iconData, setIconData] = useState({
    description: '',
    style: 'minimalist',
    colorPalette: 'monochrome',
    size: 512,
  });

  // Illustration State
  const [illustrationData, setIllustrationData] = useState({
    concept: '',
    style: 'flat design',
    colorScheme: 'vibrant',
    complexity: 'medium',
  });

  // Image State
  const [imageData, setImageData] = useState({
    prompt: '',
    style: 'photorealistic',
    camera: '35mm f/1.4',
    lighting: 'natural',
    mood: 'professional',
  });

  const handleGenerateIcon = async () => {
    try {
      setGenerating(true);
      const res = await generationService.generateIcon(iconData);
      setResult(res);
      toast.success('Icon generated');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateIllustration = async () => {
    try {
      setGenerating(true);
      const res = await generationService.generateIllustration(illustrationData);
      setResult(res);
      toast.success('Illustration generated');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    try {
      setGenerating(true);
      const res = await generationService.generateImage(imageData);
      setResult(res);
      toast.success('Image generated');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <CinematicCard>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Visual Generator</h2>

          <Tabs value={assetType} onValueChange={setAssetType}>
            <TabsList className="bg-white/5 border border-white/10 mb-6">
              <TabsTrigger value="icon">Icon</TabsTrigger>
              <TabsTrigger value="illustration">Illustration</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
            </TabsList>

            {/* Icon */}
            <TabsContent value="icon" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <Textarea
                  placeholder="Shopping cart with notification badge"
                  value={iconData.description}
                  onChange={(e) => setIconData({ ...iconData, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Style</label>
                  <Select value={iconData.style} onValueChange={(v) => setIconData({ ...iconData, style: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="line art">Line Art</SelectItem>
                      <SelectItem value="filled">Filled</SelectItem>
                      <SelectItem value="3d">3D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Color</label>
                  <Select value={iconData.colorPalette} onValueChange={(v) => setIconData({ ...iconData, colorPalette: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monochrome">Monochrome</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="multicolor">Multicolor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CinematicButton variant="primary" onClick={handleGenerateIcon} loading={generating} glow className="w-full">
                Generate Icon
              </CinematicButton>
            </TabsContent>

            {/* Illustration */}
            <TabsContent value="illustration" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Concept</label>
                <Textarea
                  placeholder="Team collaborating on a project"
                  value={illustrationData.concept}
                  onChange={(e) => setIllustrationData({ ...illustrationData, concept: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Style</label>
                  <Select value={illustrationData.style} onValueChange={(v) => setIllustrationData({ ...illustrationData, style: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat design">Flat Design</SelectItem>
                      <SelectItem value="isometric">Isometric</SelectItem>
                      <SelectItem value="hand drawn">Hand Drawn</SelectItem>
                      <SelectItem value="abstract">Abstract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Complexity</label>
                  <Select value={illustrationData.complexity} onValueChange={(v) => setIllustrationData({ ...illustrationData, complexity: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CinematicButton variant="primary" onClick={handleGenerateIllustration} loading={generating} glow className="w-full">
                Generate Illustration
              </CinematicButton>
            </TabsContent>

            {/* Cinematic Image */}
            <TabsContent value="image" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <Textarea
                  placeholder="Modern office workspace with natural lighting"
                  value={imageData.prompt}
                  onChange={(e) => setImageData({ ...imageData, prompt: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Camera</label>
                  <Select value={imageData.camera} onValueChange={(v) => setImageData({ ...imageData, camera: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="35mm f/1.4">35mm f/1.4</SelectItem>
                      <SelectItem value="50mm f/1.8">50mm f/1.8</SelectItem>
                      <SelectItem value="85mm f/1.2">85mm f/1.2</SelectItem>
                      <SelectItem value="24mm f/2.8">24mm f/2.8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Lighting</label>
                  <Select value={imageData.lighting} onValueChange={(v) => setImageData({ ...imageData, lighting: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="natural">Natural</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="golden hour">Golden Hour</SelectItem>
                      <SelectItem value="dramatic">Dramatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CinematicButton variant="primary" onClick={handleGenerateImage} loading={generating} glow className="w-full">
                Generate Image
              </CinematicButton>
            </TabsContent>
          </Tabs>
        </div>
      </CinematicCard>

      {/* Output Panel */}
      <div>
        {result ? (
          <CinematicCard>
            <div className="p-6">
              <div className="aspect-square bg-slate-900 rounded-xl mb-4 overflow-hidden">
                <img src={result.url} alt="Generated" className="w-full h-full object-contain" />
              </div>
              <div className="flex gap-2">
                <CinematicButton variant="primary" icon={Download} onClick={() => exportService.exportImage(result.url)} className="flex-1">
                  Download
                </CinematicButton>
              </div>
            </div>
          </CinematicCard>
        ) : (
          <CinematicCard className="p-12 text-center">
            <Image className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400">Generated visual will appear here</p>
          </CinematicCard>
        )}
      </div>
    </div>
  );
}

export default VisualGeneratorPro;