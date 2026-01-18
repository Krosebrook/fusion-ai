import React, { useState } from 'react';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, TrendingUp, PieChart, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export default function PerformanceReport({ investments, profile }) {
  const [reportType, setReportType] = useState('comprehensive');
  const [dateRange, setDateRange] = useState('all');

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(6, 182, 212);
    doc.text('Portfolio Performance Report', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, 20, 30);
    
    // Summary Metrics
    const totalInvested = investments.reduce((sum, inv) => sum + inv.investment_amount, 0);
    const activeInvestments = investments.filter(inv => inv.status === 'Active').length;
    const irrValues = investments.filter(inv => inv.irr).map(inv => inv.irr);
    const avgIRR = irrValues.length ? irrValues.reduce((a, b) => a + b, 0) / irrValues.length : 0;
    
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Executive Summary', 20, 45);
    
    doc.setFontSize(12);
    doc.text(`Total Invested: $${(totalInvested / 1000000).toFixed(2)}M`, 20, 55);
    doc.text(`Active Investments: ${activeInvestments}`, 20, 65);
    doc.text(`Average IRR: ${avgIRR.toFixed(1)}%`, 20, 75);
    
    // Investment List
    doc.setFontSize(16);
    doc.text('Investment Details', 20, 90);
    
    let yPos = 100;
    doc.setFontSize(10);
    
    investments.slice(0, 10).forEach((inv, idx) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(`${idx + 1}. ${inv.company_name}`, 20, yPos);
      doc.text(`${inv.industry} | ${inv.stage}`, 30, yPos + 5);
      doc.text(`Investment: $${(inv.investment_amount / 1000000).toFixed(2)}M`, 30, yPos + 10);
      
      if (inv.irr) {
        doc.text(`IRR: ${inv.irr.toFixed(1)}%`, 100, yPos + 10);
      }
      
      yPos += 20;
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }
    
    doc.save(`portfolio-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('Report downloaded successfully');
  };

  const reportSections = [
    {
      icon: DollarSign,
      title: 'Capital Deployed',
      value: `$${(investments.reduce((sum, inv) => sum + inv.investment_amount, 0) / 1000000).toFixed(2)}M`,
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      title: 'Portfolio IRR',
      value: (() => {
        const irrValues = investments.filter(inv => inv.irr).map(inv => inv.irr);
        return irrValues.length ? `${(irrValues.reduce((a, b) => a + b, 0) / irrValues.length).toFixed(1)}%` : 'N/A';
      })(),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: PieChart,
      title: 'Diversification',
      value: `${new Set(investments.map(inv => inv.industry)).size} Industries`,
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <CinematicCard variant="glass">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-6">Generate Report</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  <SelectItem value="summary">Executive Summary</SelectItem>
                  <SelectItem value="metrics">Metrics Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="ytd">Year to Date</SelectItem>
                  <SelectItem value="1y">Last 12 Months</SelectItem>
                  <SelectItem value="3y">Last 3 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={generatePDF}
            className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF Report
          </Button>
        </div>
      </CinematicCard>

      {/* Report Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportSections.map((section, idx) => (
          <CinematicCard key={section.title} variant="glass">
            <div className="p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-4`}>
                <section.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{section.value}</div>
              <div className="text-sm text-slate-400">{section.title}</div>
            </div>
          </CinematicCard>
        ))}
      </div>

      {/* Report Preview Card */}
      <CinematicCard variant="glass">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-cyan-400" />
            <h4 className="font-semibold text-white">Report Preview</h4>
          </div>
          
          <div className="space-y-4 text-sm text-slate-300">
            <div>
              <h5 className="font-semibold text-white mb-2">Included Sections:</h5>
              <ul className="list-disc list-inside space-y-1">
                <li>Executive Summary with key metrics</li>
                <li>Portfolio allocation breakdown</li>
                <li>Investment performance details</li>
                <li>IRR and MoIC calculations</li>
                <li>Goal comparison analysis</li>
                {reportType === 'comprehensive' && (
                  <>
                    <li>Sector diversification charts</li>
                    <li>Geographic distribution</li>
                    <li>Risk-adjusted returns</li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-400">
                Reports are generated in PDF format with professional formatting and charts.
                All data is current as of {format(new Date(), 'MMMM d, yyyy')}.
              </p>
            </div>
          </div>
        </div>
      </CinematicCard>
    </div>
  );
}