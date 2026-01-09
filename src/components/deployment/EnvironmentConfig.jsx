import { motion } from "framer-motion";
import { Settings, Server, Globe } from "lucide-react";

export default function EnvironmentConfig({ environment }) {
  const configs = {
    development: { icon: Settings, color: "#00B4D8", replicas: 1 },
    staging: { icon: Server, color: "#F59E0B", replicas: 2 },
    production: { icon: Globe, color: "#10B981", replicas: 3 }
  };

  const config = configs[environment];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 p-6"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
        backdropFilter: "blur(20px)"
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}20` }}>
          <config.icon className="w-5 h-5" style={{ color: config.color }} />
        </div>
        <h3 className="text-lg font-bold text-white capitalize">{environment} Config</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between py-2 border-b border-white/10">
          <span className="text-sm text-gray-400">Replicas</span>
          <span className="text-sm text-white">{config.replicas}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/10">
          <span className="text-sm text-gray-400">Auto-scaling</span>
          <span className="text-sm text-green-400">Enabled</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/10">
          <span className="text-sm text-gray-400">Health checks</span>
          <span className="text-sm text-green-400">Active</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-sm text-gray-400">SSL</span>
          <span className="text-sm text-green-400">Enabled</span>
        </div>
      </div>
    </motion.div>
  );
}