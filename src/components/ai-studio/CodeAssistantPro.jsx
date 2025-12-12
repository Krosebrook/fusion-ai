/**
 * Code Assistant Pro
 * Comprehensive code generation and assistance
 */

import React, { useState } from 'react';
import { aiService } from '../services/AIService';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { CinematicInput } from '../atoms/CinematicInput';
import { CinematicBadge } from '../atoms/CinematicBadge';
import { Code, FileCode, Bug, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { exportService } from '../services/ExportService';

export function CodeAssistantPro() {
  const [mode, setMode] = useState('generate');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Generate State
  const [generateData, setGenerateData] = useState({
    description: '',
    language: 'javascript',
    framework: 'react',
    style: 'modern',
  });

  // Review State
  const [reviewData, setReviewData] = useState({
    code: '',
    focusAreas: 'security, performance',
  });

  // Debug State
  const [debugData, setDebugData] = useState({
    errorLog: '',
    code: '',
  });

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await aiService.generateCode({
        description: generateData.description,
        language: generateData.language,
        style: generateData.style,
        framework: generateData.framework,
      });
      setResult(res);
      toast.success('Code generated');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    try {
      setLoading(true);
      const res = await aiService.reviewCode({
        code: reviewData.code,
        focusAreas: reviewData.focusAreas.split(',').map(a => a.trim()),
      });
      setResult(res);
      toast.success('Review complete');
    } catch (error) {
      toast.error('Review failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDebug = async () => {
    try {
      setLoading(true);
      const res = await aiService.analyzeError({
        errorLog: debugData.errorLog,
        context: debugData.code,
      });
      setResult(res);
      toast.success('Analysis complete');
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <CinematicCard>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Code Assistant</h2>

          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="bg-white/5 border border-white/10 mb-6">
              <TabsTrigger value="generate">
                <Code className="w-4 h-4 mr-2" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="review">
                <FileCode className="w-4 h-4 mr-2" />
                Review
              </TabsTrigger>
              <TabsTrigger value="debug">
                <Bug className="w-4 h-4 mr-2" />
                Debug
              </TabsTrigger>
            </TabsList>

            {/* Generate */}
            <TabsContent value="generate" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <Textarea
                  placeholder="Create a user authentication component with email/password..."
                  value={generateData.description}
                  onChange={(e) => setGenerateData({ ...generateData, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
                  <Select value={generateData.language} onValueChange={(v) => setGenerateData({ ...generateData, language: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="go">Go</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Framework</label>
                  <Select value={generateData.framework} onValueChange={(v) => setGenerateData({ ...generateData, framework: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="vue">Vue</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                      <SelectItem value="fastapi">FastAPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CinematicButton variant="primary" onClick={handleGenerate} loading={loading} glow className="w-full">
                Generate Code
              </CinematicButton>
            </TabsContent>

            {/* Review */}
            <TabsContent value="review" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Code to Review</label>
                <Textarea
                  placeholder="Paste your code here..."
                  value={reviewData.code}
                  onChange={(e) => setReviewData({ ...reviewData, code: e.target.value })}
                  className="bg-white/5 border-white/10 text-white font-mono text-sm"
                  rows={10}
                />
              </div>
              <CinematicInput
                label="Focus Areas"
                placeholder="security, performance, quality"
                value={reviewData.focusAreas}
                onChange={(e) => setReviewData({ ...reviewData, focusAreas: e.target.value })}
              />
              <CinematicButton variant="primary" onClick={handleReview} loading={loading} glow className="w-full">
                Review Code
              </CinematicButton>
            </TabsContent>

            {/* Debug */}
            <TabsContent value="debug" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Error Log</label>
                <Textarea
                  placeholder="Paste error message..."
                  value={debugData.errorLog}
                  onChange={(e) => setDebugData({ ...debugData, errorLog: e.target.value })}
                  className="bg-white/5 border-white/10 text-white font-mono text-sm"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Context (Optional)</label>
                <Textarea
                  placeholder="Related code..."
                  value={debugData.code}
                  onChange={(e) => setDebugData({ ...debugData, code: e.target.value })}
                  className="bg-white/5 border-white/10 text-white font-mono text-sm"
                  rows={6}
                />
              </div>
              <CinematicButton variant="primary" onClick={handleDebug} loading={loading} glow className="w-full">
                Analyze Error
              </CinematicButton>
            </TabsContent>
          </Tabs>
        </div>
      </CinematicCard>

      {/* Output Panel */}
      <div>
        {result ? (
          <div className="space-y-4">
            {result.files && result.files.map((file, i) => (
              <CinematicCard key={i}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CinematicBadge variant="primary">{file.path}</CinematicBadge>
                    <CinematicButton variant="ghost" size="sm" onClick={() => exportService.copyToClipboard(file.content)}>
                      Copy
                    </CinematicButton>
                  </div>
                  <pre className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                    <code className="text-slate-300 text-sm font-mono">{file.content}</code>
                  </pre>
                </div>
              </CinematicCard>
            ))}
            {result.score && (
              <CinematicCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Code Quality Score</h3>
                    <span className="text-3xl font-bold text-white">{result.score}/100</span>
                  </div>
                  {result.issues && result.issues.map((issue, i) => (
                    <div key={i} className="mb-3 p-3 bg-white/5 rounded-lg">
                      <CinematicBadge variant="warning" size="sm" className="mb-2">{issue.severity}</CinematicBadge>
                      <p className="text-white font-medium mb-1">{issue.type}</p>
                      <p className="text-slate-400 text-sm">{issue.description}</p>
                    </div>
                  ))}
                </div>
              </CinematicCard>
            )}
            {result.rootCause && (
              <CinematicCard>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Debug Analysis</h3>
                  <div className="space-y-3">
                    <div>
                      <CinematicBadge variant="error" size="sm" className="mb-2">Error Type</CinematicBadge>
                      <p className="text-white">{result.errorType}</p>
                    </div>
                    <div>
                      <CinematicBadge variant="info" size="sm" className="mb-2">Root Cause</CinematicBadge>
                      <p className="text-slate-300">{result.rootCause}</p>
                    </div>
                    {result.fixes && result.fixes.map((fix, i) => (
                      <div key={i} className="p-3 bg-white/5 rounded-lg">
                        <p className="text-white font-medium mb-2">{fix.title}</p>
                        <pre className="bg-slate-900 rounded p-2 overflow-x-auto">
                          <code className="text-slate-300 text-xs font-mono">{fix.code}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              </CinematicCard>
            )}
          </div>
        ) : (
          <CinematicCard className="p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400">Results will appear here</p>
          </CinematicCard>
        )}
      </div>
    </div>
  );
}

export default CodeAssistantPro;