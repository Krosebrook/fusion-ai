import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AddInvestmentDialog({ open, onClose, onSuccess, userId }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    stage: '',
    geography: '',
    investment_date: '',
    investment_amount: '',
    current_valuation: '',
    ownership_percentage: '',
    deal_structure: '',
    status: 'Active',
    notes: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.entities.PortfolioInvestment.create({
        ...formData,
        user_id: userId,
        investment_amount: parseFloat(formData.investment_amount),
        current_valuation: formData.current_valuation ? parseFloat(formData.current_valuation) : null,
        ownership_percentage: formData.ownership_percentage ? parseFloat(formData.ownership_percentage) : null,
      });

      toast.success('Investment added successfully');
      onSuccess();
      onClose();
      setFormData({
        company_name: '', industry: '', stage: '', geography: '', investment_date: '',
        investment_amount: '', current_valuation: '', ownership_percentage: '', deal_structure: '',
        status: 'Active', notes: '',
      });
    } catch (error) {
      toast.error('Failed to add investment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Add Investment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-slate-300">Company Name *</Label>
              <Input
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>

            <div>
              <Label className="text-slate-300">Industry *</Label>
              <Input
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>

            <div>
              <Label className="text-slate-300">Stage *</Label>
              <Select value={formData.stage} onValueChange={(val) => setFormData({ ...formData, stage: val })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {['Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Growth', 'Late Stage'].map(stage => (
                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300">Geography</Label>
              <Input
                value={formData.geography}
                onChange={(e) => setFormData({ ...formData, geography: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="e.g., North America"
              />
            </div>

            <div>
              <Label className="text-slate-300">Investment Date</Label>
              <Input
                type="date"
                value={formData.investment_date}
                onChange={(e) => setFormData({ ...formData, investment_date: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Investment Amount (USD) *</Label>
              <Input
                type="number"
                value={formData.investment_amount}
                onChange={(e) => setFormData({ ...formData, investment_amount: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="1000000"
                required
              />
            </div>

            <div>
              <Label className="text-slate-300">Current Valuation (USD)</Label>
              <Input
                type="number"
                value={formData.current_valuation}
                onChange={(e) => setFormData({ ...formData, current_valuation: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="1500000"
              />
            </div>

            <div>
              <Label className="text-slate-300">Ownership %</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.ownership_percentage}
                onChange={(e) => setFormData({ ...formData, ownership_percentage: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="5.0"
              />
            </div>

            <div>
              <Label className="text-slate-300">Deal Structure</Label>
              <Select value={formData.deal_structure} onValueChange={(val) => setFormData({ ...formData, deal_structure: val })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select structure" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {['Equity', 'Debt', 'Convertible', 'SAFE', 'Revenue Share'].map(structure => (
                    <SelectItem key={structure} value={structure}>{structure}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label className="text-slate-300">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
            >
              {loading ? 'Adding...' : 'Add Investment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}