/**
 * Dependency Security Panel
 * AI-powered dependency vulnerability scanning and auto-fix suggestions
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { Badge } from '@/components/ui/badge';
import { aiSecurityService } from '../services/AISecurityService';
import { Shield, AlertTriangle, Download, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function DependencySecurityPanel({ pipelineId, dependencies = {} }) {
  const [scanning, setScanning] = useState(false);
  const [findings, setFindings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [fixScript, setFixScript] = useState(null);

  const runSecurityScan = async () => {
    setScanning(true);
    toast.info('🔍 AI analyzing dependencies...');

    try {
      const result = await aiSecurityService.analyzeDependencies(dependencies);
      setFindings(result.findings || []);
      setSummary(result.summary);

      if (result.findings && result.findings.length > 0) {
        const script = await aiSecurityService.generateFixScript(result.findings);
        setFixScript(script);
        toast.warning(`⚠️ Found ${result.findings.length} vulnerabilities`);
      } else {
        toast.success('✅ No vulnerabilities detected!');
      }
    } catch (error) {
      toast.error('Security scan failed');
    } finally {
      setScanning(false);
    }
  };

  const downloadFixScript = () => {
    if (!fixScript) return;
    
    const blob = new Blob([fixScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security-fixes.sh';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Fix script downloaded');
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return colors[severity] || colors.low;
  };

  return (
    <CinematicCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-purple-400" />
          <div>
            <h3 className="text-lg font-bold text-white">Dependency Security Scan</h3>
            <p className="text-white/60 text-sm">AI-powered vulnerability detection</p>
          </div>
        </div>
        <CinematicButton
          icon={Sparkles}
          onClick={runSecurityScan}
          disabled={scanning}
          glow
        >
          {scanning ? 'Scanning...' : 'Run AI Scan'}
        </CinematicButton>
      </div>

      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-5 gap-3 mb-6"
        >
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{summary.total}</div>
            <div className="text-white/60 text-xs">Total</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-400">{summary.critical}</div>
            <div className="text-red-400/80 text-xs">Critical</div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-400">{summary.high}</div>
            <div className="text-orange-400/80 text-xs">High</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">{summary.medium}</div>
            <div className="text-yellow-400/80 text-xs">Medium</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{summary.low}</div>
            <div className="text-blue-400/80 text-xs">Low</div>
          </div>
        </motion.div>
      )}

      {fixScript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <CinematicButton
            variant="glass"
            icon={Download}
            onClick={downloadFixScript}
          >
            Download Auto-Fix Script
          </CinematicButton>
        </motion.div>
      )}

      {findings.length > 0 && (
        <div className="space-y-3">
          {findings.map((finding, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <span className="font-semibold text-white">
                    {finding.package_name}
                  </span>
                  <Badge className={getSeverityColor(finding.severity)}>
                    {finding.severity}
                  </Badge>
                  {finding.cve_id && (
                    <Badge variant="outline" className="text-white/60">
                      {finding.cve_id}
                    </Badge>
                  )}
                </div>
                <div className="text-right text-sm">
                  <div className="text-red-400">{finding.current_version}</div>
                  <div className="text-green-400">→ {finding.safe_version}</div>
                </div>
              </div>

              <p className="text-white/70 text-sm mb-3">{finding.description}</p>

              {finding.fix_command && (
                <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-green-400">
                  {finding.fix_command}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {!scanning && findings.length === 0 && summary && summary.total === 0 && (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <div className="text-white font-semibold mb-1">All Clear!</div>
          <div className="text-white/60 text-sm">No security vulnerabilities detected</div>
        </div>
      )}
    </CinematicCard>
  );
}

export default DependencySecurityPanel;