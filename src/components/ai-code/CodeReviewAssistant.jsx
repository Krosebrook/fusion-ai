import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui-library';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, Shield, AlertTriangle, Zap, CheckCircle, Copy } from 'lucide-react';

export function CodeReviewAssistant() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);

  const analyzeCode = async () => {
    if (!code.trim()) {
      toast.error('Please provide code to review');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert code reviewer with 15+ years of experience. Perform a comprehensive code review on the following code:

CODE TO REVIEW:
${code}

Analyze for:
1. **Bugs & Logic Errors** - Off-by-one errors, null pointer exceptions, race conditions, etc.
2. **Security Vulnerabilities** - SQL injection, XSS, CSRF, insecure dependencies, exposed secrets
3. **Performance Bottlenecks** - Inefficient algorithms, memory leaks, unnecessary re-renders, N+1 queries
4. **Best Practices** - Code structure, naming conventions, error handling, maintainability
5. **Code Smells** - Duplicated code, long functions, god objects, tight coupling

For each issue found, provide:
- Severity level (critical, high, medium, low)
- Exact location (line number if possible, or code snippet)
- Clear explanation of the issue
- Concrete fix/improvement suggestion

Return as JSON:
{
  "summary": {
    "overallScore": 0-100,
    "critical": count,
    "high": count,
    "medium": count,
    "low": count
  },
  "issues": [
    {
      "category": "bugs|security|performance|best-practices",
      "severity": "critical|high|medium|low",
      "title": "Brief issue title",
      "description": "Detailed explanation",
      "codeSnippet": "affected code",
      "suggestion": "How to fix it",
      "lineNumber": number or null
    }
  ],
  "strengths": ["positive aspect 1", "positive aspect 2"],
  "recommendations": ["overall recommendation 1", "overall recommendation 2"]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: {
              type: "object",
              properties: {
                overallScore: { type: "number" },
                critical: { type: "number" },
                high: { type: "number" },
                medium: { type: "number" },
                low: { type: "number" }
              }
            },
            issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  severity: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  codeSnippet: { type: "string" },
                  suggestion: { type: "string" },
                  lineNumber: { type: "number" }
                }
              }
            },
            strengths: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setReview(response);
      toast.success('Code review complete!');
    } catch (error) {
      toast.error('Review failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'bugs': return <AlertTriangle className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <GlassmorphicCard className="p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Code Review Assistant</h2>
            <p className="text-sm text-gray-400">AI-powered security & quality analysis</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-white mb-2 block">Code to Review</Label>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here for comprehensive review..."
              className="min-h-[500px] font-mono text-sm bg-slate-900/50 border-white/10 text-white"
            />
          </div>

          <Button
            onClick={analyzeCode}
            disabled={loading || !code.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Review Code
              </>
            )}
          </Button>
        </div>

        <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
          <h4 className="text-sm font-semibold text-purple-400 mb-2">What We Check</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Security vulnerabilities (XSS, injection, auth issues)</li>
            <li>• Performance bottlenecks & memory leaks</li>
            <li>• Logic bugs & edge case handling</li>
            <li>• Code quality & maintainability</li>
          </ul>
        </div>
      </GlassmorphicCard>

      {/* Results Panel */}
      <div className="space-y-6">
        {review ? (
          <>
            {/* Summary */}
            <GlassmorphicCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Review Summary</h3>
                <div className={`text-4xl font-bold ${getScoreColor(review.summary.overallScore)}`}>
                  {review.summary.overallScore}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="text-center p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-400">{review.summary.critical}</div>
                  <div className="text-xs text-gray-400 uppercase">Critical</div>
                </div>
                <div className="text-center p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">{review.summary.high}</div>
                  <div className="text-xs text-gray-400 uppercase">High</div>
                </div>
                <div className="text-center p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">{review.summary.medium}</div>
                  <div className="text-xs text-gray-400 uppercase">Medium</div>
                </div>
                <div className="text-center p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{review.summary.low}</div>
                  <div className="text-xs text-gray-400 uppercase">Low</div>
                </div>
              </div>
            </GlassmorphicCard>

            {/* Issues */}
            {review.issues.length > 0 && (
              <GlassmorphicCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Issues Found ({review.issues.length})</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {review.issues.map((issue, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(issue.category)}
                          <Badge className={`${getSeverityColor(issue.severity)} border font-semibold`}>
                            {issue.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500 uppercase">{issue.category}</span>
                      </div>

                      <h4 className="text-sm font-bold text-white mb-2">{issue.title}</h4>
                      <p className="text-sm text-gray-400 mb-3">{issue.description}</p>

                      {issue.codeSnippet && (
                        <div className="mb-3 relative">
                          <pre className="bg-slate-900 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                            {issue.codeSnippet}
                          </pre>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(issue.codeSnippet);
                              toast.success('Copied!');
                            }}
                            className="absolute top-2 right-2 h-6 w-6 bg-slate-800/80"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      )}

                      <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                        <div className="text-xs font-semibold text-green-400 mb-1">💡 Suggestion</div>
                        <p className="text-xs text-gray-300">{issue.suggestion}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassmorphicCard>
            )}

            {/* Strengths */}
            {review.strengths && review.strengths.length > 0 && (
              <GlassmorphicCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  What You Did Well
                </h3>
                <ul className="space-y-2">
                  {review.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-green-400 mt-0.5">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </GlassmorphicCard>
            )}

            {/* Recommendations */}
            {review.recommendations && review.recommendations.length > 0 && (
              <GlassmorphicCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Overall Recommendations</h3>
                <ul className="space-y-2">
                  {review.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-blue-400 mt-0.5">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </GlassmorphicCard>
            )}
          </>
        ) : (
          <GlassmorphicCard className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Ready to Review</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Paste your code and get AI-powered security, performance, and quality analysis
            </p>
          </GlassmorphicCard>
        )}
      </div>
    </div>
  );
}