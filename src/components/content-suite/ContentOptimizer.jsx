import { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GlassmorphicCard } from "@/components/ui-library/GlassmorphicCard";
import { StatCard } from "@/components/ui-library/StatCard";
import { Loader2, TrendingUp, Target, Zap, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ContentOptimizer() {
  const [content, setContent] = useState('');
  const [targetKeywords, setTargetKeywords] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast.error('Please provide content to optimize');
      return;
    }

    setAnalyzing(true);

    try {
      const prompt = `Analyze the following content and provide comprehensive optimization insights:

CONTENT:
${content}

${targetKeywords ? `TARGET KEYWORDS: ${targetKeywords}` : ''}

Provide analysis in the following JSON structure:
{
  "seo_score": 0-100,
  "readability_score": 0-100,
  "tone_analysis": "description of current tone",
  "word_count": number,
  "keyword_density": {"keyword": percentage},
  "readability_level": "grade level",
  "issues": [
    {"type": "seo|readability|tone", "severity": "high|medium|low", "description": "...", "location": "paragraph/line"}
  ],
  "suggestions": [
    {"category": "SEO|Readability|Tone", "priority": "high|medium|low", "suggestion": "...", "impact": "..."}
  ],
  "strengths": ["..."],
  "sentiment": "positive|neutral|negative"
}

Be thorough and actionable. Consider cinematic brand voice - vivid, visual language.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            seo_score: { type: 'number' },
            readability_score: { type: 'number' },
            tone_analysis: { type: 'string' },
            word_count: { type: 'number' },
            keyword_density: { type: 'object' },
            readability_level: { type: 'string' },
            issues: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  severity: { type: 'string' },
                  description: { type: 'string' },
                  location: { type: 'string' }
                }
              }
            },
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  priority: { type: 'string' },
                  suggestion: { type: 'string' },
                  impact: { type: 'string' }
                }
              }
            },
            strengths: { type: 'array', items: { type: 'string' } },
            sentiment: { type: 'string' }
          }
        }
      });

      setAnalysis(result);
      toast.success('Content analyzed successfully!');
    } catch (error) {
      toast.error('Analysis failed: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: analysis ? '1fr 1fr' : '1fr', gap: '32px' }}>
      {/* Input Panel */}
      <GlassmorphicCard className="p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-orange-400" />
          Content to Optimize
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Paste Your Content *
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your blog post, marketing copy, or any content you want to optimize..."
              rows={12}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
            <p className="text-xs text-slate-400 mt-2">
              {content.split(/\s+/).filter(Boolean).length} words
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Target Keywords (optional)
            </label>
            <Textarea
              value={targetKeywords}
              onChange={(e) => setTargetKeywords(e.target.value)}
              placeholder="AI, design, automation, creative studio..."
              rows={2}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={analyzing || !content.trim()}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-lg py-6 hover:opacity-90"
          >
            {analyzing ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Analyzing Content...
              </>
            ) : (
              <>
                <Target className="mr-2" size={20} />
                Analyze & Optimize
              </>
            )}
          </Button>
        </div>
      </GlassmorphicCard>

      {/* Results Panel */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Score Cards */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="SEO Score"
              value={`${analysis.seo_score}/100`}
              icon={Zap}
              trend={analysis.seo_score >= 70 ? 'up' : 'down'}
              className={getScoreColor(analysis.seo_score)}
            />
            <StatCard
              title="Readability"
              value={`${analysis.readability_score}/100`}
              icon={TrendingUp}
              trend={analysis.readability_score >= 70 ? 'up' : 'down'}
              className={getScoreColor(analysis.readability_score)}
            />
          </div>

          {/* Tone & Stats */}
          <GlassmorphicCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Content Analysis</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Tone:</span>
                <span className="text-white font-medium">{analysis.tone_analysis}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sentiment:</span>
                <span className="text-white font-medium capitalize">{analysis.sentiment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Readability Level:</span>
                <span className="text-white font-medium">{analysis.readability_level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Word Count:</span>
                <span className="text-white font-medium">{analysis.word_count}</span>
              </div>
            </div>
          </GlassmorphicCard>

          {/* Issues */}
          {analysis.issues && analysis.issues.length > 0 && (
            <GlassmorphicCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                Issues Found ({analysis.issues.length})
              </h3>
              <div className="space-y-3">
                {analysis.issues.map((issue, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-semibold uppercase">{issue.type}</span>
                      <span className="text-xs uppercase">{issue.severity}</span>
                    </div>
                    <p className="text-sm text-white">{issue.description}</p>
                    {issue.location && (
                      <p className="text-xs text-slate-400 mt-1">Location: {issue.location}</p>
                    )}
                  </div>
                ))}
              </div>
            </GlassmorphicCard>
          )}

          {/* Suggestions */}
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <GlassmorphicCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Optimization Suggestions
              </h3>
              <div className="space-y-3">
                {analysis.suggestions.map((suggestion, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-semibold text-orange-400 uppercase">{suggestion.category}</span>
                      <span className="text-xs text-slate-400 uppercase">{suggestion.priority}</span>
                    </div>
                    <p className="text-sm text-white mb-2">{suggestion.suggestion}</p>
                    <p className="text-xs text-slate-400">Impact: {suggestion.impact}</p>
                  </div>
                ))}
              </div>
            </GlassmorphicCard>
          )}

          {/* Strengths */}
          {analysis.strengths && analysis.strengths.length > 0 && (
            <GlassmorphicCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Content Strengths</h3>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </GlassmorphicCard>
          )}
        </motion.div>
      )}
    </div>
  );
}