import { useState, useEffect } from 'react';
import { Code, Sparkles, Zap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const demoFrames = [
  {
    step: 1,
    title: "Describe Your App",
    description: "A task management app with team collaboration",
    visual: "input",
    duration: 2000
  },
  {
    step: 2,
    title: "AI Analyzes Requirements",
    description: "Understanding features, tech stack, and architecture...",
    visual: "processing",
    duration: 2000
  },
  {
    step: 3,
    title: "Generating Code",
    description: "Creating React components, API endpoints, database schema...",
    visual: "generating",
    duration: 3000
  },
  {
    step: 4,
    title: "Your App is Ready!",
    description: "Complete full-stack application generated in 45 seconds",
    visual: "success",
    duration: 3000
  }
];

export default function InteractiveDemoPreview({ onTryNow }) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const frame = demoFrames[currentFrame];
    const timer = setTimeout(() => {
      if (currentFrame < demoFrames.length - 1) {
        setCurrentFrame(currentFrame + 1);
      } else {
        setCurrentFrame(0); // Loop
      }
    }, frame.duration);

    return () => clearTimeout(timer);
  }, [currentFrame, isPlaying]);

  const frame = demoFrames[currentFrame];

  const renderVisual = () => {
    switch (frame.visual) {
      case 'input':
        return (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Code size={20} className="text-orange-400" />
              <span className="text-sm font-semibold text-gray-300">App Description</span>
            </div>
            <div className="bg-gray-900 rounded p-3 border border-gray-700">
              <p className="text-gray-400 text-sm leading-relaxed">
                {frame.description}
              </p>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="bg-gray-800/50 border border-blue-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Sparkles size={24} className="text-blue-400 animate-pulse" />
                <div className="absolute inset-0 bg-blue-400 blur-xl opacity-30 animate-pulse" />
              </div>
              <span className="text-sm font-semibold text-blue-300">AI Processing</span>
            </div>
            <div className="space-y-2">
              {['Analyzing requirements', 'Selecting tech stack', 'Planning architecture'].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-gray-400 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'generating':
        return (
          <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={20} className="text-purple-400 animate-pulse" />
              <span className="text-sm font-semibold text-purple-300">Generating Code</span>
            </div>
            <div className="bg-gray-900 rounded p-3 font-mono text-xs overflow-hidden">
              <div className="space-y-1">
                <div className="text-gray-500">// App.jsx</div>
                <div className="text-blue-400">import React from 'react';</div>
                <div className="text-green-400">export default function App() {'{'}</div>
                <div className="text-gray-400 ml-4">return (</div>
                <div className="text-yellow-400 ml-8">&lt;TaskManager /&gt;</div>
                <div className="animate-pulse">▊</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <div className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"
                  style={{ width: '75%' }}
                />
              </div>
              <span>75%</span>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <CheckCircle size={32} className="text-green-400" />
                <div className="absolute inset-0 bg-green-400 blur-xl opacity-40" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Complete!</h4>
                <p className="text-green-300 text-sm">Generated in 45 seconds</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-800/50 rounded p-2">
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-xs text-gray-400">Components</div>
              </div>
              <div className="bg-gray-800/50 rounded p-2">
                <div className="text-2xl font-bold text-white">6</div>
                <div className="text-xs text-gray-400">API Routes</div>
              </div>
              <div className="bg-gray-800/50 rounded p-2">
                <div className="text-2xl font-bold text-white">1</div>
                <div className="text-xs text-gray-400">Database</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
        {/* Progress Indicators */}
        <div className="flex items-center gap-2 mb-6">
          {demoFrames.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                idx === currentFrame
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500'
                  : idx < currentFrame
                  ? 'bg-gray-600'
                  : 'bg-gray-800'
              }`}
            />
          ))}
        </div>

        {/* Title & Description */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="text-orange-400">Step {frame.step}</span>
            <span className="text-gray-600">→</span>
            {frame.title}
          </h3>
          <p className="text-gray-400">{frame.description}</p>
        </div>

        {/* Visual Frame */}
        <div className="min-h-[200px]">
          {renderVisual()}
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <Button
            onClick={onTryNow}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6"
          >
            Try This Now - Free
          </Button>
        </div>
      </div>

      {/* Floating Badge */}
      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
        ✨ Live Demo
      </div>
    </div>
  );
}