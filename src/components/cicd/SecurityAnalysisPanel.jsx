/**
 * Security Analysis Panel
 * Display AI-powered security vulnerabilities and fixes
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { pipelineSecurityService } from '../services/PipelineSecurityService';
import { toast } from 'sonner';

export function SecurityAnalysisPanel({ pipeline, onClose, onApplyFix }) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [applyingFix, setApplyingFix] = useState(null);

  useEffect(() => {
    analyzePipeline();
  }, []);

  const analyzePipeline = async () => {
    setLoading(true);
    try {
      const result = await pipelineSecurityService.analyzePipelineSecurity(pipeline);
      setAnalysis(result.analysis);
    } catch (error) {
      console.error('Security analysis failed', error);
      toast.error('Failed to analyze pipeline security');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFix = async (vulnerability) => {
    setApplyingFix(vulnerability.id);
    try {
      const { updatedPipeline } = await pipelineSecurityService.applySecurityFix(
        pipeline,
        vulnerability
      );
      toast.success(`✅ ${vulnerability.title} fixed`);
      onApplyFix?.(updatedPipeline);
    } catch (error) {
      console.error('Failed to apply fix', error);
      toast.error('Failed to apply security fix');
    } finally {
      setApplyingFix(null);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 70) return 'from-blue-500 to-cyan-600';
    if (score >= 50) return 'from-yellow-500 to-orange-600';
    return 'from-red-600 to-red-700';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Scanning for vulnerabilities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-cyan-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">Security Analysis</h2>
                <p className="text-white/60 text-sm">AI-powered vulnerability detection</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Security Score */}
          <CinematicCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-white/60 text-sm mb-1">Security Score</div>
                <div className="text-3xl font-bold text-white">{analysis.security_score}/100</div>
              </div>
              <div className={`px-6 py-3 rounded-xl bg-gradient-to-r ${getScoreColor(analysis.security_score)} text-white font-semibold flex items-center gap-2`}>
                {pipelineSecurityService.getRiskIcon(analysis.risk_level)}
                {analysis.risk_level.toUpperCase()} RISK
              </div>
            </div>

            {/* Compliance */}
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(analysis.compliance).map(([standard, status]) => (
                <div key={standard} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    {status === 'pass' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    )}
                    <span className="text-white font-semibold text-sm">{standard.toUpperCase()}</span>
                  </div>
                  <div className="text-white/60 text-xs capitalize">{status}</div>
                </div>
              ))}
            </div>
          </CinematicCard>

          {/* Vulnerabilities */}
          {analysis.vulnerabilities?.length > 0 && (
            <CinematicCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-bold text-white">
                  Vulnerabilities ({analysis.vulnerabilities.length})
                </h3>
              </div>
              <div className="space-y-3">
                {analysis.vulnerabilities.map((vuln) => (
                  <div
                    key={vuln.id}
                    className={`p-4 rounded-lg border ${
                      vuln.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                      vuln.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                      vuln.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                      'bg-blue-500/10 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${pipelineSecurityService.getSeverityColor(vuln.severity)} text-white`}>
                            {vuln.severity.toUpperCase()}
                          </span>
                          <span className="text-white/60 text-xs">{vuln.category}</span>
                          {vuln.cwe_id && (
                            <span className="text-white/40 text-xs">{vuln.cwe_id}</span>
                          )}
                        </div>
                        <h4 className="text-white font-semibold mb-2">{vuln.title}</h4>
                        <p className="text-white/70 text-sm mb-2">{vuln.description}</p>
                        <div className="text-white/60 text-sm mb-2">
                          <strong>Location:</strong> {vuln.location}
                        </div>
                        <div className="text-red-400 text-sm mb-2">
                          <strong>Impact:</strong> {vuln.impact}
                        </div>
                        <div className="text-cyan-400 text-sm">
                          <strong>Fix:</strong> {vuln.remediation}
                        </div>
                      </div>
                      {vuln.auto_fixable && (
                        <CinematicButton
                          variant="primary"
                          size="sm"
                          onClick={() => handleApplyFix(vuln)}
                          disabled={applyingFix !== null}
                        >
                          {applyingFix === vuln.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Auto-Fix'
                          )}
                        </CinematicButton>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CinematicCard>
          )}

          {/* Recommendations */}
          {analysis.recommendations?.length > 0 && (
            <CinematicCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-bold text-white">Security Recommendations</h3>
              </div>
              <div className="space-y-3">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        rec.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                        rec.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {rec.priority.toUpperCase()}
                      </span>
                      <span className="text-white/60 text-xs">{rec.category}</span>
                    </div>
                    <h4 className="text-white font-semibold mb-1">{rec.title}</h4>
                    <p className="text-white/70 text-sm">{rec.description}</p>
                  </div>
                ))}
              </div>
            </CinematicCard>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default SecurityAnalysisPanel;