/**
 * AI-Powered Contextual Help System
 * Provides intelligent, context-aware tooltips and documentation
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { HelpCircle, Sparkles, ExternalLink, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function AIContextualHelp({ context, feature, position = 'bottom' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [helpContent, setHelpContent] = useState(null);
  const [loading, setLoading] = useState(false);

  const getContextualHelp = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a technical documentation expert for FlashFusion, an AI-powered CI/CD and development platform.

Context: ${context}
Feature: ${feature}

Provide a concise, helpful explanation (2-3 sentences) about this feature, including:
1. What it does
2. When to use it
3. A quick tip or best practice

Keep it actionable and beginner-friendly. Use markdown formatting.`,
        add_context_from_internet: false
      });

      setHelpContent(response);
    } catch (error) {
      setHelpContent('Unable to load help content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    if (!helpContent && !loading) {
      getContextualHelp();
    }
    setIsOpen(true);
  };

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
        aria-label="Get help"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />

            {/* Help Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', damping: 20 }}
              className={`absolute ${positionClasses[position]} z-50 w-96`}
            >
              <div className="bg-slate-900 border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-white">AI Assistant</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  {loading ? (
                    <div className="flex items-center gap-3 text-white/60">
                      <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Getting contextual help...</span>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="text-white/80 mb-3 leading-relaxed">{children}</p>,
                          strong: ({ children }) => <strong className="text-cyan-400 font-semibold">{children}</strong>,
                          code: ({ children }) => (
                            <code className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 text-xs font-mono">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {helpContent}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-white/5 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-white/40">Powered by AI</span>
                  <Button
                    onClick={() => window.open(`${window.location.origin}/docs`, '_blank')}
                    size="sm"
                    variant="ghost"
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Full Docs
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AIContextualHelp;