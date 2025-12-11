import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageGenerationPanel } from '@/components/media-studio/ImageGenerationPanel';
import { VideoGenerationPanel } from '@/components/media-studio/VideoGenerationPanel';
import { Camera, Film, Sparkles } from 'lucide-react';

export default function MediaStudioPage() {
  const [activeTab, setActiveTab] = useState('images');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">Cinema-Grade Media Generation</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent font-['Space_Grotesk']">
            Media Studio
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Professional-grade image and video generation with cinema camera presets and lighting setups
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 mb-6">
            <TabsTrigger 
              value="images" 
              className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400"
            >
              <Camera className="w-4 h-4 mr-2" />
              Images
            </TabsTrigger>
            <TabsTrigger 
              value="video" 
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              <Film className="w-4 h-4 mr-2" />
              Video
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images">
            <ImageGenerationPanel />
          </TabsContent>

          <TabsContent value="video">
            <VideoGenerationPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}