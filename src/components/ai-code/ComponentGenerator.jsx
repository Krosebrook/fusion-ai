import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui-library';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, Sparkles, Copy, Package, FileCode } from 'lucide-react';

const COMPONENT_PRESETS = [
  { id: 'notification', name: 'Notification System', desc: 'Toast notifications with queue management' },
  { id: 'profile', name: 'User Profile Module', desc: 'Complete user profile with avatar upload' },
  { id: 'auth', name: 'Authentication Flow', desc: 'Login, signup, password reset' },
  { id: 'search', name: 'Search Component', desc: 'Debounced search with filters' },
  { id: 'pagination', name: 'Pagination System', desc: 'Client & server-side pagination' },
  { id: 'form', name: 'Dynamic Form Builder', desc: 'Schema-driven forms with validation' }
];

export function ComponentGenerator() {
  const [description, setDescription] = useState('');
  const [componentName, setComponentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generateComponent = async (preset = null) => {
    const desc = preset ? preset.desc : description;
    const name = preset ? preset.name : componentName;

    if (!desc.trim()) {
      toast.error('Provide a component description');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a complete, production-ready React component for:

COMPONENT: ${name || 'Custom Component'}
DESCRIPTION: ${desc}

Generate:
1. Main component file with full implementation
2. Supporting utility files if needed
3. Unit tests using Jest/Vitest
4. TypeScript types/interfaces
5. Usage example
6. Integration guide for existing projects

Return as JSON:
{
  "componentName": "NotificationSystem",
  "files": [
    {
      "path": "components/NotificationSystem.jsx",
      "content": "complete component code",
      "description": "Main component"
    },
    {
      "path": "components/NotificationSystem.test.js",
      "content": "test code",
      "description": "Unit tests"
    }
  ],
  "dependencies": ["react-hot-toast", "framer-motion"],
  "usage": "code example showing how to use",
  "integrationSteps": ["step 1", "step 2"],
  "features": ["feature 1", "feature 2"],
  "props": [
    {"name": "onClose", "type": "function", "required": false, "description": "callback"}
  ]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            componentName: { type: "string" },
            files: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: { type: "string" },
                  content: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            dependencies: { type: "array", items: { type: "string" } },
            usage: { type: "string" },
            integrationSteps: { type: "array", items: { type: "string" } },
            features: { type: "array", items: { type: "string" } },
            props: { type: "array", items: { type: "object" } }
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

  const downloadAll = () => {
    if (!result) return;

    const content = result.files.map(f => `
${'='.repeat(60)}
FILE: ${f.path}
${f.description}
${'='.repeat(60)}

${f.content}
`).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.componentName || 'component'}-bundle.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <GlassmorphicCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Component Generator</h2>
              <p className="text-sm text-gray-400">AI-powered reusable components</p>
            </div>
          </div>

          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="bg-white/5 border border-white/10 mb-4">
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="space-y-3">
              <p className="text-sm text-gray-400 mb-4">Choose from common component patterns</p>
              {COMPONENT_PRESETS.map(preset => (
                <motion.div
                  key={preset.id}
                  whileHover={{ x: 4 }}
                  onClick={() => generateComponent(preset)}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <h4 className="text-sm font-semibold text-white mb-1">{preset.name}</h4>
                  <p className="text-xs text-gray-400">{preset.desc}</p>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Component Name</label>
                <Input
                  value={componentName}
                  onChange={(e) => setComponentName(e.target.value)}
                  placeholder="e.g., AdvancedDataTable"
                  className="bg-slate-900/50 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your component... (e.g., 'A responsive data table with sorting, filtering, and CSV export')"
                  className="min-h-[120px] bg-slate-900/50 border-white/10 text-white"
                />
              </div>

              <Button
                onClick={() => generateComponent()}
                disabled={loading || !description.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 h-12"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Component
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </GlassmorphicCard>
      </div>

      <div className="xl:col-span-3 space-y-6">
        {result ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <GlassmorphicCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{result.componentName}</h3>
                  <p className="text-sm text-gray-400">{result.files.length} files generated</p>
                </div>
                <Button onClick={downloadAll} className="bg-green-500 hover:bg-green-600">
                  <Copy className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              </div>
            </GlassmorphicCard>

            <GlassmorphicCard className="p-6">
              <h4 className="text-sm font-semibold text-white mb-3">Features</h4>
              <div className="flex flex-wrap gap-2">
                {result.features?.map((feature, i) => (
                  <Badge key={i} className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                    {feature}
                  </Badge>
                ))}
              </div>
            </GlassmorphicCard>

            {result.files.map((file, idx) => (
              <GlassmorphicCard key={idx} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-semibold text-white">{file.path}</h4>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(file.content);
                      toast.success('Copied!');
                    }}
                    className="border-white/10"
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mb-3">{file.description}</p>
                <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-xs text-gray-300 max-h-[300px] overflow-y-auto font-mono">
                  {file.content}
                </pre>
              </GlassmorphicCard>
            ))}

            <GlassmorphicCard className="p-6">
              <h4 className="text-sm font-semibold text-white mb-3">Usage Example</h4>
              <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-xs text-gray-300">
                {result.usage}
              </pre>
            </GlassmorphicCard>

            {result.integrationSteps && (
              <GlassmorphicCard className="p-6">
                <h4 className="text-sm font-semibold text-white mb-3">Integration Steps</h4>
                <ol className="space-y-2">
                  {result.integrationSteps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-300">
                      <span className="text-blue-400 font-semibold">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </GlassmorphicCard>
            )}
          </motion.div>
        ) : (
          <GlassmorphicCard className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
              <Package className="w-10 h-10 text-pink-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Ready to Generate</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Choose a preset or describe your custom component to generate production-ready code with tests
            </p>
          </GlassmorphicCard>
        )}
      </div>
    </div>
  );
}