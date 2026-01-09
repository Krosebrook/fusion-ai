import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui-library';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  Loader2, Link2, Copy, Code, Key, Sparkles, 
  ChevronRight, CheckCircle, FileCode
} from 'lucide-react';

const INTEGRATIONS = [
  { 
    id: 'openai', 
    name: 'OpenAI', 
    desc: 'GPT-4, DALL-E, Embeddings',
    category: 'AI/ML',
    color: '#10A37F',
    icon: '🤖'
  },
  { 
    id: 'replicate', 
    name: 'Replicate', 
    desc: 'Stable Diffusion, SDXL, LLMs',
    category: 'AI/ML',
    color: '#7C3AED',
    icon: '🎨'
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic Claude', 
    desc: 'Claude 3 models',
    category: 'AI/ML',
    color: '#D4A373',
    icon: '🧠'
  },
  { 
    id: 'stripe', 
    name: 'Stripe', 
    desc: 'Payments, subscriptions',
    category: 'Payments',
    color: '#635BFF',
    icon: '💳'
  },
  { 
    id: 'firebase', 
    name: 'Firebase', 
    desc: 'Auth, Firestore, Storage',
    category: 'Backend',
    color: '#FFCA28',
    icon: '🔥'
  },
  { 
    id: 'supabase', 
    name: 'Supabase', 
    desc: 'Postgres, Auth, Storage',
    category: 'Backend',
    color: '#3ECF8E',
    icon: '⚡'
  },
  { 
    id: 'sendgrid', 
    name: 'SendGrid', 
    desc: 'Transactional email',
    category: 'Communication',
    color: '#1A82E2',
    icon: '📧'
  },
  { 
    id: 'twilio', 
    name: 'Twilio', 
    desc: 'SMS, Voice, Video',
    category: 'Communication',
    color: '#F22F46',
    icon: '📱'
  },
  { 
    id: 'aws-s3', 
    name: 'AWS S3', 
    desc: 'Object storage',
    category: 'Storage',
    color: '#FF9900',
    icon: '☁️'
  },
  { 
    id: 'cloudinary', 
    name: 'Cloudinary', 
    desc: 'Media management',
    category: 'Storage',
    color: '#3448C5',
    icon: '🖼️'
  }
];

export function IntegrationGenerator() {
  const [selectedIntegrations, setSelectedIntegrations] = useState([]);
  const [useCase, setUseCase] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expandedFile, setExpandedFile] = useState(null);

  const toggleIntegration = (id) => {
    setSelectedIntegrations(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const generateIntegrations = async () => {
    if (selectedIntegrations.length === 0) {
      toast.error('Select at least one integration');
      return;
    }

    setLoading(true);
    try {
      const selected = INTEGRATIONS.filter(i => selectedIntegrations.includes(i.id));

      const prompt = `Generate complete, production-ready integration code for the following APIs:

SELECTED INTEGRATIONS:
${selected.map(i => `- ${i.name}: ${i.desc}`).join('\n')}

USE CASE:
${useCase || 'General purpose application integration'}

Generate comprehensive integration code including:

1. **Environment Variables Setup**
   - .env.example with all required API keys
   - Clear descriptions for each variable

2. **SDK Initialization & Configuration**
   - Proper SDK imports and setup
   - Connection pooling where applicable
   - Error handling and retry logic

3. **Authentication & Security**
   - API key validation
   - Secure credential storage patterns
   - Rate limiting implementation

4. **Common Methods/Endpoints**
   - Most frequently used operations
   - Type definitions (TypeScript)
   - JSDoc comments for documentation

5. **Error Handling**
   - Custom error classes
   - Graceful degradation
   - Logging integration

6. **Testing Examples**
   - Unit test examples
   - Integration test patterns

7. **Usage Examples**
   - Real-world code snippets
   - Best practices

Return as JSON:
{
  "integrations": [
    {
      "name": "OpenAI",
      "files": [
        {
          "path": "lib/integrations/openai.js",
          "content": "complete code",
          "description": "file purpose"
        }
      ],
      "envVars": [
        {
          "key": "OPENAI_API_KEY",
          "description": "API key from platform.openai.com",
          "required": true,
          "example": "sk-..."
        }
      ],
      "usage": "code example showing how to use",
      "setup": ["step 1", "step 2"]
    }
  ],
  "commonPatterns": ["pattern 1", "pattern 2"],
  "securityNotes": ["note 1", "note 2"]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            integrations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
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
                  envVars: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        key: { type: "string" },
                        description: { type: "string" },
                        required: { type: "boolean" },
                        example: { type: "string" }
                      }
                    }
                  },
                  usage: { type: "string" },
                  setup: { type: "array", items: { type: "string" } }
                }
              }
            },
            commonPatterns: { type: "array", items: { type: "string" } },
            securityNotes: { type: "array", items: { type: "string" } }
          }
        }
      });

      setResult(response);
      toast.success('Integration code generated!');
    } catch (error) {
      toast.error('Failed to generate: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const downloadAll = () => {
    if (!result) return;
    
    const allContent = result.integrations.map(integration => {
      const files = integration.files.map(f => `
${'='.repeat(60)}
FILE: ${f.path}
${f.description}
${'='.repeat(60)}

${f.content}

`).join('\n');

      const envVars = `
${'='.repeat(60)}
ENVIRONMENT VARIABLES FOR ${integration.name}
${'='.repeat(60)}

${integration.envVars.map(v => `${v.key}=${v.example} # ${v.description}`).join('\n')}
`;

      return files + envVars;
    }).join('\n\n');

    const blob = new Blob([allContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'integrations-bundle.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Configuration Panel */}
      <div className="xl:col-span-2 space-y-6">
        <GlassmorphicCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Integration Generator</h2>
              <p className="text-sm text-gray-400">Connect to any API instantly</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Use Case */}
            <div>
              <Label className="text-white mb-2 block">Use Case (Optional)</Label>
              <Textarea
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                placeholder="E.g., Building a chatbot with image generation and payment processing..."
                className="bg-slate-900/50 border-white/10 text-white min-h-[80px]"
              />
            </div>

            {/* Integrations Grid */}
            <div>
              <Label className="text-white mb-3 block">Select Integrations</Label>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {Object.entries(
                  INTEGRATIONS.reduce((acc, integration) => {
                    if (!acc[integration.category]) acc[integration.category] = [];
                    acc[integration.category].push(integration);
                    return acc;
                  }, {})
                ).map(([category, items]) => (
                  <div key={category}>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4 first:mt-0">
                      {category}
                    </div>
                    {items.map(integration => (
                      <motion.div
                        key={integration.id}
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer mb-2"
                        onClick={() => toggleIntegration(integration.id)}
                      >
                        <Checkbox
                          checked={selectedIntegrations.includes(integration.id)}
                          onCheckedChange={() => toggleIntegration(integration.id)}
                          className="border-white/20"
                        />
                        <span className="text-2xl">{integration.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{integration.name}</div>
                          <div className="text-xs text-gray-400">{integration.desc}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={generateIntegrations}
              disabled={loading || selectedIntegrations.length === 0}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Integrations
                </>
              )}
            </Button>
          </div>
        </GlassmorphicCard>
      </div>

      {/* Results Panel */}
      <div className="xl:col-span-3 space-y-6">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <GlassmorphicCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {result.integrations.length} Integration{result.integrations.length !== 1 ? 's' : ''}
                    </h3>
                    <p className="text-sm text-gray-400">Ready to integrate</p>
                  </div>
                  <Button onClick={downloadAll} className="bg-green-500 hover:bg-green-600">
                    <Copy className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </GlassmorphicCard>

              {/* Integrations */}
              {result.integrations.map((integration, idx) => (
                <GlassmorphicCard key={idx} className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-3xl">
                      {INTEGRATIONS.find(i => i.name === integration.name)?.icon || '🔗'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{integration.name}</h3>
                      <p className="text-sm text-gray-400">
                        {integration.files.length} file{integration.files.length !== 1 ? 's' : ''} · {integration.envVars.length} env var{integration.envVars.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Environment Variables */}
                  <div className="mb-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                    <h4 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Environment Variables
                    </h4>
                    <div className="space-y-2">
                      {integration.envVars.map((envVar, i) => (
                        <div key={i} className="font-mono text-xs">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-cyan-400">{envVar.key}</code>
                            {envVar.required && (
                              <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs">{envVar.description}</p>
                          <code className="text-gray-500 text-xs">Example: {envVar.example}</code>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Files */}
                  <div className="space-y-2 mb-6">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-blue-400" />
                      Generated Files
                    </h4>
                    {integration.files.map((file, fileIdx) => (
                      <div key={fileIdx} className="border border-white/10 rounded-lg overflow-hidden bg-slate-900/50">
                        <button
                          onClick={() => setExpandedFile(expandedFile === `${idx}-${fileIdx}` ? null : `${idx}-${fileIdx}`)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 text-left">
                            <Code className="w-4 h-4 text-cyan-400" />
                            <div>
                              <div className="text-sm font-medium text-white">{file.path}</div>
                              <div className="text-xs text-gray-500">{file.description}</div>
                            </div>
                          </div>
                          <ChevronRight 
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedFile === `${idx}-${fileIdx}` ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {expandedFile === `${idx}-${fileIdx}` && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-white/10"
                            >
                              <div className="relative">
                                <pre className="p-4 overflow-x-auto text-xs text-gray-300 max-h-[400px] overflow-y-auto">
                                  {file.content}
                                </pre>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(file.content)}
                                  className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-800"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  {/* Usage Example */}
                  <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                    <h4 className="text-sm font-semibold text-green-400 mb-2">Usage Example</h4>
                    <pre className="text-xs text-gray-300 overflow-x-auto">
                      {integration.usage}
                    </pre>
                  </div>

                  {/* Setup Steps */}
                  {integration.setup && integration.setup.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-semibold text-white">Setup Steps</h4>
                      {integration.setup.map((step, i) => (
                        <div key={i} className="flex gap-2 text-sm text-gray-400">
                          <span className="text-blue-400 font-semibold">{i + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassmorphicCard>
              ))}

              {/* Common Patterns & Security */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.commonPatterns && result.commonPatterns.length > 0 && (
                  <GlassmorphicCard className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-400" />
                      Common Patterns
                    </h3>
                    <ul className="space-y-2">
                      {result.commonPatterns.map((pattern, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-blue-400 mt-0.5">•</span>
                          {pattern}
                        </li>
                      ))}
                    </ul>
                  </GlassmorphicCard>
                )}

                {result.securityNotes && result.securityNotes.length > 0 && (
                  <GlassmorphicCard className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Key className="w-5 h-5 text-yellow-400" />
                      Security Notes
                    </h3>
                    <ul className="space-y-2">
                      {result.securityNotes.map((note, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-yellow-400 mt-0.5">⚠</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </GlassmorphicCard>
                )}
              </div>
            </motion.div>
          ) : (
            <GlassmorphicCard className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <Link2 className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Ready to Integrate</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                Select the APIs you want to integrate and we'll generate production-ready code with authentication, error handling, and best practices
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  Complete SDK Setup
                </Badge>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                  Authentication
                </Badge>
                <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                  Error Handling
                </Badge>
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                  Type Safety
                </Badge>
              </div>
            </GlassmorphicCard>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}