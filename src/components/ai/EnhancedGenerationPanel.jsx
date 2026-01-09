import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Wand2, Settings2, Loader2 } from "lucide-react";

const spring = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

const easeInOutCubic = [0.4, 0, 0.2, 1];

export default function EnhancedGenerationPanel({ 
  title = "AI Generation Studio",
  onGenerate,
  config,
  setConfig,
  generating = false,
  progress = 0,
  presets = []
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: easeInOutCubic }}
      className="relative overflow-hidden rounded-2xl border border-white/10"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(255,123,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,123,0,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          animation: "gridMove 20s linear infinite"
        }} />
      </div>

      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6, ease: easeInOutCubic }}
              className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-500/30"
            >
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {title}
              </h2>
              <p className="text-sm text-gray-400 mt-1">Cinema-grade AI generation with advanced controls</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <Settings2 className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">{showAdvanced ? "Hide" : "Show"} Advanced</span>
          </motion.button>
        </div>

        {/* Quick Presets */}
        {presets.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <label className="block text-sm font-semibold text-gray-300 mb-3">Quick Presets</label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset, idx) => (
                <motion.button
                  key={preset.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * idx, ...spring }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setConfig({ ...config, ...preset.values })}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:border-orange-500/50 transition-all"
                >
                  <span className="text-sm font-medium text-gray-200">{preset.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Form */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, ease: easeInOutCubic }}
          >
            <label className="block text-sm font-semibold text-gray-300 mb-2">Project Name</label>
            <Input
              value={config.name || ""}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              placeholder="My Awesome Project"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50 transition-all"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, ease: easeInOutCubic }}
          >
            <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
            <Textarea
              value={config.description || ""}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              placeholder="Describe your vision in detail..."
              rows={4}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50 transition-all resize-none"
            />
          </motion.div>

          {/* Advanced Options */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: easeInOutCubic }}
                className="space-y-6 pt-6 border-t border-white/10"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Camera Lens</label>
                    <Select value={config.lens || "35mm"} onValueChange={(v) => setConfig({ ...config, lens: v })}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24mm">24mm f/2.8 (Wide)</SelectItem>
                        <SelectItem value="35mm">35mm f/1.4 (Natural)</SelectItem>
                        <SelectItem value="85mm">85mm f/1.2 (Portrait)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Lighting Setup</label>
                    <Select value={config.lighting || "natural"} onValueChange={(v) => setConfig({ ...config, lighting: v })}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="natural">Natural Golden Hour</SelectItem>
                        <SelectItem value="studio">3-Point Studio</SelectItem>
                        <SelectItem value="dramatic">Dramatic RGB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <AnimatePresence>
          {generating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                  <span className="text-sm font-medium text-gray-300">Generating...</span>
                </div>
                <span className="text-sm font-bold text-orange-400">{progress}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: easeInOutCubic }}
                  className="h-full bg-gradient-to-r from-orange-500 to-pink-500 shadow-lg shadow-orange-500/50"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Button
            onClick={onGenerate}
            disabled={generating || !config.name || !config.description}
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Magic...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Generate with AI
              </>
            )}
          </Button>
        </motion.div>
      </div>

      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }
      `}</style>
    </motion.div>
  );
}