import { motion } from "framer-motion";
import { Settings } from "lucide-react";

export default function DocumentationSettings() {
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
        <Settings className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">Settings</h3>
      </div>
      <div className="space-y-3 text-sm text-gray-400">
        <p>• Include code examples</p>
        <p>• Generate API references</p>
        <p>• Add troubleshooting guides</p>
        <p>• Include diagrams</p>
      </div>
    </motion.div>
  );
}