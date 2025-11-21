import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { 
  X, Clock, GitCommit, GitBranch, User, ExternalLink,
  CheckCircle2, XCircle, Circle, Loader2, ChevronRight, ChevronDown,
  Terminal, AlertTriangle, Shield, Share2, MessageCircle
} from "lucide-react";
import CommitInfo from "./CommitInfo";
import QualityResults from "./QualityResults";
import CommentThread from "../collaboration/CommentThread";
import ShareDialog from "../collaboration/ShareDialog";

const easeInOutCubic = [0.4, 0, 0.2, 1];

export default function PipelineRunDetails({ run, repository, onClose }) {
  const [details, setDetails] = useState(null);
  const [qualityChecks, setQualityChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState(null);
  const [expandedStep, setExpandedStep] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    fetchDetails();
  }, [run.id]);

  const fetchDetails = async () => {
    try {
      const result = await base44.functions.invoke('fetchPipelineDetails', {
        repository,
        run_id: run.run_id || run.id
      });
      setDetails(result);

      // Fetch quality checks
      const checks = await base44.entities.QualityCheck.filter({ pipeline_run_id: run.id });
      setQualityChecks(checks);
    } catch (error) {
      console.error('Failed to fetch run details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status, conclusion) => {
    if (status === 'in_progress' || status === 'running') {
      return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
    }
    if (status === 'completed') {
      return conclusion === 'success' 
        ? <CheckCircle2 className="w-5 h-5 text-green-400" />
        : <XCircle className="w-5 h-5 text-red-400" />;
    }
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  const getStatusColor = (status, conclusion) => {
    if (status === 'in_progress' || status === 'running') return 'text-blue-400';
    if (status === 'completed') {
      return conclusion === 'success' ? 'text-green-400' : 'text-red-400';
    }
    return 'text-gray-400';
  };

  const calculateDuration = (start, end) => {
    if (!start) return '—';
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const diff = Math.floor((endTime - startTime) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ ease: easeInOutCubic }}
        className="bg-slate-900 rounded-2xl border border-white/10 max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Pipeline Run #{run.run_number || run.id}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <GitBranch className="w-4 h-4" />
                {run.branch}
              </div>
              <div className="flex items-center gap-1">
                <GitCommit className="w-4 h-4" />
                {run.commit}
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {run.triggeredBy}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowShare(true)}
              className="text-blue-400"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5 text-gray-400" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-white/10 flex gap-4">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-3 text-sm font-semibold transition-colors relative ${
              activeTab === "details" ? "text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Details
            {activeTab === "details" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("discussion")}
            className={`px-4 py-3 text-sm font-semibold transition-colors relative flex items-center gap-2 ${
              activeTab === "discussion" ? "text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Discussion
            {activeTab === "discussion" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
              />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === "discussion" ? (
            <div className="p-6">
              <CommentThread pipelineRunId={run.id} />
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : details ? (
            <div className="p-6 space-y-6">
              {/* Run Overview */}
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 p-6 bg-white/5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Status</p>
                      <div className={`flex items-center gap-2 ${getStatusColor(details.run.status, details.run.conclusion)}`}>
                        {getStatusIcon(details.run.status, details.run.conclusion)}
                        <span className="font-semibold capitalize">
                          {details.run.status === 'completed' ? details.run.conclusion : details.run.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Duration</p>
                      <div className="flex items-center gap-2 text-white">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">{calculateDuration(details.run.created_at, details.run.updated_at)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Trigger</p>
                      <span className="text-white font-semibold capitalize">{details.run.event}</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">View on GitHub</p>
                      <a
                        href={details.run.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-sm">Open</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Commit Details */}
                {run.commit && repository && (
                  <CommitInfo repository={repository} sha={run.commit} />
                )}
              </div>

              {/* Quality Checks */}
              {qualityChecks.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    Quality & Security Checks
                  </h3>
                  <QualityResults checks={qualityChecks} />
                </div>
              )}

              {/* Jobs */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">Jobs</h3>
                {details.jobs.map((job, idx) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-xl border border-white/10 overflow-hidden bg-white/5"
                  >
                    <button
                      onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(job.status, job.conclusion)}
                        <div className="text-left">
                          <p className="text-white font-semibold">{job.name}</p>
                          <p className="text-xs text-gray-400">
                            {calculateDuration(job.started_at, job.completed_at)}
                          </p>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedJob === job.id ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {expandedJob === job.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ ease: easeInOutCubic }}
                          className="border-t border-white/10 overflow-hidden"
                        >
                          <div className="p-4 space-y-3">
                            {/* Steps */}
                            <div className="space-y-2">
                              {job.steps.map((step, stepIdx) => (
                                <div key={stepIdx}>
                                  <button
                                    onClick={() => setExpandedStep(expandedStep === `${job.id}-${step.number}` ? null : `${job.id}-${step.number}`)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      {step.conclusion === 'success' ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                                      ) : step.conclusion === 'failure' ? (
                                        <XCircle className="w-4 h-4 text-red-400" />
                                      ) : step.status === 'in_progress' ? (
                                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-gray-400" />
                                      )}
                                      <span className="text-sm text-white">{step.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-gray-400">
                                        {calculateDuration(step.started_at, step.completed_at)}
                                      </span>
                                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedStep === `${job.id}-${step.number}` ? 'rotate-180' : ''}`} />
                                    </div>
                                  </button>

                                  <AnimatePresence>
                                    {expandedStep === `${job.id}-${step.number}` && step.conclusion === 'failure' && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="ml-10 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                                      >
                                        <div className="flex items-start gap-2">
                                          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                                          <div className="flex-1">
                                            <p className="text-sm font-semibold text-red-400 mb-1">Step Failed</p>
                                            <p className="text-xs text-gray-300">Check the logs below for error details</p>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))}
                            </div>

                            {/* Logs */}
                            {job.logs && job.logs.length > 0 && (
                              <div className="mt-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Terminal className="w-4 h-4 text-gray-400" />
                                  <p className="text-sm font-semibold text-white">Logs</p>
                                </div>
                                <div className="bg-black/40 rounded-lg p-4 max-h-64 overflow-y-auto">
                                  <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                                    {job.logs.join('\n')}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-white">Failed to load pipeline details</p>
            </div>
          )}
        </div>
      </motion.div>

      {showShare && (
        <ShareDialog
          title="Pipeline Run"
          data={{
            run_id: run.id,
            repository,
            commit: run.commit,
            branch: run.branch,
            status: run.status,
            details: details
          }}
          type="pipeline-run"
          onClose={() => setShowShare(false)}
        />
      )}
    </motion.div>
  );
}