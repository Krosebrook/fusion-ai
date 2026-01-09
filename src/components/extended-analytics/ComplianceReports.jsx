import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, Download, Shield, CheckCircle2, XCircle, AlertTriangle, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";

export default function ComplianceReports({ runs, qualityChecks, configs }) {
  const [reportType, setReportType] = useState("security");
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    { value: 'security', label: 'Security Compliance', icon: Shield },
    { value: 'quality', label: 'Code Quality', icon: CheckCircle2 },
    { value: 'performance', label: 'Performance Benchmarks', icon: AlertTriangle },
    { value: 'audit', label: 'Full Audit Report', icon: FileText }
  ];

  // Calculate compliance metrics
  const complianceMetrics = {
    security: {
      score: 94,
      checks: [
        { name: 'Vulnerability Scanning', status: 'passed', details: 'No critical vulnerabilities' },
        { name: 'Secret Detection', status: 'passed', details: 'No exposed secrets in code' },
        { name: 'Dependency Audit', status: 'warning', details: '2 outdated dependencies with known CVEs' },
        { name: 'Container Scanning', status: 'passed', details: 'Base images are secure' },
        { name: 'SAST Analysis', status: 'passed', details: 'No high-severity code issues' },
        { name: 'License Compliance', status: 'passed', details: 'All licenses compatible' }
      ],
      standards: ['SOC2', 'ISO 27001', 'GDPR']
    },
    quality: {
      score: 87,
      checks: [
        { name: 'Code Coverage', status: 'passed', details: '82% coverage (threshold: 80%)' },
        { name: 'Technical Debt', status: 'warning', details: '45 hours estimated debt' },
        { name: 'Code Duplication', status: 'passed', details: '3.2% duplication rate' },
        { name: 'Complexity Score', status: 'passed', details: 'Average complexity: 8.4' },
        { name: 'Documentation', status: 'warning', details: '72% of public APIs documented' },
        { name: 'Test Quality', status: 'passed', details: 'All critical paths covered' }
      ],
      standards: ['Clean Code', 'SOLID Principles']
    },
    performance: {
      score: 91,
      checks: [
        { name: 'Build Time', status: 'passed', details: 'Avg 4m 32s (target: <5m)' },
        { name: 'Test Execution', status: 'passed', details: 'Avg 2m 15s (target: <3m)' },
        { name: 'Resource Usage', status: 'warning', details: '78% memory usage peaks' },
        { name: 'Deployment Speed', status: 'passed', details: 'Avg 45s to production' },
        { name: 'Rollback Time', status: 'passed', details: '<30s guaranteed' },
        { name: 'Availability', status: 'passed', details: '99.95% uptime' }
      ],
      standards: ['SLA Compliance', 'Performance Benchmarks']
    }
  };

  const generateReportMutation = useMutation({
    mutationFn: async (type) => {
      const report = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a detailed ${type} compliance report for a CI/CD pipeline with the following metrics:
        
Metrics: ${JSON.stringify(complianceMetrics[type], null, 2)}

Recent Activity:
- Total Runs: ${runs.length}
- Success Rate: ${((runs.filter(r => r.status === 'success').length / runs.length) * 100).toFixed(1)}%
- Quality Checks: ${qualityChecks.length}
- Pipelines: ${configs.length}

Generate a professional report summary with:
1. Executive Summary
2. Key Findings
3. Recommendations
4. Risk Assessment
5. Compliance Status for each standard`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            key_findings: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            risk_level: { type: "string" },
            compliance_status: { type: "object" }
          }
        }
      });
      return report;
    }
  });

  const currentMetrics = complianceMetrics[reportType] || complianceMetrics.security;
  const statusColors = {
    passed: '#10B981',
    warning: '#F59E0B',
    failed: '#EF4444'
  };

  const downloadReport = () => {
    // Generate PDF-like content
    const content = `
COMPLIANCE REPORT - ${reportType.toUpperCase()}
Generated: ${new Date().toISOString()}

SCORE: ${currentMetrics.score}/100

CHECKS:
${currentMetrics.checks.map(c => `- ${c.name}: ${c.status.toUpperCase()} - ${c.details}`).join('\n')}

STANDARDS: ${currentMetrics.standards.join(', ')}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${reportType}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Report Type Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex gap-2">
          {reportTypes.map(type => (
            <Button
              key={type.value}
              onClick={() => setReportType(type.value)}
              variant={reportType === type.value ? "default" : "outline"}
              className={reportType === type.value 
                ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                : "border-white/10 text-gray-300"}
            >
              <type.icon className="w-4 h-4 mr-2" />
              {type.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => generateReportMutation.mutate(reportType)}
            disabled={generateReportMutation.isPending}
            variant="outline"
            className="border-purple-500/30 text-purple-400"
          >
            <Eye className="w-4 h-4 mr-2" />
            {generateReportMutation.isPending ? 'Generating...' : 'AI Summary'}
          </Button>
          <Button
            onClick={downloadReport}
            className="bg-gradient-to-r from-green-500 to-emerald-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 p-6"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h3 className="text-lg font-bold text-white mb-4 capitalize">{reportType} Compliance</h3>
          
          <div className="relative w-40 h-40 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
              <circle 
                cx="80" cy="80" r="70" 
                stroke={currentMetrics.score >= 90 ? '#10B981' : currentMetrics.score >= 70 ? '#F59E0B' : '#EF4444'}
                strokeWidth="10" 
                fill="none"
                strokeDasharray={`${currentMetrics.score * 4.4} 440`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-4xl font-bold text-white">{currentMetrics.score}</span>
                <span className="text-xl text-gray-400">/100</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-400 text-center">Standards Compliance:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {currentMetrics.standards.map(std => (
                <span key={std} className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs">
                  {std}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Checks List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-xl border border-white/10 p-6"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Compliance Checks</h3>
          
          <div className="space-y-3">
            {currentMetrics.checks.map((check, idx) => (
              <motion.div
                key={check.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
              >
                <div className="flex items-center gap-3">
                  {check.status === 'passed' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                  {check.status === 'warning' && <AlertTriangle className="w-5 h-5 text-orange-400" />}
                  {check.status === 'failed' && <XCircle className="w-5 h-5 text-red-400" />}
                  <div>
                    <p className="text-sm font-medium text-white">{check.name}</p>
                    <p className="text-xs text-gray-400">{check.details}</p>
                  </div>
                </div>
                <span 
                  className="px-2 py-1 rounded text-xs capitalize"
                  style={{ background: `${statusColors[check.status]}20`, color: statusColors[check.status] }}
                >
                  {check.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Generated Summary */}
      {generateReportMutation.data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-purple-500/30 p-6"
          style={{ background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            AI-Generated Report Summary
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-purple-400 mb-2">Executive Summary</h4>
              <p className="text-sm text-gray-300">{generateReportMutation.data.executive_summary}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-purple-400 mb-2">Key Findings</h4>
              <ul className="space-y-1">
                {generateReportMutation.data.key_findings?.map((finding, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    {finding}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-purple-400 mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {generateReportMutation.data.recommendations?.map((rec, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-green-400">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10">
              <span className={`px-3 py-1.5 rounded text-sm ${
                generateReportMutation.data.risk_level === 'low' ? 'bg-green-500/20 text-green-400' :
                generateReportMutation.data.risk_level === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                Risk Level: {generateReportMutation.data.risk_level?.toUpperCase()}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}