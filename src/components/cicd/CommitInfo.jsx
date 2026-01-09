import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { GitCommit, User, Calendar, FileText, Plus, Minus, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CommitInfo({ repository, sha }) {
  const [commit, setCommit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommit = async () => {
      try {
        const { data } = await base44.functions.invoke('gitIntegration', {
          action: 'get_commit',
          repository,
          sha
        });
        setCommit(data.commit);
      } catch (error) {
        console.error('Failed to fetch commit:', error);
      } finally {
        setLoading(false);
      }
    };

    if (repository && sha) {
      fetchCommit();
    }
  }, [repository, sha]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!commit) {
    return (
      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
        Unable to load commit information
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)",
        backdropFilter: "blur(10px)"
      }}
    >
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitCommit className="w-5 h-5 text-purple-400" />
            <div>
              <h4 className="text-sm font-bold text-white">Commit Details</h4>
              <p className="text-xs text-gray-400 font-mono">{commit.sha.substring(0, 7)}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(commit.url, '_blank')}
            className="text-gray-400 hover:text-white"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="text-sm text-white leading-relaxed">{commit.message}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-xs">
            <User className="w-3 h-3 text-blue-400" />
            <div>
              <p className="text-gray-400">Author</p>
              <p className="text-white font-medium">{commit.author}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3 h-3 text-green-400" />
            <div>
              <p className="text-gray-400">Date</p>
              <p className="text-white">{new Date(commit.date).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-white">{commit.files_changed} files</span>
          </div>
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">+{commit.additions}</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">-{commit.deletions}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}