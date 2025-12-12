import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CinematicContainer } from '@/components/cinematic-engine/CinematicContainer';
import { CameraController } from '@/components/cinematic-engine/CameraController';
import { StorytellingLayer } from '@/components/cinematic-engine/StorytellingLayer';
import { cinematicEngine } from '@/components/cinematic-engine/CinematicInteractionEngine';
import { GlassmorphicCard } from '@/components/ui-library/GlassmorphicCard';
import { Button } from '@/components/ui/button';
import { 
  Camera, Sparkles, Zap, TrendingUp, Shield, Code, 
  Play, Eye, Settings 
} from 'lucide-react';

export default function CinematicDemoPage() {
  const [showCamera, setShowCamera] = useState(false);
  const [storytellingEnabled, setStorytellingEnabled] = useState(false);
  const [stats, setStats] = useState({ interactions: 0, focusTime: 0 });

  useEffect(() => {
    // Analyze page elements for importance
    const elements = [
      { id: 'hero', type: 'hero', content: 'Main hero section with primary CTA' },
      { id: 'feature-1', type: 'feature', content: 'AI-powered dynamic animations' },
      { id: 'feature-2', type: 'feature', content: 'Cinematic camera controls' },
      { id: 'feature-3', type: 'feature', content: 'Responsive storytelling' },
      { id: 'demo-card', type: 'interactive', content: 'Interactive demo card' },
      { id: 'stats', type: 'stats', content: 'Real-time statistics' },
    ];

    cinematicEngine.analyzeContentImportance(elements);

    // Create narrative
    const narrative = cinematicEngine.createNarrative(elements, 'explore-features');

    // Track scroll behavior
    const handleScroll = () => {
      const velocity = Math.abs(window.scrollY - (window.lastScrollY || 0));
      window.lastScrollY = window.scrollY;
      cinematicEngine.trackUserBehavior('scroll', { velocity });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const demoElements = [
    { id: 'hero', title: 'Hero', description: 'Primary landing section' },
    { id: 'feature-1', title: 'Feature 1', description: 'AI Animations' },
    { id: 'feature-2', title: 'Feature 2', description: 'Camera Controls' },
    { id: 'feature-3', title: 'Feature 3', description: 'Storytelling' },
    { id: 'demo-card', title: 'Demo', description: 'Interactive Card' },
    { id: 'stats', title: 'Stats', description: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      {/* Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Cinematic Interaction Engine
          </h1>
          <p className="text-gray-400">
            AI-powered dynamic behaviors • Context-aware animations • Camera controls
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setStorytellingEnabled(!storytellingEnabled)}
            variant={storytellingEnabled ? "default" : "outline"}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {storytellingEnabled ? 'Storytelling On' : 'Storytelling Off'}
          </Button>
          <Button
            onClick={() => setShowCamera(!showCamera)}
            variant={showCamera ? "default" : "outline"}
            className="gap-2"
          >
            <Camera className="w-4 h-4" />
            {showCamera ? 'Hide Camera' : 'Show Camera'}
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <CinematicContainer
          elementId="hero"
          enableCamera={showCamera}
          className="w-full"
        >
          <GlassmorphicCard className="p-12 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 mb-6">
                <Eye className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-5xl font-bold text-white mb-4">
                Experience Cinematic UI
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                Animations that adapt to your behavior. Camera angles that guide your focus. 
                Storytelling that flows naturally through the interface.
              </p>
              <div className="flex gap-4 justify-center">
                <Button className="bg-gradient-to-r from-orange-500 to-pink-500 gap-2">
                  <Play className="w-4 h-4" />
                  Start Demo
                </Button>
                <Button variant="outline" className="border-white/20 text-white gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </div>
            </motion.div>
          </GlassmorphicCard>
        </CinematicContainer>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CinematicContainer elementId="feature-1">
            <GlassmorphicCard className="p-6 h-full">
              <Zap className="w-12 h-12 text-orange-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">
                AI-Powered Dynamics
              </h3>
              <p className="text-gray-400">
                Animations adjust in real-time based on user behavior patterns, 
                creating a personalized and responsive experience.
              </p>
            </GlassmorphicCard>
          </CinematicContainer>

          <CinematicContainer elementId="feature-2">
            <GlassmorphicCard className="p-6 h-full">
              <Camera className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">
                Cinematic Camera
              </h3>
              <p className="text-gray-400">
                Professional camera controls with presets like portrait, wide-angle, 
                and dramatic views for immersive navigation.
              </p>
            </GlassmorphicCard>
          </CinematicContainer>

          <CinematicContainer elementId="feature-3">
            <GlassmorphicCard className="p-6 h-full">
              <Sparkles className="w-12 h-12 text-pink-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">
                Smart Storytelling
              </h3>
              <p className="text-gray-400">
                UI elements subtly animate to guide attention through content 
                narratives, creating a cohesive visual story.
              </p>
            </GlassmorphicCard>
          </CinematicContainer>
        </div>

        {/* Interactive Demo Card */}
        <CinematicContainer
          elementId="demo-card"
          enableCamera={showCamera}
        >
          <GlassmorphicCard className="p-8">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Try It Yourself
                </h3>
                <p className="text-gray-300 mb-6">
                  Interact with this card - hover, click, and watch how the engine 
                  learns your behavior and adjusts the animations dynamically. Open 
                  the camera controls to explore different viewing angles.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="border-white/20 text-white">
                    <Code className="w-4 h-4 mr-2" />
                    View Code
                  </Button>
                  <Button variant="outline" className="border-white/20 text-white">
                    <Shield className="w-4 h-4 mr-2" />
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-64 h-48 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-lg border border-white/10 flex items-center justify-center">
                  <TrendingUp className="w-20 h-20 text-orange-500/50" />
                </div>
              </div>
            </div>
          </GlassmorphicCard>
        </CinematicContainer>

        {/* Stats Section */}
        <CinematicContainer elementId="stats">
          <GlassmorphicCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Real-Time Analytics
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-orange-500 mb-1">
                  {stats.interactions}
                </div>
                <div className="text-sm text-gray-400">Interactions Tracked</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-500 mb-1">
                  {stats.focusTime}s
                </div>
                <div className="text-sm text-gray-400">Total Focus Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-500 mb-1">
                  AI
                </div>
                <div className="text-sm text-gray-400">Adaptive Learning</div>
              </div>
            </div>
          </GlassmorphicCard>
        </CinematicContainer>
      </div>

      {/* Camera Controller */}
      {showCamera && <CameraController onClose={() => setShowCamera(false)} />}

      {/* Storytelling Layer */}
      <StorytellingLayer
        elements={demoElements}
        userGoal="Explore cinematic features"
        enabled={storytellingEnabled}
      />
    </div>
  );
}