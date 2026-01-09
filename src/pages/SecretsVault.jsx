import { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, RefreshCw, AlertTriangle, Clock, Eye, 
  Database, History, Plus
} from "lucide-react";
import SecretsList from "../components/secrets/SecretsList";
import SecretRotation from "../components/secrets/SecretRotation";
import SecretAuditLog from "../components/secrets/SecretAuditLog";
import ExternalVaultIntegration from "../components/secrets/ExternalVaultIntegration";

export default function SecretsVaultPage() {
  const [showCreate, setShowCreate] = useState(false);

  const { data: secrets = [], isLoading, refetch } = useQuery({
    queryKey: ['secrets'],
    queryFn: () => base44.entities.Secret.list('-created_date')
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['secretAuditLogs'],
    queryFn: () => base44.entities.AuditLog.filter({ entity_type: 'Secret' }, '-created_date', 100)
  });

  const { data: environments = [] } = useQuery({
    queryKey: ['environments'],
    queryFn: () => base44.entities.Environment.list()
  });

  const stats = {
    total: secrets.length,
    expiringSoon: secrets.filter(s => {
      if (!s.expires_at) return false;
      const daysUntil = Math.floor((new Date(s.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 30 && daysUntil >= 0;
    }).length,
    needsRotation: secrets.filter(s => {
      if (!s.last_rotated) return true;
      const daysSince = Math.floor((new Date() - new Date(s.last_rotated)) / (1000 * 60 * 60 * 24));
      return daysSince >= 90;
    }).length,
    recentAccess: auditLogs.filter(l => {
      const hoursSince = (new Date() - new Date(l.created_date)) / (1000 * 60 * 60);
      return hoursSince <= 24;
    }).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Secrets Vault
            </h1>
            <p className="text-gray-400">Enterprise-grade secrets management with external vault integration</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Secret
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Secrets", value: stats.total, icon: Key, color: "#8B5CF6" },
            { label: "Expiring Soon", value: stats.expiringSoon, icon: Clock, color: "#F59E0B", alert: stats.expiringSoon > 0 },
            { label: "Needs Rotation", value: stats.needsRotation, icon: RefreshCw, color: "#EF4444", alert: stats.needsRotation > 0 },
            { label: "24h Access Events", value: stats.recentAccess, icon: Eye, color: "#00B4D8" }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-xl border p-6 ${stat.alert ? 'border-red-500/30' : 'border-white/10'}`}
              style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                {stat.alert && <AlertTriangle className="w-4 h-4 text-red-400" />}
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="secrets" className="w-full">
          <TabsList className="bg-white/5 mb-4">
            <TabsTrigger value="secrets" className="data-[state=active]:bg-purple-500/20">
              <Key className="w-4 h-4 mr-2" />
              Secrets
            </TabsTrigger>
            <TabsTrigger value="rotation" className="data-[state=active]:bg-purple-500/20">
              <RefreshCw className="w-4 h-4 mr-2" />
              Rotation Policies
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-purple-500/20">
              <History className="w-4 h-4 mr-2" />
              Audit Log
            </TabsTrigger>
            <TabsTrigger value="vaults" className="data-[state=active]:bg-purple-500/20">
              <Database className="w-4 h-4 mr-2" />
              External Vaults
            </TabsTrigger>
          </TabsList>

          <TabsContent value="secrets">
            <SecretsList 
              secrets={secrets} 
              environments={environments}
              showCreate={showCreate}
              onCloseCreate={() => setShowCreate(false)}
            />
          </TabsContent>

          <TabsContent value="rotation">
            <SecretRotation secrets={secrets} />
          </TabsContent>

          <TabsContent value="audit">
            <SecretAuditLog logs={auditLogs} secrets={secrets} />
          </TabsContent>

          <TabsContent value="vaults">
            <ExternalVaultIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}