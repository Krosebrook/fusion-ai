/**
 * Claude Code Integration - AI-powered development assistant
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '../atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, Sparkles, RefreshCw, Eye, Zap,
  CheckCircle, Copy
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export function ClaudeCodeIntegration() {
  const [loading, setLoading] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');

  const executeAction = async (action, payload) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('claudeCode', {
        action,
        payload
      });

      const resultText = response.code || response.review || response.refactored_code || response.explanation || '';
      setResult(resultText);
      toast.success('Complete');
    } catch (error) {
      toast.error(error.message || 'Failed');
      setResult('');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-2xl">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Claude Code Assistant</h2>
          <p className="text-white/60 text-sm">AI-powered development workflows</p>
        </div>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="bg-slate-900/50 border border-white/10 grid grid-cols-4 gap-1">
          <TabsTrigger value="generate"><Code className="w-4 h-4 mr-2" />Generate</TabsTrigger>
          <TabsTrigger value="review"><Eye className="w-4 h-4 mr-2" />Review</TabsTrigger>
          <TabsTrigger value="refactor"><RefreshCw className="w-4 h-4 mr-2" />Refactor</TabsTrigger>
          <TabsTrigger value="explain"><Zap className="w-4 h-4 mr-2" />Explain</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CinematicCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Input</h3>
              <Textarea
                placeholder="Describe what you want to build..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-white/5 border-white/10 text-white min-h-[300px] font-mono text-sm"
              />
              <Button
                onClick={() => executeAction('generate_code', { prompt, language: 'JavaScript' })}
                disabled={loading || !prompt}
                className="w-full mt-4 bg-gradient-to-r from-orange-600 to-pink-600"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Code className="w-4 h-4 mr-2" />}
                Generate Code
              </Button>
            </CinematicCard>

            <CinematicCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Output</h3>
                {result && (
                  <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="bg-slate-950 rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-auto">
                {result ? (
                  <ReactMarkdown className="text-white/90 text-sm prose prose-invert max-w-none">
                    {result}
                  </ReactMarkdown>
                ) : (
                  <p className="text-white/40 text-sm">Generated code will appear here...</p>
                )}
              </div>
            </CinematicCard>
          </div>
        </TabsContent>

        <TabsContent value="review" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CinematicCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Code to Review</h3>
              <Textarea
                placeholder="Paste your code here..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="bg-white/5 border-white/10 text-white min-h-[300px] font-mono text-sm"
              />
              <Button
                onClick={() => executeAction('review_code', { code: inputCode })}
                disabled={loading || !inputCode}
                className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                Review Code
              </Button>
            </CinematicCard>

            <CinematicCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Review Results</h3>
              <div className="bg-slate-950 rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-auto">
                {result ? (
                  <ReactMarkdown className="text-white/90 text-sm prose prose-invert max-w-none">
                    {result}
                  </ReactMarkdown>
                ) : (
                  <p className="text-white/40 text-sm">Review will appear here...</p>
                )}
              </div>
            </CinematicCard>
          </div>
        </TabsContent>

        <TabsContent value="refactor" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CinematicCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Original Code</h3>
              <Textarea
                placeholder="Paste code to refactor..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="bg-white/5 border-white/10 text-white min-h-[300px] font-mono text-sm"
              />
              <Button
                onClick={() => executeAction('refactor', { code: inputCode })}
                disabled={loading || !inputCode}
                className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Refactor
              </Button>
            </CinematicCard>

            <CinematicCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Refactored Code</h3>
              <div className="bg-slate-950 rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-auto">
                {result ? (
                  <ReactMarkdown className="text-white/90 text-sm prose prose-invert max-w-none">
                    {result}
                  </ReactMarkdown>
                ) : (
                  <p className="text-white/40 text-sm">Refactored code will appear here...</p>
                )}
              </div>
            </CinematicCard>
          </div>
        </TabsContent>

        <TabsContent value="explain" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CinematicCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Code to Explain</h3>
              <Textarea
                placeholder="Paste code to understand..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="bg-white/5 border-white/10 text-white min-h-[300px] font-mono text-sm"
              />
              <Button
                onClick={() => executeAction('explain', { code: inputCode })}
                disabled={loading || !inputCode}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                Explain
              </Button>
            </CinematicCard>

            <CinematicCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Explanation</h3>
              <div className="bg-slate-950 rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-auto">
                {result ? (
                  <ReactMarkdown className="text-white/90 text-sm prose prose-invert max-w-none">
                    {result}
                  </ReactMarkdown>
                ) : (
                  <p className="text-white/40 text-sm">Explanation will appear here...</p>
                )}
              </div>
            </CinematicCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}