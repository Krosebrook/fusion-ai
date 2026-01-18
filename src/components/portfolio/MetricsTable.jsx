import React from 'react';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

export default function MetricsTable({ investments, onRefetch }) {
  const calculateMetrics = (inv) => {
    let irr = inv.irr || 0;
    let moic = inv.moic || 0;

    if (inv.status === 'Exited' && inv.exit_amount) {
      moic = inv.exit_amount / inv.investment_amount;
      
      if (inv.investment_date && inv.exit_date) {
        const startDate = new Date(inv.investment_date);
        const endDate = new Date(inv.exit_date);
        const years = (endDate - startDate) / (365 * 24 * 60 * 60 * 1000);
        irr = ((Math.pow(moic, 1 / years) - 1) * 100);
      }
    } else if (inv.current_valuation) {
      moic = inv.current_valuation / inv.investment_amount;
      
      if (inv.investment_date) {
        const startDate = new Date(inv.investment_date);
        const now = new Date();
        const years = (now - startDate) / (365 * 24 * 60 * 60 * 1000);
        if (years > 0) {
          irr = ((Math.pow(moic, 1 / years) - 1) * 100);
        }
      }
    }

    return { irr, moic };
  };

  const statusColors = {
    Active: 'bg-green-500/20 text-green-300 border-green-500/30',
    Exited: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Written Off': 'bg-red-500/20 text-red-300 border-red-500/30',
    'On Hold': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  };

  if (!investments.length) {
    return (
      <CinematicCard>
        <div className="p-12 text-center">
          <p className="text-slate-400">No investments to display</p>
        </div>
      </CinematicCard>
    );
  }

  return (
    <CinematicCard variant="glass">
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-6">Investment Metrics</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-300">Company</TableHead>
                <TableHead className="text-slate-300">Industry</TableHead>
                <TableHead className="text-slate-300">Stage</TableHead>
                <TableHead className="text-slate-300">Date</TableHead>
                <TableHead className="text-slate-300 text-right">Investment</TableHead>
                <TableHead className="text-slate-300 text-right">Current Val.</TableHead>
                <TableHead className="text-slate-300 text-right">IRR</TableHead>
                <TableHead className="text-slate-300 text-right">MoIC</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map((inv) => {
                const { irr, moic } = calculateMetrics(inv);
                return (
                  <TableRow key={inv.id} className="border-slate-700 hover:bg-slate-800/50">
                    <TableCell className="font-medium text-white">{inv.company_name}</TableCell>
                    <TableCell className="text-slate-300">{inv.industry}</TableCell>
                    <TableCell className="text-slate-300">{inv.stage}</TableCell>
                    <TableCell className="text-slate-300">
                      {inv.investment_date ? format(new Date(inv.investment_date), 'MMM yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-right text-slate-300">
                      ${(inv.investment_amount / 1000000).toFixed(2)}M
                    </TableCell>
                    <TableCell className="text-right text-slate-300">
                      {inv.current_valuation ? `$${(inv.current_valuation / 1000000).toFixed(2)}M` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {irr > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : irr < 0 ? (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        ) : null}
                        <span className={irr > 0 ? 'text-green-400' : irr < 0 ? 'text-red-400' : 'text-slate-400'}>
                          {irr.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={moic > 1 ? 'text-green-400' : moic < 1 ? 'text-red-400' : 'text-slate-400'}>
                        {moic.toFixed(2)}x
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[inv.status]}>{inv.status}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </CinematicCard>
  );
}