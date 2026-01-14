import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function CoverageAnalyzer({ suites }) {
  const coverageData = suites
    .filter(s => s.coverage)
    .map(s => ({
      name: s.name,
      statements: s.coverage.statements || 0,
      branches: s.coverage.branches || 0,
      functions: s.coverage.functions || 0,
      lines: s.coverage.lines || 0
    }));

  const avgCoverage = {
    statements: Math.round(coverageData.reduce((acc, c) => acc + c.statements, 0) / (coverageData.length || 1)),
    branches: Math.round(coverageData.reduce((acc, c) => acc + c.branches, 0) / (coverageData.length || 1)),
    functions: Math.round(coverageData.reduce((acc, c) => acc + c.functions, 0) / (coverageData.length || 1)),
    lines: Math.round(coverageData.reduce((acc, c) => acc + c.lines, 0) / (coverageData.length || 1))
  };

  const chartData = [
    { name: 'Statements', value: avgCoverage.statements },
    { name: 'Branches', value: avgCoverage.branches },
    { name: 'Functions', value: avgCoverage.functions },
    { name: 'Lines', value: avgCoverage.lines }
  ];

  const getColor = (value) => {
    if (value >= 80) return '#10b981';
    if (value >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(avgCoverage).map(([key, value]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-lg bg-white/5 border border-white/10"
          >
            <p className="text-white/60 text-sm capitalize mb-1">{key}</p>
            <p className={`text-3xl font-bold ${
              value >= 80 ? 'text-green-400' : value >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {value}%
            </p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="p-6 rounded-lg bg-white/5 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Coverage Breakdown
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
            <YAxis stroke="rgba(255,255,255,0.6)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={getColor(entry.value)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recommendations */}
      <div className="p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-white font-semibold mb-2">Improvement Suggestions</h3>
            <ul className="space-y-2 text-white/80 text-sm">
              {avgCoverage.branches < 80 && (
                <li>• Increase branch coverage by testing conditional logic paths</li>
              )}
              {avgCoverage.statements < 80 && (
                <li>• Add tests for uncovered code statements</li>
              )}
              {avgCoverage.functions < 80 && (
                <li>• Ensure all functions have at least one test case</li>
              )}
              {avgCoverage.lines >= 80 && avgCoverage.branches >= 80 && (
                <li className="flex items-center gap-2 text-green-400">
                  <AlertCircle className="w-4 h-4" />
                  Great coverage! Consider adding edge case tests
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}