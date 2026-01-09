import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cinematicEngine } from './CinematicInteractionEngine';
import { Sparkles, ArrowRight, Eye } from 'lucide-react';

export function StorytellingLayer({ elements, userGoal, enabled = true }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [narrative, setNarrative] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!enabled || !elements?.length) return;

    generateNarrative();
  }, [elements, userGoal, enabled]);

  const generateNarrative = async () => {
    const story = await cinematicEngine.generateStorytellingSequence(
      `Page with ${elements.length} interactive elements`,
      userGoal || 'Navigate and explore interface'
    );
    
    if (story) {
      setNarrative(story);
    }
  };

  const playNarrative = () => {
    if (!narrative?.sequence) return;
    
    setIsPlaying(true);
    setCurrentStep(0);

    narrative.sequence.forEach((step, index) => {
      setTimeout(() => {
        highlightElement(step.elementId, step.action);
        setCurrentStep(index + 1);
        
        if (index === narrative.sequence.length - 1) {
          setTimeout(() => setIsPlaying(false), 2000);
        }
      }, step.timing * 1000);
    });
  };

  const highlightElement = (elementId, action) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Focus camera on element
    cinematicEngine.focusElement(elementId, true);

    // Apply highlight effect
    const originalStyle = element.style.cssText;
    
    switch (action) {
      case 'highlight':
        element.style.boxShadow = '0 0 40px rgba(255, 123, 0, 0.8)';
        element.style.transform = 'scale(1.05)';
        break;
      case 'zoom':
        element.style.transform = 'scale(1.1)';
        break;
      case 'pulse':
        element.style.animation = 'pulse 1s ease-in-out';
        break;
      case 'glow':
        element.style.boxShadow = '0 0 30px rgba(0, 180, 216, 0.8)';
        break;
    }

    element.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    element.style.zIndex = '1000';

    // Reset after delay
    setTimeout(() => {
      element.style.cssText = originalStyle;
    }, 2000);
  };

  if (!enabled || !narrative) return null;

  return (
    <>
      {/* Storytelling Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-8 left-8 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={playNarrative}
          disabled={isPlaying}
          className={`
            px-6 py-3 rounded-xl font-semibold
            flex items-center gap-2
            transition-all duration-300
            ${isPlaying
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50'
            }
          `}
        >
          {isPlaying ? (
            <>
              <Eye className="w-5 h-5 animate-pulse" />
              Playing Story...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Play Guided Tour
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Progress Indicator */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed left-8 bottom-24 z-50"
          >
            <div className="bg-slate-900/90 backdrop-blur-lg rounded-lg p-4 border border-white/10 min-w-[200px]">
              <div className="text-xs text-gray-400 mb-2">
                Step {currentStep} of {narrative.sequence.length}
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / narrative.sequence.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              {narrative.sequence[currentStep - 1] && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-white mt-3"
                >
                  {narrative.sequence[currentStep - 1].message}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Narrative Overlay */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm pointer-events-none z-40"
          />
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </>
  );
}