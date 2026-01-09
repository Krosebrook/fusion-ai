import { useState } from "react";
import { motion } from "framer-motion";
import { History, Eye, RefreshCw, Trash2, Edit2, Filter, Download, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function SecretAuditLog({ logs, secrets }) {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const actionIcons = {
    read: Eye,
    update: Edit2,
    delete: Trash2,
    create: RefreshCw
  };

  const actionColors = {
    read: '#00B4D8',
    update: '#F59E0B',
    delete: '#EF4444',
    create: '#10B981'
  };

  const eventTypes = {
    secret_viewed: 'Viewed',
    secret_copied: 'Copied',
    secret_rotated: 'Rotated',
    secret_created: 'Created',
    secret_updated: 'Updated',
    secret_deleted: 'Deleted'
  };

  const filteredLogs = logs
    .filter(log => {
      if (filter === "all") return true;
      return log.action === filter;
    })
    .filter(log => {
      if (!searchTerm) return true;
      const secret = secrets.find(s => s.id === log.entity_id);
      return secret?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Event', 'Secret', 'Actor', 'Status'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.created_date).toISOString(),
        eventTypes[log.event_type] || log.action,
        secrets.find(s => s.id === log.entity_id)?.name || log.entity_id,
        log.actor_id,
        log.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secret-audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-4"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10">
              <SelectItem value="all" className="text-white">All Actions</SelectItem>
              <SelectItem value="read" className="text-white">Views</SelectItem>
              <SelectItem value="update" className="text-white">Updates</SelectItem>
              <SelectItem value="delete" className="text-white">Deletes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by secret name..."
          className="w-64 bg-white/5 border-white/10 text-white"
        />

        <div className="flex-1" />

        <Button
          onClick={exportLogs}
          variant="outline"
          className="border-white/10 text-gray-300"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </motion.div>

      {/* Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Events', value: logs.length, color: '#8B5CF6' },
          { label: 'Views', value: logs.filter(l => l.action === 'read').length, color: '#00B4D8' },
          { label: 'Updates', value: logs.filter(l => l.action === 'update').length, color: '#F59E0B' },
          { label: 'Deletions', value: logs.filter(l => l.action === 'delete').length, color: '#EF4444' }
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Audit Log Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-purple-400" />
          Access History
        </h3>

        <div className="space-y-2">
          {filteredLogs.map((log, idx) => {
            const secret = secrets.find(s => s.id === log.entity_id);
            const Icon = actionIcons[log.action] || Eye;
            const color = actionColors[log.action] || '#6B7280';

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                     style={{ background: `${color}20` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">
                      {eventTypes[log.event_type] || log.action}
                    </span>
                    <span className="text-sm font-mono text-purple-400">
                      {secret?.name || 'Unknown'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    by {log.actor_id} • {new Date(log.created_date).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {log.status === 'success' ? (
                    <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                      Success
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">
                      Failed
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No audit logs found</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Security Alerts */}
      {logs.some(l => l.status === 'failed') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-red-500/30 p-6"
          style={{ background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Security Alerts
          </h3>
          <p className="text-sm text-gray-400">
            {logs.filter(l => l.status === 'failed').length} failed access attempts detected. 
            Review unauthorized access attempts and take appropriate action.
          </p>
        </motion.div>
      )}
    </div>
  );
}