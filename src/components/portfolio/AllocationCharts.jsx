import React from 'react';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function AllocationCharts({ investments }) {
  // Industry allocation
  const industryData = React.useMemo(() => {
    const grouped = {};
    investments.forEach(inv => {
      grouped[inv.industry] = (grouped[inv.industry] || 0) + inv.investment_amount;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [investments]);

  // Stage allocation
  const stageData = React.useMemo(() => {
    const grouped = {};
    investments.forEach(inv => {
      grouped[inv.stage] = (grouped[inv.stage] || 0) + inv.investment_amount;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [investments]);

  // Geography allocation
  const geoData = React.useMemo(() => {
    const grouped = {};
    investments.forEach(inv => {
      grouped[inv.geography] = (grouped[inv.geography] || 0) + inv.investment_amount;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [investments]);

  const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-white font-semibold">{payload[0].name}</p>
          <p className="text-cyan-400">${(payload[0].value / 1000000).toFixed(2)}M</p>
        </div>
      );
    }
    return null;
  };

  if (!investments.length) {
    return (
      <CinematicCard>
        <div className="p-12 text-center">
          <p className="text-slate-400">No investments to display. Add your first investment to see allocations.</p>
        </div>
      </CinematicCard>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Industry Allocation */}
      <CinematicCard variant="glass">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-6">Industry Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={industryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {industryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CinematicCard>

      {/* Stage Allocation */}
      <CinematicCard variant="glass">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-6">Stage Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CinematicCard>

      {/* Geography Allocation */}
      <CinematicCard variant="glass" className="lg:col-span-2">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-6">Geographic Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={geoData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CinematicCard>
    </div>
  );
}