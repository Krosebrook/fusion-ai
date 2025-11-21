import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  MessageCircle, Send, User, Reply, CheckCircle2, MoreVertical,
  Trash2, Edit2, AtSign, Paperclip, Clock
} from "lucide-react";
import moment from "moment";

export default function CommentThread({ pipelineRunId }) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const textareaRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['pipelineComments', pipelineRunId],
    queryFn: () => base44.entities.PipelineComment.filter({ 
      pipeline_run_id: pipelineRunId 
    }),
    refetchInterval: 5000 // Real-time updates every 5s
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PipelineComment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pipelineComments']);
      setNewComment("");
      setReplyTo(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PipelineComment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pipelineComments']);
      setEditingId(null);
      setEditContent("");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PipelineComment.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['pipelineComments'])
  });

  const handleSubmit = () => {
    if (!newComment.trim() || !currentUser) return;

    createMutation.mutate({
      pipeline_run_id: pipelineRunId,
      user_email: currentUser.email,
      user_name: currentUser.full_name || currentUser.email.split('@')[0],
      content: newComment,
      parent_id: replyTo?.id || null,
      mentions: extractMentions(newComment)
    });
  };

  const handleEdit = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = (id) => {
    updateMutation.mutate({
      id,
      data: { content: editContent }
    });
  };

  const extractMentions = (text) => {
    const regex = /@(\w+)/g;
    const matches = text.match(regex);
    return matches ? matches.map(m => m.substring(1)) : [];
  };

  const organizeComments = () => {
    const topLevel = comments.filter(c => !c.parent_id);
    return topLevel.map(parent => ({
      ...parent,
      replies: comments.filter(c => c.parent_id === parent.id)
    }));
  };

  const organized = organizeComments();

  return (
    <div 
      className="rounded-2xl border border-white/10 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
        backdropFilter: "blur(20px)"
      }}
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Discussion
            </h3>
            <p className="text-xs text-gray-400">{comments.length} comments</p>
          </div>
        </div>

        {/* New Comment */}
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <Reply className="w-4 h-4" />
              Replying to {replyTo.user_name}
            </div>
            <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>
              Cancel
            </Button>
          </motion.div>
        )}

        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts... Use @username to mention"
            className="bg-white/5 border-white/10 text-white resize-none"
            rows={3}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!newComment.trim() || createMutation.isPending}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            >
              <Send className="w-4 h-4 mr-2" />
              {replyTo ? 'Reply' : 'Comment'}
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading comments...</div>
        ) : organized.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          <AnimatePresence>
            {organized.map((comment, idx) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="space-y-3"
              >
                {/* Parent Comment */}
                <div className="rounded-xl border border-white/10 p-4 bg-white/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{comment.user_name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {moment(comment.created_date).fromNow()}
                        </div>
                      </div>
                    </div>
                    {currentUser?.email === comment.user_email && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(comment)}
                          className="h-8 w-8 p-0 text-gray-400"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(comment.id)}
                          className="h-8 w-8 p-0 text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveEdit(comment.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-300 mb-3 leading-relaxed">{comment.content}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setReplyTo(comment)}
                        className="text-blue-400 hover:text-blue-300 h-7 px-2"
                      >
                        <Reply className="w-3 h-3 mr-1" />
                        Reply
                      </Button>
                    </>
                  )}
                </div>

                {/* Replies */}
                {comment.replies?.length > 0 && (
                  <div className="ml-12 space-y-3">
                    {comment.replies.map((reply) => (
                      <motion.div
                        key={reply.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded-lg border border-white/10 p-3 bg-white/[0.02]"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                              <User className="w-3 h-3 text-white" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white">{reply.user_name}</p>
                              <p className="text-xs text-gray-400">{moment(reply.created_date).fromNow()}</p>
                            </div>
                          </div>
                          {currentUser?.email === reply.user_email && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteMutation.mutate(reply.id)}
                              className="h-6 w-6 p-0 text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{reply.content}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}