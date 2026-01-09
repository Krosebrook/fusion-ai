import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { 
  Sparkles, Search, Plus, Check, Copy, Eye, Loader2,
  MousePointer2, LayoutGrid, Type, FileCode, Palette
} from "lucide-react";

const easeInOutCubic = [0.4, 0, 0.2, 1];

const componentCategories = [
  {
    id: "buttons",
    name: "Buttons",
    icon: MousePointer2,
    color: "#FF7B00",
    components: [
      { id: "primary-btn", name: "Primary Button", preview: "bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg", code: `<button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">Click Me</button>` },
      { id: "outline-btn", name: "Outline Button", preview: "border-2 border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/5", code: `<button className="border-2 border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/5 transition-all">Click Me</button>` },
      { id: "ghost-btn", name: "Ghost Button", preview: "text-white px-6 py-3 rounded-xl hover:bg-white/10", code: `<button className="text-white px-6 py-3 rounded-xl hover:bg-white/10 transition-all">Click Me</button>` },
    ]
  },
  {
    id: "cards",
    name: "Cards",
    icon: LayoutGrid,
    color: "#00B4D8",
    components: [
      { id: "glass-card", name: "Glass Card", preview: "bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6", code: `<div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">\n  <h3 className="text-xl font-bold text-white mb-2">Card Title</h3>\n  <p className="text-gray-400">Card content goes here</p>\n</div>` },
      { id: "gradient-card", name: "Gradient Card", preview: "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6", code: `<div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">\n  <h3 className="text-xl font-bold text-white mb-2">Card Title</h3>\n  <p className="text-gray-300">Card content goes here</p>\n</div>` },
      { id: "hover-card", name: "Hover Card", preview: "bg-white/5 border border-white/10 rounded-xl p-4 hover:border-orange-500/50 hover:shadow-2xl transition-all", code: `<div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-orange-500/50 hover:shadow-2xl transition-all cursor-pointer">\n  <h4 className="font-semibold text-white">Hover Me</h4>\n</div>` },
    ]
  },
  {
    id: "forms",
    name: "Forms",
    icon: Type,
    color: "#10B981",
    components: [
      { id: "input-field", name: "Input Field", preview: "bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500", code: `<input type="text" placeholder="Enter text..." className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors" />` },
      { id: "textarea", name: "Textarea", preview: "bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500", code: `<textarea placeholder="Enter text..." rows={4} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors resize-none w-full"></textarea>` },
      { id: "select", name: "Select Dropdown", preview: "bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white", code: `<select className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none transition-colors">\n  <option>Option 1</option>\n  <option>Option 2</option>\n  <option>Option 3</option>\n</select>` },
    ]
  },
  {
    id: "layout",
    name: "Layout",
    icon: FileCode,
    color: "#8B5CF6",
    components: [
      { id: "container", name: "Container", preview: "max-w-7xl mx-auto px-6", code: `<div className="max-w-7xl mx-auto px-6">\n  {/* Content */}\n</div>` },
      { id: "grid", name: "Grid Layout", preview: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", code: `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">\n  {/* Grid items */}\n</div>` },
      { id: "flex", name: "Flex Layout", preview: "flex items-center justify-between gap-4", code: `<div className="flex items-center justify-between gap-4">\n  {/* Flex items */}\n</div>` },
    ]
  }
];

export default function ComponentLibrary({ projectDescription, onAddComponent }) {
  const [selectedCategory, setSelectedCategory] = useState("buttons");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [addedComponents, setAddedComponents] = useState(new Set());

  const generateSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this project description: "${projectDescription}"
        
Suggest 5 specific UI components that would be most useful for this project. For each component, provide:
- Component type (button, card, form, layout)
- Why it's needed
- Specific use case

Consider the project's purpose, target users, and features when making suggestions.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  component_type: { type: "string" },
                  name: { type: "string" },
                  reason: { type: "string" },
                  use_case: { type: "string" }
                }
              }
            }
          }
        }
      });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error("Error generating suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAddComponent = (component) => {
    onAddComponent(component);
    setAddedComponents(new Set([...addedComponents, component.id]));
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  const filteredComponents = componentCategories
    .find(cat => cat.id === selectedCategory)
    ?.components.filter(comp => 
      comp.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: easeInOutCubic }}
      className="rounded-2xl border border-white/10 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
      }}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Component Library
              </h3>
              <p className="text-xs text-gray-400">Select and insert pre-built components</p>
            </div>
          </div>
          <Button 
            onClick={generateSuggestions}
            disabled={loadingSuggestions}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
          >
            {loadingSuggestions ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            AI Suggestions
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search components..."
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      {/* AI Suggestions */}
      {suggestions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-b border-white/10 p-6 bg-gradient-to-r from-orange-500/10 to-pink-500/10"
        >
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            AI Recommended for Your Project
          </h4>
          <div className="space-y-2">
            {suggestions.map((sug, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white mb-1">{sug.name}</p>
                    <p className="text-xs text-gray-400 mb-1">{sug.reason}</p>
                    <p className="text-xs text-orange-400">{sug.use_case}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setSelectedCategory(sug.component_type)}
                    className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                  >
                    View
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-[200px_1fr]">
        {/* Categories Sidebar */}
        <div className="border-r border-white/10 p-4 space-y-2">
          {componentCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                selectedCategory === cat.id
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
              <span className="text-sm font-medium">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Components Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredComponents.map((comp, idx) => (
              <motion.div
                key={comp.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl border border-white/10 overflow-hidden bg-white/5 hover:border-white/20 transition-all group"
              >
                {/* Preview */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50">
                  <div className="flex items-center justify-center min-h-[100px]">
                    <div className={comp.preview} style={{ minWidth: '120px', textAlign: 'center' }}>
                      {comp.name.includes('Button') && 'Click Me'}
                      {comp.name.includes('Card') && (
                        <div>
                          <div className="text-sm font-semibold mb-1">Preview</div>
                          <div className="text-xs opacity-70">Content</div>
                        </div>
                      )}
                      {comp.name.includes('Input') && 'Sample text'}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-white">{comp.name}</h4>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedComponent(comp)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyCode(comp.code)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddComponent(comp)}
                        disabled={addedComponents.has(comp.id)}
                        className={addedComponents.has(comp.id) 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"}
                      >
                        {addedComponents.has(comp.id) ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <pre className="text-xs text-gray-400 bg-black/20 rounded p-2 overflow-x-auto">
                    {comp.code.substring(0, 60)}...
                  </pre>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Component Detail Modal */}
      <AnimatePresence>
        {selectedComponent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setSelectedComponent(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: easeInOutCubic }}
              className="rounded-2xl border border-white/10 max-w-2xl w-full"
              style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)",
                backdropFilter: "blur(30px)",
                boxShadow: "0 30px 80px rgba(0, 0, 0, 0.6)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{selectedComponent.name}</h3>
                <Button size="sm" variant="ghost" onClick={() => setSelectedComponent(null)}>
                  ×
                </Button>
              </div>
              <div className="p-6">
                <div className="mb-6 p-8 rounded-xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-white/10">
                  <div className={selectedComponent.preview}>
                    {selectedComponent.name.includes('Button') && 'Click Me'}
                    {selectedComponent.name.includes('Card') && (
                      <div>
                        <div className="text-lg font-bold mb-2">Card Title</div>
                        <div className="text-sm opacity-70">This is a preview of the card component with sample content.</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-black/40 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300">{selectedComponent.code}</pre>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button onClick={() => copyCode(selectedComponent.code)} className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                  <Button 
                    onClick={() => {
                      handleAddComponent(selectedComponent);
                      setSelectedComponent(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Project
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}