/**
 * Audit Log Viewer Component
 * 
 * Display and filter audit logs for compliance and monitoring.
 * Search by user, action, resource, and date range.
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';

const ACTION_COLORS = {
  created_test: 'bg-green-500/20 text-green-400',
  edited_test: 'bg-blue-500/20 text-blue-400',
  paused_test: 'bg-yellow-500/20 text-yellow-400',
  resumed_test: 'bg-green-500/20 text-green-400',
  promoted_test: 'bg-purple-500/20 text-purple-400',
  deleted_test: 'bg-red-500/20 text-red-400',
  assigned_permission: 'bg-cyan-500/20 text-cyan-400',
  revoked_permission: 'bg-orange-500/20 text-orange-400',
  exported_report: 'bg-indigo-500/20 text-indigo-400',
};

export function AuditLogViewer() {
  const [filters, setFilters] = useState({
    action: 'all',
    resourceType: 'all',
    searchUser: '',
    dateRange: '7days',
  });

  // Fetch audit logs
  const { data: logs = [] } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-timestamp', 500),
    staleTime: 30000,
  });

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Action filter
      if (filters.action !== 'all' && log.action !== filters.action) {
        return false;
      }

      // Resource type filter
      if (filters.resourceType !== 'all' && log.resource_type !== filters.resourceType) {
        return false;
      }

      // User search filter
      if (filters.searchUser && !log.user_email?.toLowerCase().includes(filters.searchUser.toLowerCase())) {
        return false;
      }

      // Date range filter
      const logDate = new Date(log.timestamp);
      const now = new Date();
      const daysAgo = parseInt(filters.dateRange) || 7;
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      if (logDate < cutoffDate) {
        return false;
      }

      return true;
    });
  }, [logs, filters]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl font-bold text-white">Audit Logs</h2>
      </div>

      {/* Filters */}
      <CinematicCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-white/60" />
          <h3 className="text-sm font-semibold text-white/80">Filters</h3>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="text-white/60 text-sm mb-2 block">User</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-white/40" />
              <Input
                value={filters.searchUser}
                onChange={(e) => setFilters({ ...filters, searchUser: e.target.value })}
                placeholder="Search user email"
                className="bg-slate-800/50 border-white/10 pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Action</label>
            <Select value={filters.action} onValueChange={(v) => setFilters({ ...filters, action: v })}>
              <SelectTrigger className="bg-slate-800/50 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="created_test">Created Test</SelectItem>
                <SelectItem value="edited_test">Edited Test</SelectItem>
                <SelectItem value="paused_test">Paused Test</SelectItem>
                <SelectItem value="promoted_test">Promoted Test</SelectItem>
                <SelectItem value="exported_report">Exported Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Resource</label>
            <Select value={filters.resourceType} onValueChange={(v) => setFilters({ ...filters, resourceType: v })}>
              <SelectTrigger className="bg-slate-800/50 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="role">Role</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Date Range</label>
            <Select value={filters.dateRange} onValueChange={(v) => setFilters({ ...filters, dateRange: v })}>
              <SelectTrigger className="bg-slate-800/50 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 Hours</SelectItem>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CinematicCard>

      {/* Logs Table */}
      <CinematicCard className="p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-white/80 font-semibold">User</th>
              <th className="text-left py-3 px-4 text-white/80 font-semibold">Action</th>
              <th className="text-left py-3 px-4 text-white/80 font-semibold">Resource</th>
              <th className="text-left py-3 px-4 text-white/80 font-semibold">Details</th>
              <th className="text-left py-3 px-4 text-white/80 font-semibold">Timestamp</th>
              <th className="text-center py-3 px-4 text-white/80 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, idx) => (
              <motion.tr
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                className="border-b border-white/5 hover:bg-white/5 transition"
              >
                <td className="py-3 px-4">
                  <div className="text-white">{log.user_email}</div>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${ACTION_COLORS[log.action] || 'bg-white/10 text-white/60'}`}>
                    {log.action.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="text-white/60">{log.resource_name}</div>
                  <div className="text-white/40 text-xs">{log.resource_type}</div>
                </td>
                <td className="py-3 px-4 text-white/60 max-w-xs truncate">
                  {log.details}
                </td>
                <td className="py-3 px-4 text-white/60">
                  {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                </td>
                <td className="py-3 px-4 text-center">
                  {log.status === 'success' ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <span className="text-red-400">✗</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-white/60">
            No audit logs found
          </div>
        )}
      </CinematicCard>
    </motion.div>
  );
}