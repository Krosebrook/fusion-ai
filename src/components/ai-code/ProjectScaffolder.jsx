import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui-library';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  Loader2, FolderTree, Download, FileCode, Package, 
  Settings, CheckCircle, Sparkles, Copy, ChevronRight
} from 'lucide-react';

const PROJECT_TYPES = [
  { 
    id: 'react-spa', 
    label: 'React SPA', 
    desc: 'Single Page Application with React Router',
    color: '#61DAFB',
    icon: '⚛️'
  },
  { 
    id: 'nextjs-ssr', 
    label: 'Next.js SSR', 
    desc: 'Server-Side Rendered with API Routes',
    color: '#000000',
    icon: '▲'
  },
  { 
    id: 'express-api', 
    label: 'Express API', 
    desc: 'RESTful Backend with Node.js',
    color: '#68A063',
    icon: '🚂'
  },
  { 
    id: 'fastapi', 
    label: 'FastAPI', 
    desc: 'Modern Python API with async support',
    color: '#009688',
    icon: '⚡'
  },
  { 
    id: 'fullstack', 
    label: 'Full-Stack', 
    desc: 'React + Express monorepo',
    color: '#8B5CF6',
    icon: '🎯'
  }
];

const FEATURES = [
  { id: 'auth', label: 'Authentication', desc: 'JWT + OAuth2', category: 'core' },
  { id: 'database', label: 'Database', desc: 'PostgreSQL + Prisma', category: 'core' },
  { id: 'state', label: 'State Management', desc: 'Redux Toolkit / Zustand', category: 'frontend' },
  { id: 'styling', label: 'Styling System', desc: 'Tailwind + shadcn/ui', category: 'frontend' },
  { id: 'testing', label: 'Testing Suite', desc: 'Vitest + React Testing Library', category: 'quality' },
  { id: 'ci-cd', label: 'CI/CD Pipeline', desc: 'GitHub Actions', category: 'devops' },
  { id: 'docker', label: 'Docker Setup', desc: 'Multi-stage builds', category: 'devops' },
  { id: 'api-docs', label: 'API Documentation', desc: 'Swagger/OpenAPI', category: 'docs' },
  { id: 'logging', label: 'Logging', desc: 'Winston/Pino', category: 'monitoring' },
  { id: 'caching', label: 'Caching Layer', desc: 'Redis integration', category: 'performance' }
];

export function ProjectScaffolder() {
  const [selectedType, setSelectedType] = useState('react-spa');
  const [selectedFeatures, setSelectedFeatures] = useState(['auth', 'database', 'styling']);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [scaffoldResult, setScaffoldResult] = useState(null);
  const [expandedFile, setExpandedFile] = useState(null);

  const toggleFeature = (featureId) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const generateScaffold = async () => {
    if (!projectName.trim()) {
      toast.error('Please provide a project name');
      return;
    }

    setLoading(true);
    try {
      const selectedProjectType = PROJECT_TYPES.find(p => p.id === selectedType);
      const selectedFeaturesList = FEATURES.filter(f => selectedFeatures.includes(f.id));

      const prompt = `Generate a complete, production-ready project scaffold for: ${selectedProjectType.label}

PROJECT DETAILS:
- Name: ${projectName}
- Description: ${description || 'No description provided'}
- Features: ${selectedFeaturesList.map(f => f.label).join(', ')}

REQUIREMENTS:
1. Complete file/folder structure with all necessary files
2. Full boilerplate code for each file (no placeholders)
3. package.json with exact dependencies and versions
4. Environment variables template (.env.example)
5. Detailed setup instructions (README.md)
6. Best practice configurations (ESLint, Prettier, TypeScript if applicable)
7. Docker setup if selected
8. CI/CD pipeline configuration if selected
9. Testing setup if selected

Generate a comprehensive scaffold with:
- Proper project architecture (MVC, layers, modules)
- Security best practices (CORS, helmet, rate limiting)
- Error handling and logging
- API documentation structure
- Database schemas and migrations
- Authentication flows if selected

Return as JSON with this structure:
{
  "projectStructure": {
    "folders": ["src/", "src/components/", "src/utils/", ...],
    "files": [
      {
        "path": "relative/path/to/file.js",
        "content": "complete file content",
        "description": "brief description"
      }
    ]
  },
  "dependencies": {
    "production": {"package": "version"},
    "development": {"package": "version"}
  },
  "envVariables": [
    {"key": "DATABASE_URL", "description": "PostgreSQL connection string", "example": "postgresql://..."}
  ],
  "setupInstructions": [
    {"step": 1, "title": "Install dependencies", "command": "npm install", "description": "..."}
  ],
  "configFiles": [
    {"name": ".eslintrc.json", "content": "..."},
    {"name": "tsconfig.json", "content": "..."}
  ],
  "architecture": {
    "pattern": "MVC|Modular|Layered",
    "description": "architecture explanation"
  },
  "bestPractices": ["practice 1", "practice 2", ...],
  "nextSteps": ["suggestion 1", "suggestion 2", ...]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            projectStructure: {
              type: "object",
              properties: {
                folders: { type: "array", items: { type: "string" } },
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
                }
              }
            },
            dependencies: {
              type: "object",
              properties: {
                production: { type: "object" },
                development: { type: "object" }
              }
            },
            envVariables: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: { type: "string" },
                  description: { type: "string" },
                  example: { type: "string" }
                }
              }
            },
            setupInstructions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step: { type: "number" },
                  title: { type: "string" },
                  command: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            configFiles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  content: { type: "string" }
                }
              }
            },
            architecture: {
              type: "object",
              properties: {
                pattern: { type: "string" },
                description: { type: "string" }
              }
            },
            bestPractices: { type: "array", items: { type: "string" } },
            nextSteps: { type: "array", items: { type: "string" } }
          }
        }
      });

      setScaffoldResult(response);
      toast.success('Project scaffold generated!');
    } catch (error) {
      toast.error('Failed to generate scaffold: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadProject = () => {
    if (!scaffoldResult) return;

    const allFiles = [
      ...scaffoldResult.projectStructure.files,
      ...scaffoldResult.configFiles.map(f => ({ path: f.name, content: f.content }))
    ];

    const projectZip = allFiles.map(f => `
${'='.repeat(60)}
FILE: ${f.path}
${'='.repeat(60)}

${f.content}

`).join('\n');

    const blob = new Blob([projectZip], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}-scaffold.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Project downloaded!');
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Configuration Panel */}
      <div className="xl:col-span-2 space-y-6">
        <GlassmorphicCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <FolderTree className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Project Scaffolder</h2>
              <p className="text-sm text-gray-400">Production-ready in minutes</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Project Info */}
            <div className="space-y-4">
              <div>
                <Label className="text-white mb-2 block">Project Name</Label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="my-awesome-app"
                  className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:outline-none"
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">Description (Optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief project description..."
                  className="bg-slate-900/50 border-white/10 text-white min-h-[80px]"
                />
              </div>
            </div>

            {/* Project Type */}
            <div>
              <Label className="text-white mb-3 block">Project Type</Label>
              <div className="grid grid-cols-1 gap-3">
                {PROJECT_TYPES.map(type => (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedType === type.id
                        ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{type.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{type.label}</div>
                        <div className="text-xs text-gray-400">{type.desc}</div>
                      </div>
                      {selectedType === type.id && (
                        <CheckCircle className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <Label className="text-white mb-3 block">Features & Integrations</Label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {FEATURES.map(feature => (
                  <motion.div
                    key={feature.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => toggleFeature(feature.id)}
                  >
                    <Checkbox
                      checked={selectedFeatures.includes(feature.id)}
                      onCheckedChange={() => toggleFeature(feature.id)}
                      className="border-white/20"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{feature.label}</div>
                      <div className="text-xs text-gray-400">{feature.desc}</div>
                    </div>
                    <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                      {feature.category}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>

            <Button
              onClick={generateScaffold}
              disabled={loading || !projectName.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Scaffold...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Project
                </>
              )}
            </Button>
          </div>
        </GlassmorphicCard>
      </div>

      {/* Results Panel */}
      <div className="xl:col-span-3 space-y-6">
        <AnimatePresence mode="wait">
          {scaffoldResult ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header Actions */}
              <GlassmorphicCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{projectName}</h3>
                    <p className="text-sm text-gray-400">{scaffoldResult.architecture?.pattern} Architecture</p>
                  </div>
                  <Button onClick={downloadProject} className="bg-green-500 hover:bg-green-600">
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </GlassmorphicCard>

              {/* File Structure */}
              <GlassmorphicCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-purple-400" />
                  Project Structure
                </h3>
                <div className="space-y-1 font-mono text-sm">
                  {scaffoldResult.projectStructure.folders?.map((folder, idx) => (
                    <div key={idx} className="text-blue-400 flex items-center gap-2">
                      <span className="text-gray-500">📁</span>
                      {folder}
                    </div>
                  ))}
                </div>
              </GlassmorphicCard>

              {/* Files Preview */}
              <GlassmorphicCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-cyan-400" />
                  Generated Files ({scaffoldResult.projectStructure.files?.length || 0})
                </h3>
                <div className="space-y-2">
                  {scaffoldResult.projectStructure.files?.map((file, idx) => (
                    <div key={idx} className="border border-white/10 rounded-lg overflow-hidden bg-slate-900/50">
                      <button
                        onClick={() => setExpandedFile(expandedFile === idx ? null : idx)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 text-left">
                          <FileCode className="w-4 h-4 text-cyan-400" />
                          <div>
                            <div className="text-sm font-medium text-white">{file.path}</div>
                            <div className="text-xs text-gray-500">{file.description}</div>
                          </div>
                        </div>
                        <ChevronRight 
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            expandedFile === idx ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {expandedFile === idx && (
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
              </GlassmorphicCard>

              {/* Dependencies */}
              <GlassmorphicCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-400" />
                  Dependencies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-green-400 mb-2">Production</h4>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      {Object.entries(scaffoldResult.dependencies?.production || {}).map(([pkg, ver]) => (
                        <div key={pkg} className="flex justify-between">
                          <span>{pkg}</span>
                          <span className="text-gray-500">{ver}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-400 mb-2">Development</h4>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      {Object.entries(scaffoldResult.dependencies?.development || {}).map(([pkg, ver]) => (
                        <div key={pkg} className="flex justify-between">
                          <span>{pkg}</span>
                          <span className="text-gray-500">{ver}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassmorphicCard>

              {/* Setup Instructions */}
              <GlassmorphicCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-400" />
                  Setup Instructions
                </h3>
                <div className="space-y-3">
                  {scaffoldResult.setupInstructions?.map((step) => (
                    <div key={step.step} className="flex gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{step.title}</h4>
                        {step.command && (
                          <code className="block bg-slate-900 px-3 py-2 rounded text-xs text-cyan-400 mb-2">
                            {step.command}
                          </code>
                        )}
                        <p className="text-sm text-gray-400">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassmorphicCard>

              {/* Best Practices */}
              <GlassmorphicCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Best Practices Included
                </h3>
                <ul className="space-y-2">
                  {scaffoldResult.bestPractices?.map((practice, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-green-400 mt-0.5">✓</span>
                      {practice}
                    </li>
                  ))}
                </ul>
              </GlassmorphicCard>
            </motion.div>
          ) : (
            <GlassmorphicCard className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <FolderTree className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Ready to Build</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                Configure your project parameters and generate a complete, production-ready scaffold with best practices built in
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                  Complete File Structure
                </Badge>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  Dependencies Configured
                </Badge>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                  Setup Instructions
                </Badge>
                <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                  Best Practices
                </Badge>
              </div>
            </GlassmorphicCard>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}