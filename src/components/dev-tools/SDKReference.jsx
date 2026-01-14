/**
 * SDK Reference - Export API docs for Claude Code
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '../atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { 
  Download, Copy, Code, FileJson,
  Sparkles, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

export function SDKReference() {
  const [apiDoc, setApiDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateDoc = async () => {
    setLoading(true);
    try {
      const result = await base44.functions.invoke('generateAPIDoc', {});
      setApiDoc(result);
      toast.success('API documentation generated');
    } catch (error) {
      toast.error('Failed to generate documentation');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const downloadMarkdown = () => {
    if (!apiDoc?.markdown) return;
    const blob = new Blob([apiDoc.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashfusion-api-docs.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Documentation downloaded');
  };

  const downloadJSON = () => {
    if (!apiDoc?.documentation) return;
    const blob = new Blob([JSON.stringify(apiDoc.documentation, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashfusion-api-schema.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Schema downloaded');
  };

  return (
    <div className="space-y-6">
      <CinematicCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">SDK Reference Generator</h2>
            <p className="text-white/60">Export your app's API documentation for Claude Code CLI</p>
          </div>
          <Button
            onClick={generateDoc}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {loading ? <Sparkles className="w-4 h-4 mr-2 animate-spin" /> : <Code className="w-4 h-4 mr-2" />}
            Generate Docs
          </Button>
        </div>

        {!apiDoc && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 mb-4">Click "Generate Docs" to create API reference</p>
            <p className="text-white/40 text-sm">This will export all entities, functions, and integrations</p>
          </div>
        )}

        {apiDoc && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Quick Actions */}
            <div className="flex gap-3">
              <Button onClick={downloadMarkdown} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download Markdown
              </Button>
              <Button onClick={downloadJSON} variant="outline" className="flex-1">
                <FileJson className="w-4 h-4 mr-2" />
                Download JSON
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white/60 text-xs mb-1">Entities</p>
                <p className="text-2xl font-bold text-white">
                  {Object.keys(apiDoc.documentation.entities).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white/60 text-xs mb-1">Functions</p>
                <p className="text-2xl font-bold text-white">
                  {Object.keys(apiDoc.documentation.functions).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white/60 text-xs mb-1">Integrations</p>
                <p className="text-2xl font-bold text-white">
                  {apiDoc.documentation.integrations.core.length}
                </p>
              </div>
            </div>

            {/* Claude Code Instructions */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-orange-400" />
                <h3 className="text-white font-bold">Claude Code CLI Setup</h3>
              </div>
              
              <ol className="space-y-2 text-sm text-white/80">
                <li>1. Download the JSON schema file above</li>
                <li>2. In Claude Code CLI, run: <code className="px-2 py-1 bg-black/40 rounded text-orange-300">claude code context add flashfusion-api-schema.json</code></li>
                <li>3. Start coding: <code className="px-2 py-1 bg-black/40 rounded text-orange-300">claude code "create a new pipeline using FlashFusion API"</code></li>
              </ol>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg bg-black/40 border border-white/10 max-h-96 overflow-auto">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/60 text-sm font-mono">Markdown Preview</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(apiDoc.markdown, 'Markdown')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <pre className="text-white/80 text-xs font-mono whitespace-pre-wrap">
                {apiDoc.markdown.slice(0, 2000)}...
              </pre>
            </div>
          </motion.div>
        )}
      </CinematicCard>

      {/* Integration Example */}
      <CinematicCard className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Integration Example</h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-white/60 text-sm mb-2">JavaScript SDK</p>
            <div className="p-4 rounded-lg bg-black/40 border border-white/10 relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(`import { createClient } from '@base44/sdk';\n\nconst base44 = createClient({\n  apiKey: process.env.BASE44_API_KEY\n});\n\nconst pipelines = await base44.entities.PipelineConfig.list();`, 'Code')}
                className="absolute top-2 right-2"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <pre className="text-sm text-white/80 font-mono">
{`import { createClient } from '@base44/sdk';

const base44 = createClient({
  apiKey: process.env.BASE44_API_KEY
});

const pipelines = await base44.entities.PipelineConfig.list();`}
              </pre>
            </div>
          </div>

          <div>
            <p className="text-white/60 text-sm mb-2">cURL Example</p>
            <div className="p-4 rounded-lg bg-black/40 border border-white/10 relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(`curl -X POST https://your-app.base44.app/api/functions/claudeCode \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"action": "generate_code", "payload": {"prompt": "Create a user authentication flow"}}'`, 'cURL')}
                className="absolute top-2 right-2"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <pre className="text-sm text-white/80 font-mono whitespace-pre-wrap">
{`curl -X POST https://your-app.base44.app/api/functions/claudeCode \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"action": "generate_code", "payload": {"prompt": "Create a user authentication flow"}}'`}
              </pre>
            </div>
          </div>
        </div>
      </CinematicCard>
    </div>
  );
}