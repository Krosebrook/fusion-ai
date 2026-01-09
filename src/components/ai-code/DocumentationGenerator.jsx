import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui-library';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, BookOpen, Copy, FileText, Code } from 'lucide-react';

export function DocumentationGenerator() {
  const [code, setCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [options, setOptions] = useState({
    readme: true,
    jsdoc: true,
    apiDocs: false
  });
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState(null);

  const generateDocs = async () => {
    if (!code.trim()) {
      toast.error('Please provide code to document');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a technical documentation expert. Generate comprehensive, professional documentation for the following code:

PROJECT NAME: ${projectName || 'Untitled Project'}

CODE:
${code}

Generate the following documentation types:
${options.readme ? '- README.md with setup, usage, and examples' : ''}
${options.jsdoc ? '- JSDoc comments for all functions/classes' : ''}
${options.apiDocs ? '- API documentation in OpenAPI/Swagger format' : ''}

Documentation should include:
- Clear, concise descriptions
- Usage examples with actual code
- Parameter descriptions and types
- Return value documentation
- Error handling notes
- Dependencies and requirements
- Setup/installation instructions
- Best practices and tips

Return as JSON:
{
  ${options.readme ? '"readme": "complete README.md content in markdown",' : ''}
  ${options.jsdoc ? '"annotatedCode": "original code with JSDoc comments added",' : ''}
  ${options.apiDocs ? '"apiDocs": "OpenAPI/Swagger YAML or JSON",' : ''}
  "quickStart": "brief getting started guide",
  "keyFeatures": ["feature 1", "feature 2"]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            ...(options.readme && { readme: { type: "string" } }),
            ...(options.jsdoc && { annotatedCode: { type: "string" } }),
            ...(options.apiDocs && { apiDocs: { type: "string" } }),
            quickStart: { type: "string" },
            keyFeatures: { type: "array", items: { type: "string" } }
          }
        }
      });

      setDocs(response);
      toast.success('Documentation generated!');
    } catch (error) {
      toast.error('Failed to generate docs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const downloadDocs = () => {
    if (!docs) return;

    const content = `
${docs.readme || ''}

${docs.annotatedCode ? '\n\n=== ANNOTATED CODE ===\n\n' + docs.annotatedCode : ''}

${docs.apiDocs ? '\n\n=== API DOCUMENTATION ===\n\n' + docs.apiDocs : ''}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName || 'project'}-docs.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Input Panel */}
      <div className="xl:col-span-2 space-y-6">
        <GlassmorphicCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Documentation Generator</h2>
              <p className="text-sm text-gray-400">Auto-generate professional docs</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-white mb-2 block">Project Name (Optional)</Label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="my-awesome-project"
                className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:outline-none"
              />
            </div>

            <div>
              <Label className="text-white mb-3 block">Documentation Types</Label>
              <div className="space-y-3">
                <div
                  className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => setOptions({...options, readme: !options.readme})}
                >
                  <Checkbox
                    checked={options.readme}
                    onCheckedChange={(checked) => setOptions({...options, readme: checked})}
                    className="border-white/20"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">README.md</div>
                    <div className="text-xs text-gray-400">Project overview, setup, usage</div>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => setOptions({...options, jsdoc: !options.jsdoc})}
                >
                  <Checkbox
                    checked={options.jsdoc}
                    onCheckedChange={(checked) => setOptions({...options, jsdoc: checked})}
                    className="border-white/20"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">JSDoc Comments</div>
                    <div className="text-xs text-gray-400">Inline function documentation</div>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => setOptions({...options, apiDocs: !options.apiDocs})}
                >
                  <Checkbox
                    checked={options.apiDocs}
                    onCheckedChange={(checked) => setOptions({...options, apiDocs: checked})}
                    className="border-white/20"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">API Documentation</div>
                    <div className="text-xs text-gray-400">OpenAPI/Swagger format</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-white mb-2 block">Code to Document</Label>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                className="min-h-[300px] font-mono text-sm bg-slate-900/50 border-white/10 text-white"
              />
            </div>

            <Button
              onClick={generateDocs}
              disabled={loading || !code.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Docs...
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5 mr-2" />
                  Generate Documentation
                </>
              )}
            </Button>
          </div>
        </GlassmorphicCard>
      </div>

      {/* Results Panel */}
      <div className="xl:col-span-3 space-y-6">
        <AnimatePresence mode="wait">
          {docs ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <GlassmorphicCard className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Generated Documentation</h3>
                  <Button onClick={downloadDocs} className="bg-green-500 hover:bg-green-600">
                    <FileText className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </GlassmorphicCard>

              <Tabs defaultValue="readme" className="w-full">
                <TabsList className="bg-white/5 border border-white/10">
                  {docs.readme && (
                    <TabsTrigger value="readme" className="data-[state=active]:bg-blue-500/20">
                      <FileText className="w-4 h-4 mr-2" />
                      README
                    </TabsTrigger>
                  )}
                  {docs.annotatedCode && (
                    <TabsTrigger value="jsdoc" className="data-[state=active]:bg-green-500/20">
                      <Code className="w-4 h-4 mr-2" />
                      JSDoc
                    </TabsTrigger>
                  )}
                  {docs.apiDocs && (
                    <TabsTrigger value="api" className="data-[state=active]:bg-purple-500/20">
                      <BookOpen className="w-4 h-4 mr-2" />
                      API Docs
                    </TabsTrigger>
                  )}
                </TabsList>

                {docs.readme && (
                  <TabsContent value="readme" className="mt-4">
                    <GlassmorphicCard className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">README.md</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(docs.readme)}
                          className="border-white/10"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto border border-white/10 text-sm text-gray-300 whitespace-pre-wrap">
                        {docs.readme}
                      </pre>
                    </GlassmorphicCard>
                  </TabsContent>
                )}

                {docs.annotatedCode && (
                  <TabsContent value="jsdoc" className="mt-4">
                    <GlassmorphicCard className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">Annotated Code</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(docs.annotatedCode)}
                          className="border-white/10"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto border border-white/10 text-sm text-gray-300 font-mono">
                        {docs.annotatedCode}
                      </pre>
                    </GlassmorphicCard>
                  </TabsContent>
                )}

                {docs.apiDocs && (
                  <TabsContent value="api" className="mt-4">
                    <GlassmorphicCard className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">API Documentation</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(docs.apiDocs)}
                          className="border-white/10"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto border border-white/10 text-sm text-gray-300">
                        {docs.apiDocs}
                      </pre>
                    </GlassmorphicCard>
                  </TabsContent>
                )}
              </Tabs>

              {docs.keyFeatures && docs.keyFeatures.length > 0 && (
                <GlassmorphicCard className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Key Features Documented</h3>
                  <ul className="space-y-2">
                    {docs.keyFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-blue-400 mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </GlassmorphicCard>
              )}
            </motion.div>
          ) : (
            <GlassmorphicCard className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Ready to Document</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Paste your code and automatically generate README files, JSDoc comments, and API documentation
              </p>
            </GlassmorphicCard>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}