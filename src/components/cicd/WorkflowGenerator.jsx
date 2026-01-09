import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { FileCode, Download, Github, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function WorkflowGenerator({ config, onGenerate }) {
  const [repository, setRepository] = useState("");
  const [generating, setGenerating] = useState(false);
  const [workflow, setWorkflow] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateWorkflow = async (autoCommit = false) => {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateGitHubWorkflow', {
        config: { ...config, autoCommit },
        repository: repository || null
      });

      setWorkflow(response.workflow);
      
      if (response.committed) {
        toast.success('Workflow committed to repository!');
      } else {
        toast.success('Workflow generated successfully!');
      }
      
      if (onGenerate) onGenerate(response);
    } catch (error) {
      toast.error(`Failed to generate workflow: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(workflow);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadWorkflow = () => {
    const blob = new Blob([workflow], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deploy.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Workflow file downloaded!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
        backdropFilter: "blur(20px)"
      }}
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <FileCode className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Workflow Generator
            </h3>
            <p className="text-sm text-gray-400">Generate GitHub Actions workflow file</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <Label className="text-white mb-2 block">GitHub Repository (Optional)</Label>
          <div className="relative">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={repository}
              onChange={(e) => setRepository(e.target.value)}
              placeholder="owner/repository"
              className="bg-white/5 border-white/10 text-white pl-10"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Format: username/repo-name (e.g., johndoe/my-project)
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => generateWorkflow(false)}
            disabled={generating}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
          >
            <FileCode className="w-4 h-4 mr-2" />
            {generating ? 'Generating...' : 'Generate Workflow'}
          </Button>
          
          {repository && (
            <Button
              onClick={() => generateWorkflow(true)}
              disabled={generating || !repository}
              className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500"
            >
              <Github className="w-4 h-4 mr-2" />
              Generate & Commit
            </Button>
          )}
        </div>

        {workflow && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <Label className="text-white">Generated Workflow</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="border-white/10 text-gray-300"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadWorkflow}
                  className="border-white/10 text-gray-300"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-black/40 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                {workflow}
              </pre>
            </div>

            <p className="text-xs text-gray-400">
              💡 Save this file as <code className="px-1 py-0.5 bg-white/10 rounded">.github/workflows/deploy.yml</code> in your repository
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}