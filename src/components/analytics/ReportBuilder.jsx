/**
 * Report Builder Component
 * Customizable report generation with multiple export formats
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, Eye } from 'lucide-react';
import { toast } from 'sonner';

export function ReportBuilder({ test, metrics }) {
  const [sections, setSections] = useState({
    summary: true,
    trends: true,
    cohort: true,
    statistics: true,
    recommendations: true,
  });

  const [exportFormat, setExportFormat] = useState('pdf');

  const toggleSection = (section) => {
    setSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleExport = async () => {
    try {
      const reportContent = generateReport();
      
      if (exportFormat === 'pdf') {
        exportPDF(reportContent);
      } else if (exportFormat === 'html') {
        exportHTML(reportContent);
      } else if (exportFormat === 'json') {
        exportJSON(reportContent);
      }
      
      toast.success(`Report exported as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const generateReport = () => {
    return {
      test: test.name,
      date: new Date().toISOString(),
      sections,
      summary: sections.summary ? generateSummary() : null,
      trends: sections.trends ? generateTrends() : null,
      recommendations: sections.recommendations ? generateRecommendations() : null,
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Report Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <CinematicCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Custom Report</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-white/80 text-sm font-semibold mb-3">Report Sections</p>
              <div className="space-y-2">
                {[
                  { key: 'summary', label: 'Executive Summary' },
                  { key: 'trends', label: 'Trend Analysis' },
                  { key: 'cohort', label: 'Cohort Analysis' },
                  { key: 'statistics', label: 'Statistical Analysis' },
                  { key: 'recommendations', label: 'Recommendations' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded transition">
                    <input
                      type="checkbox"
                      checked={sections[key]}
                      onChange={() => toggleSection(key)}
                      className="w-4 h-4 rounded border-white/20"
                    />
                    <span className="text-white">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-white/80 text-sm font-semibold mb-3">Export Format</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { format: 'pdf', label: 'PDF' },
                  { format: 'html', label: 'HTML' },
                  { format: 'json', label: 'JSON' },
                ].map(({ format, label }) => (
                  <button
                    key={format}
                    onClick={() => setExportFormat(format)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      exportFormat === format
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
            <Button
              variant="outline"
              className="border-white/10 flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleExport}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CinematicCard>
      </motion.div>

      {/* Report Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CinematicCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Report Preview</h3>
          </div>

          <div className="space-y-4 text-white/80 text-sm max-h-96 overflow-y-auto">
            <div>
              <p className="font-semibold text-white mb-2">Test Name</p>
              <p>{test.name}</p>
            </div>

            {sections.summary && (
              <div className="pt-4 border-t border-white/10">
                <p className="font-semibold text-white mb-2">Executive Summary</p>
                <p>This report provides comprehensive analysis of A/B test performance, including trend analysis, cohort segmentation, and statistical significance testing.</p>
              </div>
            )}

            {sections.trends && (
              <div className="pt-4 border-t border-white/10">
                <p className="font-semibold text-white mb-2">Trend Analysis Included</p>
                <p>Performance trends over time with variant comparison and forecasting.</p>
              </div>
            )}

            {sections.cohort && (
              <div className="pt-4 border-t border-white/10">
                <p className="font-semibold text-white mb-2">Cohort Analysis Included</p>
                <p>User segmentation by time period with retention and performance metrics.</p>
              </div>
            )}

            {sections.statistics && (
              <div className="pt-4 border-t border-white/10">
                <p className="font-semibold text-white mb-2">Statistical Analysis Included</p>
                <p>P-values, confidence intervals, effect sizes, and power analysis.</p>
              </div>
            )}

            {sections.recommendations && (
              <div className="pt-4 border-t border-white/10">
                <p className="font-semibold text-white mb-2">Recommendations Included</p>
                <p>Data-driven recommendations for test continuation or winner promotion.</p>
              </div>
            )}

            <div className="pt-4 border-t border-white/10">
              <p className="font-semibold text-white mb-2">Generated</p>
              <p>{new Date().toLocaleString()}</p>
            </div>
          </div>
        </CinematicCard>
      </motion.div>
    </motion.div>
  );
}

function generateSummary() {
  return {
    title: 'Executive Summary',
    content: 'A/B test summary with key metrics and findings'
  };
}

function generateTrends() {
  return {
    title: 'Trend Analysis',
    content: 'Performance trends over time'
  };
}

function generateRecommendations() {
  return {
    title: 'Recommendations',
    content: 'Data-driven recommendations for next steps'
  };
}

function exportPDF(reportContent) {
  const element = document.createElement('div');
  element.innerHTML = JSON.stringify(reportContent, null, 2);
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  const link = document.createElement('a');
  link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(reportContent, null, 2))}`;
  link.download = `report-${reportContent.test}.pdf`;
  link.dispatchEvent(event);
}

function exportHTML(reportContent) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>A/B Test Report - ${reportContent.test}</title>
      <style>
        body { font-family: Inter, sans-serif; background: #0f172a; color: #fff; padding: 40px; }
        h1 { color: #06b6d4; margin-bottom: 20px; }
        section { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #1e293b; }
        pre { background: #1e293b; padding: 20px; border-radius: 8px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <h1>A/B Test Report: ${reportContent.test}</h1>
      <p>Generated: ${reportContent.date}</p>
      <pre>${JSON.stringify(reportContent, null, 2)}</pre>
    </body>
    </html>
  `;
  
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report-${reportContent.test}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportJSON(reportContent) {
  const json = JSON.stringify(reportContent, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report-${reportContent.test}.json`;
  a.click();
  URL.revokeObjectURL(url);
}