import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { integrationAPI } from '@/components/core/APIClient';
import { GlassmorphicCard } from '@/components/ui-library/GlassmorphicCard';
import { Code, Download, Copy, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const PROJECT_TYPES = [
  { value: 'react-app', label: 'React Application', desc: 'Modern React with hooks' },
  { value: 'nextjs', label: 'Next.js Project', desc: 'SSR with API routes' },
  { value: 'express-api', label: 'Express API', desc: 'RESTful backend' },
  { value: 'react-component', label: 'React Component', desc: 'Reusable UI component' },
  { value: 'nodejs-script', label: 'Node.js Script', desc: 'Automation utility' },
  { value: 'python-script', label: 'Python Script', desc: 'Data processing' },
];

const CODE_STYLES = [
  { value: 'clean', label: 'Clean Code', desc: 'Readable, maintainable' },
  { value: 'performant', label: 'Performance-First', desc: 'Optimized algorithms' },
  { value: 'minimal', label: 'Minimal', desc: 'Concise, essential only' },
  { value: 'documented', label: 'Well-Documented', desc: 'Extensive comments' },
];

export function CodeGenerationPanel() {
  const [requirements, setRequirements] = useState('');
  const [projectType, setProjectType] = useState('react-app');
  const [codeStyle, setCodeStyle] = useState('clean');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!requirements.trim()) {
      toast.error('Please describe what you want to build');
      return;
    }

    setIsGenerating(true);
    try {
      const projectConfig = PROJECT_TYPES.find(p => p.value === projectType);
      const styleConfig = CODE_STYLES.find(s => s.value === codeStyle);

      const prompt = `Generate production-ready boilerplate code for: ${projectConfig.label}

Requirements: ${requirements}

Code Style: ${styleConfig.label} - ${styleConfig.desc}

Provide:
1. Complete file structure
2. All necessary files with full code
3. Dependencies list (package.json or requirements.txt)
4. Setup instructions
5. Best practices followed

Format as JSON with structure:
{
  "files": [
    {"path": "src/App.js", "content": "..."},
    {"path": "package.json", "content": "..."}
  ],
  "dependencies": ["react", "axios"],
  "setup": "Step-by-step setup instructions",
  "bestPractices": ["Use hooks", "Error boundaries"]
}`;

      const result = await integrationAPI.invoke('Core', 'InvokeLLM', {
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string' },
                  content: { type: 'string' }
                }
              }
            },
            dependencies: { type: 'array', items: { type: 'string' } },
            setup: { type: 'string' },
            bestPractices: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setGeneratedCode(result);
      toast.success('Code generated successfully!');
    } catch (error) {
      toast.error('Generation failed: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadProject = () => {
    if (!generatedCode) return;
    
    const zip = generatedCode.files.map(f => `
=== ${f.path} ===
${f.content}
`).join('\n\n');

    const blob = new Blob([zip], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectType}-boilerplate.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Project downloaded!');
  };

  return (
    <div className="space-y-6">
      <GlassmorphicCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Code className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Generate Boilerplate Code</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Project Type</label>
            <Select value={projectType} onValueChange={setProjectType}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                {PROJECT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value} className="text-white">
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-400">{type.desc}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Code Style</label>
            <div className="grid grid-cols-2 gap-3">
              {CODE_STYLES.map(style => (
                <button
                  key={style.value}
                  onClick={() => setCodeStyle(style.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    codeStyle === style.value
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="font-medium text-white text-sm">{style.label}</div>
                  <div className="text-xs text-gray-400">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Requirements</label>
            <Textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="E.g., Build a todo app with user authentication, dark mode, and local storage persistence..."
              className="bg-white/5 border-white/10 text-white min-h-[150px] placeholder:text-gray-500"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !requirements.trim()}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating Code...
              </>
            ) : (
              <>
                <Code className="w-4 h-4 mr-2" />
                Generate Boilerplate
              </>
            )}
          </Button>
        </div>
      </GlassmorphicCard>

      {generatedCode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassmorphicCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Generated Project</h3>
              <Button
                onClick={downloadProject}
                variant="outline"
                size="sm"
                className="border-white/20 text-gray-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
            </div>

            <div className="space-y-4">
              {/* File Structure */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-medium text-cyan-400 mb-3">File Structure</h4>
                <div className="space-y-1 font-mono text-sm text-gray-300">
                  {generatedCode.files.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Code className="w-3 h-3 text-gray-500" />
                      {file.path}
                    </div>
                  ))}
                </div>
              </div>

              {/* Files Preview */}
              {generatedCode.files.slice(0, 3).map((file, idx) => (
                <div key={idx} className="bg-slate-950/50 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                    <span className="text-sm font-medium text-white">{file.path}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(file.content);
                        toast.success('Copied to clipboard');
                      }}
                      className="h-6 w-6"
                    >
                      <Copy className="w-3 h-3 text-gray-400" />
                    </Button>
                  </div>
                  <pre className="p-4 overflow-x-auto text-xs text-gray-300 max-h-64">
                    {file.content}
                  </pre>
                </div>
              ))}

              {/* Best Practices */}
              {generatedCode.bestPractices && (
                <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Best Practices Included
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {generatedCode.bestPractices.map((practice, idx) => (
                      <li key={idx}>• {practice}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </GlassmorphicCard>
        </motion.div>
      )}
    </div>
  );
}