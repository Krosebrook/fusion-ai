import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui-library';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, Package, FileCode, TestTube, BookOpen, Copy } from 'lucide-react';

const COMPONENT_TEMPLATES = [
  { id: 'notification', name: 'Notification System', desc: 'Toast notifications with queue management' },
  { id: 'auth', name: 'Authentication Module', desc: 'Login, signup, password reset flows' },
  { id: 'profile', name: 'User Profile', desc: 'Profile view, edit, avatar upload' },
  { id: 'search', name: 'Search Component', desc: 'Debounced search with filters' },
  { id: 'table', name: 'Data Table', desc: 'Sortable, filterable, paginated table' },
  { id: 'form', name: 'Form Builder', desc: 'Dynamic forms with validation' },
  { id: 'chart', name: 'Charts & Visualization', desc: 'Interactive data visualizations' },
  { id: 'chat', name: 'Chat Interface', desc: 'Real-time messaging UI' }
];

export function ComponentGenerator() {
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generateComponent = async () => {
    if (!description.trim() && !selectedTemplate) {
      toast.error('Provide a description or select a template');
      return;
    }

    setLoading(true);
    try {
      const componentDesc = selectedTemplate
        ? `${selectedTemplate.name}: ${selectedTemplate.desc}\n\nCustomization: ${description}`
        : description;

      const prompt = `Generate a PRODUCTION-READY React component: ${componentDesc}

Requirements:
1. Complete React component with TypeScript types
2. Shadcn/ui components for UI elements
3. Framer Motion for animations
4. Proper state management (useState/useReducer)
5. Error boundaries and loading states
6. Accessibility (ARIA labels, keyboard nav)
7. Responsive design (mobile-first)
8. Comprehensive unit tests
9. Storybook stories
10. JSDoc documentation

Return JSON:
{
  "componentName": "string",
  "files": [
    { "path": "components/MyComponent.tsx", "content": "complete component code" },
    { "path": "components/MyComponent.test.tsx", "content": "complete test suite" },
    { "path": "components/MyComponent.stories.tsx", "content": "storybook stories" }
  ],
  "dependencies": ["dependency@version"],
  "usage": {
    "import": "import statement",
    "example": "usage example code",
    "props": [{ "name": "string", "type": "string", "description": "string", "required": boolean }]
  },
  "features": ["feature 1", "feature 2"],
  "integrationGuide": "how to integrate into existing project",
  "testingStrategy": "testing approach explanation",
  "accessibility": ["a11y feature 1", "a11y feature 2"]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            componentName: { type: "string" },
            files: { type: "array", items: { type: "object" } },
            dependencies: { type: "array", items: { type: "string" } },
            usage: { type: "object" },
            features: { type: "array", items: { type: "string" } },
            integrationGuide: { type: "string" },
            testingStrategy: { type: "string" },
            accessibility: { type: "array", items: { type: "string" } }
          }
        }
      });

      setResult(response);
      toast.success('Component generated!');
    } catch (error) {
      toast.error('Generation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <GlassmorphicCard className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Package className="w-6 h-6 text-cyan-400" />
          Component Generator
        </h2>

        <div className="space-y-6">
          <div>
            <Label className="text-white mb-3 block">Quick Templates</Label>
            <div className="grid grid-cols-2 gap-3">
              {COMPONENT_TEMPLATES.map(template => (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="text-sm font-semibold text-white mb-1">{template.name}</div>
                  <div className="text-xs text-gray-400">{template.desc}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-white mb-2 block">Custom Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the component you need... e.g., 'A notification system with toast messages, queue management, and different severity levels'"
              rows={6}
              className="bg-slate-900/50 border-white/10 text-white"
            />
          </div>

          <Button
            onClick={generateComponent}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 h-12"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5 mr-2" />}
            {loading ? 'Generating...' : 'Generate Component'}
          </Button>
        </div>
      </GlassmorphicCard>

      <GlassmorphicCard className="p-6">
        {result ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{result.componentName}</h3>
              <div className="flex flex-wrap gap-2">
                {result.features?.map((feature, idx) => (
                  <Badge key={idx} className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {result.files?.map((file, idx) => (
                <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-medium text-white">{file.path}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => copyCode(file.content)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <pre className="text-xs text-gray-300 overflow-x-auto max-h-40 bg-slate-950/50 p-3 rounded">
                    {file.content}
                  </pre>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Integration Guide
              </h4>
              <p className="text-sm text-gray-300">{result.integrationGuide}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Testing Strategy
              </h4>
              <p className="text-sm text-gray-300">{result.testingStrategy}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">Select a template or describe your component</p>
            </div>
          </div>
        )}
      </GlassmorphicCard>
    </div>
  );
}