import React from "react";
import { motion } from "framer-motion";
import { Package, AlertTriangle, CheckCircle2, ArrowUp, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function DependencyHealth({ health }) {
  // Simulated dependency data
  const dependencies = [
    { name: 'react', current: '18.2.0', latest: '18.2.0', status: 'up-to-date', type: 'production' },
    { name: 'typescript', current: '5.2.0', latest: '5.3.2', status: 'outdated', type: 'dev' },
    { name: 'lodash', current: '4.17.19', latest: '4.17.21', status: 'vulnerable', severity: 'high', cve: 'CVE-2021-23337', type: 'production' },
    { name: 'axios', current: '1.4.0', latest: '1.6.2', status: 'outdated', type: 'production' },
    { name: 'webpack', current: '5.88.0', latest: '5.89.0', status: 'outdated', type: 'dev' },
    { name: 'express', current: '4.18.2', latest: '4.18.2', status: 'up-to-date', type: 'production' },
    { name: 'moment', current: '2.29.1', latest: '2.29.4', status: 'vulnerable', severity: 'medium', cve: 'CVE-2022-24785', type: 'production' },
  ];

  const pieData = [
    { name: 'Up to Date', value: health.upToDate, color: '#10B981' },
    { name: 'Outdated', value: health.outdated, color: '#F59E0B' },
    { name: 'Vulnerable', value: health.vulnerable, color: '#EF4444' }
  ];

  const statusColors = {
    'up-to-date': '#10B981',
    'outdated': '#F59E0B',
    'vulnerable': '#EF4444'
  };

  const vulnerableDeps = dependencies.filter(d => d.status === 'vulnerable');
  const outdatedDeps = dependencies.filter(d => d.status === 'outdated');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 p-6"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            Dependency Health
          </h3>
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1E293B', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{health.score}%</p>
                  <p className="text-xs text-gray-400">Health</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                <span className="text-xs text-gray-400">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Vulnerable Dependencies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-red-500/30 p-6"
          style={{ background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Vulnerabilities ({vulnerableDeps.length})
          </h3>
          <div className="space-y-3">
            {vulnerableDeps.map(dep => (
              <div key={dep.name} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-white">{dep.name}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    dep.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {dep.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2">{dep.current} → {dep.latest}</p>
                <a 
                  href={`https://nvd.nist.gov/vuln/detail/${dep.cve}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-red-400 flex items-center gap-1 hover:underline"
                >
                  {dep.cve}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
            {vulnerableDeps.length === 0 && (
              <div className="text-center py-4">
                <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-green-400">No vulnerabilities found!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Outdated Dependencies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-orange-500/30 p-6"
          style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ArrowUp className="w-5 h-5 text-orange-400" />
            Updates Available ({outdatedDeps.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {outdatedDeps.map(dep => (
              <div key={dep.name} className="flex items-center justify-between p-2 rounded-lg bg-orange-500/10">
                <div>
                  <span className="text-sm text-white">{dep.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{dep.type}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{dep.current}</p>
                  <p className="text-xs text-orange-400">→ {dep.latest}</p>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30">
            <ArrowUp className="w-4 h-4 mr-2" />
            Update All
          </Button>
        </motion.div>
      </div>

      {/* Full Dependency List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <h3 className="text-lg font-bold text-white mb-4">All Dependencies</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs text-gray-400 font-medium">Package</th>
                <th className="text-left py-3 px-4 text-xs text-gray-400 font-medium">Current</th>
                <th className="text-left py-3 px-4 text-xs text-gray-400 font-medium">Latest</th>
                <th className="text-left py-3 px-4 text-xs text-gray-400 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-xs text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {dependencies.map(dep => (
                <tr key={dep.name} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-sm text-white">{dep.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-400 font-mono">{dep.current}</td>
                  <td className="py-3 px-4 text-sm text-gray-400 font-mono">{dep.latest}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{dep.type}</td>
                  <td className="py-3 px-4">
                    <span 
                      className="px-2 py-1 rounded text-xs capitalize"
                      style={{ 
                        background: `${statusColors[dep.status]}20`,
                        color: statusColors[dep.status]
                      }}
                    >
                      {dep.status.replace('-', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}