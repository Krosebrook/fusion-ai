import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GitBranch, CheckCircle2, TrendingUp, ArrowLeftRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

export default function BranchComparison({ branchData, runs, configs }) {
  const [branch1, setBranch1] = useState(branchData[0]?.branch || "");
  const [branch2, setBranch2] = useState(branchData[1]?.branch || "");

  const comparison = useMemo(() => {
    const b1 = branchData.find(b => b.branch === branch1) || {};
    const b2 = branchData.find(b => b.branch === branch2) || {};

    const radarData = [
      { metric: 'Success Rate', [branch1]: b1.successRate || 0, [branch2]: b2.successRate || 0 },
      { metric: 'Speed Score', [branch1]: Math.max(0, 100 - (b1.avgDuration || 0) / 6), [branch2]: Math.max(0, 100 - (b2.avgDuration || 0) / 6) },
      { metric: 'Reliability', [branch1]: b1.successRate || 0, [branch2]: b2.successRate || 0 },
      { metric: 'Volume', [branch1]: Math.min(100, (b1.total || 0) * 5), [branch2]: Math.min(100, (b2.total || 0) * 5) },
      { metric: 'Stability', [branch1]: Math.max(0, b1.successRate - 10 || 0), [branch2]: Math.max(0, b2.successRate - 10 || 0) }
    ];

    return { b1, b2, radarData };
  }, [branchData, branch1, branch2]);

  return (
    <div className="space-y-6">
      {/* Branch Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-blue-400" />
          Compare Branches
        </h3>
        
        <div className="flex items-center gap-4">
          <Select value={branch1} onValueChange={setBranch1}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
              <GitBranch className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10">
              {branchData.map(b => (
                <SelectItem key={b.branch} value={b.branch} className="text-white">
                  {b.branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-gray-400">vs</span>

          <Select value={branch2} onValueChange={setBranch2}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
              <GitBranch className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10">
              {branchData.map(b => (
                <SelectItem key={b.branch} value={b.branch} className="text-white">
                  {b.branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-white/10 p-6"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Performance Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={comparison.radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <Radar name={branch1} dataKey={branch1} stroke="#FF7B00" fill="#FF7B00" fillOpacity={0.3} />
              <Radar name={branch2} dataKey={branch2} stroke="#00B4D8" fill="#00B4D8" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Side by Side Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-white/10 p-6"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Head to Head</h3>
          <div className="space-y-4">
            {/* Success Rate */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-orange-400">{comparison.b1.successRate || 0}%</span>
                <span className="text-gray-400">Success Rate</span>
                <span className="text-blue-400">{comparison.b2.successRate || 0}%</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-white/5">
                <div className="bg-gradient-to-r from-orange-500 to-orange-400" 
                     style={{ width: `${comparison.b1.successRate || 0}%` }} />
                <div className="flex-1" />
                <div className="bg-gradient-to-l from-blue-500 to-blue-400" 
                     style={{ width: `${comparison.b2.successRate || 0}%` }} />
              </div>
            </div>

            {/* Avg Duration */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-orange-400">{Math.floor((comparison.b1.avgDuration || 0) / 60)}m</span>
                <span className="text-gray-400">Avg Duration</span>
                <span className="text-blue-400">{Math.floor((comparison.b2.avgDuration || 0) / 60)}m</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-white/5">
                <div className="bg-gradient-to-r from-orange-500 to-orange-400" 
                     style={{ width: `${Math.min(100, (comparison.b1.avgDuration || 0) / 6)}%` }} />
                <div className="flex-1" />
                <div className="bg-gradient-to-l from-blue-500 to-blue-400" 
                     style={{ width: `${Math.min(100, (comparison.b2.avgDuration || 0) / 6)}%` }} />
              </div>
            </div>

            {/* Total Runs */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-orange-400">{comparison.b1.total || 0}</span>
                <span className="text-gray-400">Total Runs</span>
                <span className="text-blue-400">{comparison.b2.total || 0}</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-white/5">
                <div className="bg-gradient-to-r from-orange-500 to-orange-400" 
                     style={{ width: `${Math.min(100, (comparison.b1.total || 0) * 5)}%` }} />
                <div className="flex-1" />
                <div className="bg-gradient-to-l from-blue-500 to-blue-400" 
                     style={{ width: `${Math.min(100, (comparison.b2.total || 0) * 5)}%` }} />
              </div>
            </div>

            {/* Winner Badge */}
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">
                  {(comparison.b1.successRate || 0) >= (comparison.b2.successRate || 0) ? branch1 : branch2}
                </span>
                <span className="text-gray-400">performs better overall</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* All Branches Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          All Branches Performance
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={branchData.slice(0, 10)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" />
            <YAxis type="category" dataKey="branch" stroke="#94A3B8" width={100} />
            <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)' }} />
            <Bar dataKey="successRate" fill="#10B981" name="Success Rate %" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}