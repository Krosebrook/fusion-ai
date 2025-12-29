/**
 * Documentation Viewer - Display AI-generated workflow/component documentation
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { 
  BookOpen, 
  Loader2, 
  RefreshCw, 
  Download,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { documentationGeneratorService } from '../services/DocumentationGeneratorService';
import { toast } from 'sonner';

export function DocumentationViewer({ entity, entityType, onRegenerate }) {
  const [documentation, setDocumentation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadDocumentation();
  }, [entity]);

  const loadDocumentation = async () => {
    setLoading(true);
    try {
      // Check if documentation exists in metadata
      if (entity.metadata?.documentation) {
        setDocumentation(entity.metadata.documentation);
      } else {
        // Generate new documentation
        await handleRegenerate();
      }
    } catch (error) {
      console.error('Failed to load documentation', error);
      toast.error('Failed to load documentation');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const docs =
        entityType === 'workflow'
          ? await documentationGeneratorService.generateWorkflowDocumentation(entity)
          : await documentationGeneratorService.generateComponentDocumentation(entity);

      setDocumentation(docs);
      
      if (onRegenerate) {
        await onRegenerate(docs);
      }

      toast.success('✨ Documentation generated!');
    } catch (error) {
      console.error('Failed to generate documentation', error);
      toast.error('Failed to generate documentation');
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyMarkdown = () => {
    const markdown = documentationGeneratorService.formatAsMarkdown(documentation);
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const markdown = documentationGeneratorService.formatAsMarkdown(documentation);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entity.name || 'workflow'}-docs.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    toast.success('Documentation downloaded!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Documentation</h3>
        </div>
        <div className="flex gap-2">
          <CinematicButton
            variant="ghost"
            size="sm"
            icon={copied ? CheckCircle2 : Copy}
            onClick={handleCopyMarkdown}
          >
            {copied ? 'Copied!' : 'Copy'}
          </CinematicButton>
          <CinematicButton
            variant="ghost"
            size="sm"
            icon={Download}
            onClick={handleDownload}
          >
            Download
          </CinematicButton>
          <CinematicButton
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            {regenerating ? 'Generating...' : 'Regenerate'}
          </CinematicButton>
        </div>
      </div>

      {/* Documentation Content */}
      {documentation ? (
        <CinematicCard variant="glass" className="p-6">
          <div className="prose prose-invert prose-sm max-w-none">
            <h1 className="text-2xl font-bold text-white mb-2">{documentation.title}</h1>
            <p className="text-white/70 mb-6">{documentation.description}</p>

            <section className="mb-6">
              <h2 className="text-xl font-bold text-white mb-3">Purpose</h2>
              <p className="text-white/80">{documentation.purpose}</p>
            </section>

            {documentation.use_cases?.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xl font-bold text-white mb-3">Use Cases</h2>
                <ul className="list-disc list-inside space-y-2 text-white/80">
                  {documentation.use_cases.map((useCase, i) => (
                    <li key={i}>{useCase}</li>
                  ))}
                </ul>
              </section>
            )}

            {documentation.inputs?.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xl font-bold text-white mb-3">Input Parameters</h2>
                {documentation.inputs.map((input, i) => (
                  <div key={i} className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-cyan-400 font-mono text-sm">{input.name}</code>
                      <span className="text-white/40 text-xs">: {input.type}</span>
                      {input.required && <span className="text-red-400 text-xs">Required</span>}
                    </div>
                    <p className="text-white/70 text-sm">{input.description}</p>
                    {input.example && (
                      <pre className="mt-2 p-2 rounded bg-slate-950/50 text-xs text-white/60 overflow-auto">
                        {JSON.stringify(input.example, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </section>
            )}

            {documentation.outputs?.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xl font-bold text-white mb-3">Output Values</h2>
                {documentation.outputs.map((output, i) => (
                  <div key={i} className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-purple-400 font-mono text-sm">{output.name}</code>
                      <span className="text-white/40 text-xs">: {output.type}</span>
                    </div>
                    <p className="text-white/70 text-sm">{output.description}</p>
                  </div>
                ))}
              </section>
            )}

            {documentation.logic_flow?.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xl font-bold text-white mb-3">Logic Flow</h2>
                <div className="space-y-3">
                  {documentation.logic_flow.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold mb-1">{step.action}</div>
                        <div className="text-white/60 text-sm">Node: <code className="text-cyan-400">{step.node}</code></div>
                        <p className="text-white/70 text-sm mt-1">{step.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {documentation.performance && (
              <section className="mb-6">
                <h2 className="text-xl font-bold text-white mb-3">Performance</h2>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-white/80 mb-2">
                    <strong>Avg Duration:</strong> {documentation.performance.avg_duration}
                  </div>
                  {documentation.performance.optimization_tips?.length > 0 && (
                    <div className="mt-3">
                      <div className="text-white/60 text-sm mb-2">💡 Optimization Tips:</div>
                      <ul className="list-disc list-inside space-y-1 text-white/70 text-sm">
                        {documentation.performance.optimization_tips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            <div className="text-white/40 text-xs mt-8 pt-4 border-t border-white/10">
              Generated: {new Date(documentation.generated_at).toLocaleString()} • Version: {documentation.version}
            </div>
          </div>
        </CinematicCard>
      ) : (
        <CinematicCard variant="glass" className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">No documentation available</p>
          <CinematicButton
            variant="primary"
            icon={Sparkles}
            onClick={handleRegenerate}
            disabled={regenerating}
            className="mt-4"
          >
            Generate Documentation
          </CinematicButton>
        </CinematicCard>
      )}
    </div>
  );
}

export default DocumentationViewer;