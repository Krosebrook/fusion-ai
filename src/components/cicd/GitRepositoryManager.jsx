import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { Github, GitBranch, Lock, Search, RefreshCw, ExternalLink, CheckCircle2 } from "lucide-react";

export default function GitRepositoryManager({ onSelectRepository }) {
  const [repositories, setRepositories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRepositories = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('gitIntegration', {
        action: 'list_repos',
        provider: 'github'
      });
      setRepositories(data.repositories);
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async (repoName) => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('gitIntegration', {
        action: 'list_branches',
        repository: repoName
      });
      setBranches(data.branches);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRepo = async (repo) => {
    setSelectedRepo(repo);
    await fetchBranches(repo.name);
  };

  const handleConfirm = () => {
    if (selectedRepo && branches.length > 0) {
      onSelectRepository({
        repository_id: selectedRepo.id,
        repository_name: selectedRepo.name,
        repository_url: selectedRepo.url,
        default_branch: selectedRepo.default_branch,
        available_branches: branches.map(b => b.name)
      });
    }
  };

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Github className="w-5 h-5 text-orange-400" />
            Connect Git Repository
          </h3>
          <p className="text-sm text-gray-400 mt-1">Select a repository to configure your pipeline</p>
        </div>
        <Button
          onClick={fetchRepositories}
          disabled={loading}
          className="bg-blue-500/20 text-blue-400 border border-blue-500/30"
        >
          {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Github className="w-4 h-4 mr-2" />}
          {repositories.length > 0 ? 'Refresh' : 'Connect GitHub'}
        </Button>
      </div>

      {repositories.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search repositories..."
            className="bg-white/5 border-white/10 text-white pl-10"
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Repositories List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Repositories ({filteredRepos.length})</p>
          {filteredRepos.map((repo, idx) => (
            <motion.button
              key={repo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => handleSelectRepo(repo)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedRepo?.id === repo.id
                  ? 'border-orange-500/50 bg-orange-500/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-white text-sm">{repo.name.split('/')[1]}</span>
                </div>
                {repo.private && <Lock className="w-3 h-3 text-yellow-400" />}
              </div>
              <p className="text-xs text-gray-400 mb-2 line-clamp-2">{repo.description || 'No description'}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <GitBranch className="w-3 h-3" />
                <span>{repo.default_branch}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Branches List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            Branches {branches.length > 0 && `(${branches.length})`}
          </p>
          {!selectedRepo ? (
            <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
              Select a repository to view branches
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : (
            branches.map((branch, idx) => (
              <motion.div
                key={branch.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-white font-medium">{branch.name}</span>
                  </div>
                  {branch.protected && (
                    <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                      Protected
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 font-mono">{branch.sha.substring(0, 7)}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {selectedRepo && branches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-green-500/10 border border-green-500/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm font-semibold text-white">Repository Selected</p>
                <p className="text-xs text-gray-400">{selectedRepo.name} • {branches.length} branches available</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(selectedRepo.url, '_blank')}
                className="text-gray-400"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleConfirm}
                className="bg-gradient-to-r from-green-500 to-emerald-500"
              >
                Use This Repository
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}