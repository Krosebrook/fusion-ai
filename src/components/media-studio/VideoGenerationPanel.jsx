import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIPresetGenerator } from './AIPresetGenerator';
import { Film, Play, Sparkles, Zap, Settings } from 'lucide-react';
import { MOTION_PRESETS } from '@/components/visual-engine/MotionPresets';
import { toast } from 'sonner';

const SCENE_TRANSITIONS = [
  { name: 'Cross Dissolve', duration: 0.5, type: 'fade' },
  { name: 'Wipe Left', duration: 0.3, type: 'wipe-left' },
  { name: 'Zoom Out', duration: 0.6, type: 'zoom-out' },
  { name: 'Push Down', duration: 0.4, type: 'push-down' },
  { name: 'Cinematic Cut', duration: 0.2, type: 'cut' },
];

export function VideoGenerationPanel() {
  const [prompt, setPrompt] = useState('');
  const [selectedMotion, setSelectedMotion] = useState('cinemaEntry');
  const [selectedTransition, setSelectedTransition] = useState(SCENE_TRANSITIONS[0]);
  const [aiPreset, setAiPreset] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a video description');
      return;
    }

    setIsGenerating(true);
    toast.success('Video generation coming soon! Using Runway, Pika, or Replicate APIs.');
    
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Main Generation Panel */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Film className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Video Generation</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Video Description</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A cinematic slow-motion shot of a hero walking through smoke with dramatic backlighting..."
              className="bg-white/5 border-white/10 text-white min-h-[120px] placeholder:text-gray-500"
            />
          </div>

          {/* Motion Preset Selector */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Motion Style</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(MOTION_PRESETS).slice(0, 5).map(([key, preset]) => {
                if (key === 'easings' || key === 'parallax') return null;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedMotion(key)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedMotion === key
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="text-white text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scene Transitions */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Scene Transition</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {SCENE_TRANSITIONS.map((transition) => (
                <button
                  key={transition.name}
                  onClick={() => setSelectedTransition(transition)}
                  className={`p-2 rounded-lg border text-xs transition-all ${
                    selectedTransition.name === transition.name
                      ? 'border-pink-500 bg-pink-500/10 text-pink-400'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {transition.name}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isGenerating ? (
              <>
                <Settings className="w-4 h-4 mr-2 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Generate Video
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AI Preset Generator */}
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

        <TabsContent value="presets" className="mt-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="text-white font-semibold mb-4">Pre-built Motion Presets</h4>
            <div className="grid gap-3">
              {[
                { name: 'Dramatic Slow-Motion', desc: '120fps hero entrance with speed ramp' },
                { name: 'Fast Action Sequence', desc: 'Quick cuts with motion blur and shake' },
                { name: 'Smooth Tracking Shot', desc: 'Steady cam follow with parallax layers' },
                { name: 'Epic Reveal', desc: 'Camera pull-back with depth of field shift' },
                { name: 'Intimate Close-up', desc: 'Shallow focus rack with subtle breathing' }
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    toast.success(`Applied: ${preset.name}`);
                    setAiPreset({ name: preset.name, description: preset.desc });
                  }}
                  className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-left transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-white font-medium mb-1 group-hover:text-purple-400 transition-colors">
                        {preset.name}
                      </h5>
                      <p className="text-sm text-gray-400">{preset.desc}</p>
                    </div>
                    <Zap className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <AIPresetGenerator 
            type="motion"
            onPresetGenerated={(preset) => {
              setAiPreset(preset);
              toast.success('Motion preset generated and applied!');
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Applied Preset Display */}
      {aiPreset && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">Active Preset</span>
          </div>
          <h4 className="text-white font-bold text-lg mb-1">{aiPreset.name}</h4>
          <p className="text-gray-400 text-sm">{aiPreset.description}</p>
        </motion.div>
      )}
    </div>
  );
}