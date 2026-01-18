import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, TrendingUp } from 'lucide-react';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import PortfolioOverview from '@/components/portfolio/PortfolioOverview';
import AllocationCharts from '@/components/portfolio/AllocationCharts';
import MetricsTable from '@/components/portfolio/MetricsTable';
import AddInvestmentDialog from '@/components/portfolio/AddInvestmentDialog';
import ImportDialog from '@/components/portfolio/ImportDialog';
import PerformanceReport from '@/components/portfolio/PerformanceReport';
import GoalComparison from '@/components/portfolio/GoalComparison';

export default function PortfolioTracker() {
  const [user, setUser] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => null);
  }, []);

  const { data: investments = [], isLoading, refetch } = useQuery({
    queryKey: ['portfolio-investments', user?.id],
    queryFn: () => base44.entities.PortfolioInvestment.filter({ user_id: user.id }, '-investment_date'),
    enabled: !!user,
    initialData: [],
  });

  const { data: profile } = useQuery({
    queryKey: ['investor-profile', user?.id],
    queryFn: () => base44.entities.InvestorProfile.filter({ user_id: user.id }).then(p => p[0]),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
          <h2 className="text-2xl font-bold mb-2">Portfolio Tracker</h2>
          <p className="text-slate-400">Please sign in to access your portfolio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Portfolio Performance
            </h1>
            <p className="text-slate-400">Track, analyze, and optimize your investments</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(true)}
              className="border-slate-700 hover:bg-slate-800"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Investment
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <PortfolioOverview investments={investments} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="allocations" className="mt-8">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="allocations">Allocations</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="goals">vs Goals</TabsTrigger>
            <TabsTrigger value="report">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="allocations" className="mt-6">
            <AllocationCharts investments={investments} />
          </TabsContent>

          <TabsContent value="metrics" className="mt-6">
            <MetricsTable investments={investments} onRefetch={refetch} />
          </TabsContent>

          <TabsContent value="goals" className="mt-6">
            <GoalComparison investments={investments} profile={profile} />
          </TabsContent>

          <TabsContent value="report" className="mt-6">
            <PerformanceReport investments={investments} profile={profile} />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <AddInvestmentDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSuccess={refetch}
          userId={user.id}
        />

        <ImportDialog
          open={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          onSuccess={refetch}
          userId={user.id}
        />
      </div>
    </div>
  );
}