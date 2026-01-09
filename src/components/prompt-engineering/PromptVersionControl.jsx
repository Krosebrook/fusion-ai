import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch, GitCommit, Clock, User, RotateCcw,
  CheckCircle2, Star, Eye, ArrowRight,
  Diff, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const VERSION_TAG_CONFIG = {
  draft: { color: "#6B7280", label: "Draft" },
  stable: { color: "#10B981", label: "Stable" },
  deprecated: { color: "#F59E0B", label: "Deprecated" },
  archived: { color: "#EF4444", label: "Archived" }
};

export default function PromptVersionControl({ templateId, onSelectVersion }) {
  const queryClient = useQueryClient();
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [commitMessage, setCommitMessage] = useState("");

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['promptVersions', templateId],
    queryFn: () => base44.entities.PromptTemplateVersion.filter(
      { prompt_template_id: templateId },
      '-created_date',
      50
    ),
    enabled: !!templateId
  });

  const { data: template } = useQuery({
    queryKey: ['promptTemplate', templateId],
    queryFn: () => base44.entities.PromptTemplate.filter({ id: templateId }),
    enabled: !!templateId,
    select: (data) => data[0]
  });

  const createVersionMutation = useMutation({
    mutationFn: async ({ message }) => {
      const latestVersion = versions[0];
      const newVersionNumber = latestVersion 
        ? incrementVersion(latestVersion.version_number)
        : "1.0.0";

      const diff = latestVersion 
        ? calculateDiff(latestVersion.template_snapshot, template)
        : { added: ["Initial version"], removed: [], modified: [] };

      return base44.entities.PromptTemplateVersion.create({
        prompt_template_id: templateId,
        version_number: newVersionNumber,
        version_tag: "draft",
        template_snapshot: {
          name: template.name,
          template: template.template,
          variables: template.variables,
          chain_config: template.chain_of_thought,
          llm_settings: template.llm_settings,
          context_injection: template.context_injection
        },
        commit_message: message,
        diff_summary: diff,
        parent_version_id: latestVersion?.id,
        is_active: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['promptVersions', templateId]);
      setShowCommitModal(false);
      setCommitMessage("");
      toast.success("Version committed successfully");
    }
  });

  const promoteVersionMutation = useMutation({
    mutationFn: async ({ versionId, tag }) => {
      // If promoting to stable, demote current stable
      if (tag === "stable") {
        const currentStable = versions.find(v => v.version_tag === "stable");
        if (currentStable) {
          await base44.entities.PromptTemplateVersion.update(currentStable.id, {
            version_tag: "deprecated",
            is_active: false
          });
        }
      }
      
      return base44.entities.PromptTemplateVersion.update(versionId, {
        version_tag: tag,
        is_active: tag === "stable",
        published_at: tag === "stable" ? new Date().toISOString() : undefined
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['promptVersions', templateId]);
      toast.success("Version promoted");
    }
  });

  const restoreVersionMutation = useMutation({
    mutationFn: async (version) => {
      return base44.entities.PromptTemplate.update(templateId, {
        template: version.template_snapshot.template,
        variables: version.template_snapshot.variables,
        chain_of_thought: version.template_snapshot.chain_config,
        llm_settings: version.template_snapshot.llm_settings,
        context_injection: version.template_snapshot.context_injection
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['promptTemplate', templateId]);
      toast.success("Template restored to selected version");
    }
  });

  const toggleVersionForDiff = (version) => {
    if (selectedVersions.find(v => v.id === version.id)) {
      setSelectedVersions(prev => prev.filter(v => v.id !== version.id));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions(prev => [...prev, version]);
    } else {
      setSelectedVersions([selectedVersions[1], version]);
    }
  };

  if (!templateId) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        Select a template to view versions
      </div>
    );
  }

  const activeVersion = versions.find(v => v.is_active);
  const stableVersion = versions.find(v => v.version_tag === "stable");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-purple-400" />
          Version History
        </h3>
        <div className="flex gap-2">
          {selectedVersions.length === 2 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDiffModal(true)}
              className="border-purple-500/30 text-purple-400"
            >
              <Diff className="w-4 h-4 mr-1" />
              Compare
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => setShowCommitModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <GitCommit className="w-4 h-4 mr-1" />
            Commit Version
          </Button>
        </div>
      </div>

      {/* Active Version Banner */}
      {stableVersion && (
        <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <div>
              <span className="text-sm font-medium text-white">Active: v{stableVersion.version_number}</span>
              <p className="text-xs text-gray-400">{stableVersion.commit_message}</p>
            </div>
          </div>
          <Badge className="bg-green-500/20 text-green-400">Production</Badge>
        </div>
      )}

      {/* Version Timeline */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <GitCommit className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No versions yet. Commit your first version!</p>
          </div>
        ) : (
          versions.map((version, idx) => {
            const tagConfig = VERSION_TAG_CONFIG[version.version_tag] || VERSION_TAG_CONFIG.draft;
            const isSelected = selectedVersions.find(v => v.id === version.id);
            
            return (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`relative p-4 rounded-lg border transition-all cursor-pointer group ${
                  isSelected 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-white/10 hover:border-white/20 bg-white/5'
                }`}
                onClick={() => toggleVersionForDiff(version)}
              >
                {/* Timeline connector */}
                {idx < versions.length - 1 && (
                  <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-white/10 -mb-2" />
                )}

                <div className="flex items-start gap-3">
                  {/* Version marker */}
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 ${
                    version.is_active ? 'bg-green-500 border-green-500' : 'border-gray-500'
                  }`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-semibold text-white">
                        v{version.version_number}
                      </span>
                      <Badge 
                        className="text-xs"
                        style={{ 
                          backgroundColor: `${tagConfig.color}20`, 
                          color: tagConfig.color 
                        }}
                      >
                        {tagConfig.label}
                      </Badge>
                      {version.is_active && (
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      )}
                    </div>

                    <p className="text-sm text-gray-300 mb-2">{version.commit_message}</p>

                    {/* Diff summary */}
                    {version.diff_summary && (
                      <div className="flex gap-2 mb-2">
                        {version.diff_summary.added?.length > 0 && (
                          <span className="text-xs text-green-400">+{version.diff_summary.added.length} added</span>
                        )}
                        {version.diff_summary.modified?.length > 0 && (
                          <span className="text-xs text-yellow-400">~{version.diff_summary.modified.length} modified</span>
                        )}
                        {version.diff_summary.removed?.length > 0 && (
                          <span className="text-xs text-red-400">-{version.diff_summary.removed.length} removed</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(version.created_date), "MMM d, HH:mm")}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {version.created_by?.split('@')[0] || 'Unknown'}
                      </span>
                      {version.performance_metrics?.usage_count > 0 && (
                        <span>
                          {version.performance_metrics.usage_count} executions
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                       onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => onSelectVersion?.(version)}
                    >
                      <Eye className="w-3 h-3 text-gray-400" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => restoreVersionMutation.mutate(version)}
                    >
                      <RotateCcw className="w-3 h-3 text-gray-400" />
                    </Button>
                    {version.version_tag !== "stable" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => promoteVersionMutation.mutate({ versionId: version.id, tag: "stable" })}
                      >
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Commit Modal */}
      <AnimatePresence>
        {showCommitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowCommitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-white/10 p-6"
              style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-purple-400" />
                Commit New Version
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Commit Message</label>
                  <Textarea
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Describe what changed in this version..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCommitModal(false)} className="border-white/10">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createVersionMutation.mutate({ message: commitMessage })}
                    disabled={!commitMessage || createVersionMutation.isPending}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    {createVersionMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Commit"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diff Modal */}
      <AnimatePresence>
        {showDiffModal && selectedVersions.length === 2 && (
          <VersionDiffModal
            versionA={selectedVersions[0]}
            versionB={selectedVersions[1]}
            onClose={() => setShowDiffModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function VersionDiffModal({ versionA, versionB, onClose }) {
  const [older, newer] = versionA.created_date < versionB.created_date 
    ? [versionA, versionB] 
    : [versionB, versionA];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-xl border border-white/10"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Diff className="w-5 h-5 text-purple-400" />
            Version Comparison
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <Badge className="bg-red-500/20 text-red-400">v{older.version_number}</Badge>
            <ArrowRight className="w-4 h-4 text-gray-500" />
            <Badge className="bg-green-500/20 text-green-400">v{newer.version_number}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-white/10 max-h-[60vh] overflow-y-auto">
          {/* Older Version */}
          <div className="p-4">
            <div className="mb-3">
              <span className="text-xs text-red-400 font-medium">OLDER: v{older.version_number}</span>
              <p className="text-sm text-gray-400">{older.commit_message}</p>
            </div>
            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap bg-white/5 p-3 rounded">
              {older.template_snapshot?.template || "No content"}
            </pre>
          </div>

          {/* Newer Version */}
          <div className="p-4">
            <div className="mb-3">
              <span className="text-xs text-green-400 font-medium">NEWER: v{newer.version_number}</span>
              <p className="text-sm text-gray-400">{newer.commit_message}</p>
            </div>
            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap bg-white/5 p-3 rounded">
              {newer.template_snapshot?.template || "No content"}
            </pre>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end">
          <Button onClick={onClose} className="bg-white/10">Close</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Helper functions
function incrementVersion(version) {
  const parts = version.split('.').map(Number);
  parts[2] = (parts[2] || 0) + 1;
  return parts.join('.');
}

function calculateDiff(oldSnapshot, newTemplate) {
  const diff = { added: [], removed: [], modified: [] };
  
  if (!oldSnapshot) {
    diff.added.push("Initial template");
    return diff;
  }

  if (oldSnapshot.template !== newTemplate.template) {
    diff.modified.push("Prompt template");
  }

  const oldVars = new Set(oldSnapshot.variables?.map(v => v.name) || []);
  const newVars = new Set(newTemplate.variables?.map(v => v.name) || []);
  
  newVars.forEach(v => {
    if (!oldVars.has(v)) diff.added.push(`Variable: ${v}`);
  });
  
  oldVars.forEach(v => {
    if (!newVars.has(v)) diff.removed.push(`Variable: ${v}`);
  });

  if (JSON.stringify(oldSnapshot.llm_settings) !== JSON.stringify(newTemplate.llm_settings)) {
    diff.modified.push("Model configuration");
  }

  return diff;
}