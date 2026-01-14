/**
 * Prompt Review Workflow - Code review enforcement for prompts
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, Clock, GitPullRequest, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { toast } from 'sonner';

export function PromptReviewWorkflow() {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [reviewComment, setReviewComment] = useState('');

  const { data: versions = [] } = useQuery({
    queryKey: ['prompt-versions-pending-review'],
    queryFn: () => base44.entities.PromptTemplateVersion?.list?.('-created_at', 50) || []
  });

  const pendingVersions = versions.filter(v => !v.reviewed_at);

  const submitReview = async (approved) => {
    if (!selectedVersion) return;

    try {
      await base44.entities.PromptTemplateVersion.update(selectedVersion.id, {
        reviewed_at: new Date().toISOString(),
        review_status: approved ? 'approved' : 'rejected',
        review_comment: reviewComment,
        reviewed_by: (await base44.auth.me()).email
      });

      toast.success(`Review ${approved ? 'approved' : 'rejected'}`);
      setSelectedVersion(null);
      setReviewComment('');
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pending Reviews List */}
      <CinematicCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <GitPullRequest className="w-5 h-5 text-orange-400" />
          <h2 className="text-xl font-bold text-white">Pending Reviews</h2>
          <Badge className="ml-auto bg-orange-500/20 text-orange-300">
            {pendingVersions.length}
          </Badge>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {pendingVersions.map((version, idx) => (
            <motion.button
              key={version.id}
              onClick={() => setSelectedVersion(version)}
              whileHover={{ x: 4 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedVersion?.id === version.id
                  ? 'bg-orange-600/20 border border-orange-500'
                  : 'bg-white/5 border border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-orange-400" />
                <p className="text-sm text-white font-semibold">
                  v{version.version_number}
                </p>
              </div>
              <p className="text-xs text-white/60 truncate">{version.change_summary}</p>
              <p className="text-xs text-white/40 mt-1">
                {new Date(version.created_at).toLocaleDateString()}
              </p>
            </motion.button>
          ))}

          {pendingVersions.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-white/60 text-sm">All caught up!</p>
            </div>
          )}
        </div>
      </CinematicCard>

      {/* Review Details */}
      {selectedVersion && (
        <CinematicCard className="lg:col-span-2 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                Review v{selectedVersion.version_number}
              </h2>
              <Badge className="bg-blue-500/20 text-blue-300">
                {selectedVersion.category}
              </Badge>
            </div>
            <p className="text-white/60">{selectedVersion.change_summary}</p>
          </div>

          {/* Template Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">Template</h3>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 font-mono text-sm text-white/80 max-h-[300px] overflow-y-auto">
              {selectedVersion.template}
            </div>
          </div>

          {/* Variables */}
          {selectedVersion.variables?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Variables</h3>
              <div className="grid grid-cols-2 gap-2">
                {selectedVersion.variables.map((variable, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-white/5 border border-white/10"
                  >
                    <p className="text-white font-mono text-sm">{variable.name}</p>
                    <p className="text-white/60 text-xs">{variable.type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Form */}
          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-sm mb-2 block">Review Comments</label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Add your review comments..."
                className="bg-white/5 border-white/10 text-white min-h-[120px]"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => submitReview(true)}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => submitReview(false)}
                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Request Changes
              </Button>
            </div>
          </div>
        </CinematicCard>
      )}
    </div>
  );
}