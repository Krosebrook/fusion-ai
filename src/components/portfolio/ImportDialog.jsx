import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ImportDialog({ open, onClose, onSuccess, userId }) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
    } else {
      toast.error('Please select a CSV file');
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);

    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Extract data using AI
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              company_name: { type: 'string' },
              industry: { type: 'string' },
              stage: { type: 'string' },
              geography: { type: 'string' },
              investment_date: { type: 'string' },
              investment_amount: { type: 'number' },
              current_valuation: { type: 'number' },
              ownership_percentage: { type: 'number' },
              deal_structure: { type: 'string' },
              status: { type: 'string' },
              notes: { type: 'string' },
            },
          },
        },
      });

      if (result.status === 'success' && result.output) {
        // Bulk insert
        const investments = result.output.map(item => ({
          ...item,
          user_id: userId,
        }));

        await base44.entities.PortfolioInvestment.bulkCreate(investments);

        toast.success(`Successfully imported ${investments.length} investments`);
        onSuccess();
        onClose();
        setFile(null);
      } else {
        toast.error(result.details || 'Failed to parse file');
      }
    } catch (error) {
      toast.error('Import failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = 'company_name,industry,stage,geography,investment_date,investment_amount,current_valuation,ownership_percentage,deal_structure,status,notes\n';
    const sample = 'Acme Corp,SaaS,Series A,North America,2024-01-15,1000000,1500000,5.5,Equity,Active,Strong growth\n';
    const csv = headers + sample;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Import Portfolio Data</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Template Download */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-300 mb-2">
                  Download our CSV template to ensure proper formatting
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 text-slate-400 mb-3" />
                <p className="mb-2 text-sm text-slate-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500">CSV files only</p>
                {file && (
                  <p className="mt-2 text-sm text-cyan-400 font-medium">{file.name}</p>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="border-slate-700">
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || loading}
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
            >
              {loading ? 'Importing...' : 'Import Data'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}