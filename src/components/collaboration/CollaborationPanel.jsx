import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, UserPlus, Link2, MessageSquare, Share2, 
  MoreVertical, Crown, Eye, Edit3, X, Check, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

const easeInOutCubic = [0.4, 0, 0.2, 1];

export default function CollaborationPanel({ projectId, currentUser }) {
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      user: { name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?img=1", role: "owner" },
      content: "Love the direction we're taking with the new dashboard!",
      timestamp: "2 hours ago",
      resolved: false
    },
    {
      id: 2,
      user: { name: "Mike Ross", avatar: "https://i.pravatar.cc/150?img=2", role: "editor" },
      content: "Should we add more contrast to the CTA buttons?",
      timestamp: "5 hours ago",
      resolved: true
    }
  ]);
  const [newComment, setNewComment] = useState("");

  const collaborators = [
    { 
      id: 1, 
      name: "Sarah Chen", 
      email: "sarah@example.com",
      avatar: "https://i.pravatar.cc/150?img=1", 
      role: "owner",
      status: "online",
      lastActive: "now"
    },
    { 
      id: 2, 
      name: "Mike Ross", 
      email: "mike@example.com",
      avatar: "https://i.pravatar.cc/150?img=2", 
      role: "editor",
      status: "online",
      lastActive: "2m ago"
    },
    { 
      id: 3, 
      name: "Emma Wilson", 
      email: "emma@example.com",
      avatar: "https://i.pravatar.cc/150?img=3", 
      role: "viewer",
      status: "offline",
      lastActive: "1h ago"
    }
  ];

  const handleInvite = () => {
    if (email) {
      console.log("Inviting:", email);
      setEmail("");
      setShowInvite(false);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([{
        id: Date.now(),
        user: { name: currentUser?.full_name || "You", avatar: "", role: "owner" },
        content: newComment,
        timestamp: "Just now",
        resolved: false
      }, ...comments]);
      setNewComment("");
    }
  };

  const getRoleIcon = (role) => {
    if (role === "owner") return <Crown className="w-3 h-3 text-yellow-400" />;
    if (role === "editor") return <Edit3 className="w-3 h-3 text-blue-400" />;
    return <Eye className="w-3 h-3 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Active Collaborators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeInOutCubic }}
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
        }}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Team Members
                </h3>
                <p className="text-xs text-gray-400">{collaborators.length} active</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowInvite(!showInvite)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-sm font-medium shadow-lg shadow-orange-500/30 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Invite
            </motion.button>
          </div>
        </div>

        {/* Invite Form */}
        <AnimatePresence>
          {showInvite && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: easeInOutCubic }}
              className="p-6 bg-white/5 border-b border-white/10"
            >
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleInvite()}
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
                <Button onClick={handleInvite} className="bg-green-500 hover:bg-green-600">
                  <Check className="w-4 h-4" />
                </Button>
                <Button onClick={() => setShowInvite(false)} variant="outline" className="border-white/10">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collaborator List */}
        <div className="p-6 space-y-3">
          {collaborators.map((collab, idx) => (
            <motion.div
              key={collab.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, ease: easeInOutCubic }}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10 border-2 border-white/10">
                    <AvatarImage src={collab.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-pink-500 text-white">
                      {collab.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900",
                    collab.status === "online" ? "bg-green-500" : "bg-gray-500"
                  )} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{collab.name}</span>
                    {getRoleIcon(collab.role)}
                  </div>
                  <p className="text-xs text-gray-400">{collab.email} • {collab.lastActive}</p>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/5 rounded-lg">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="p-6 border-t border-white/10 flex gap-2">
          <Button variant="outline" className="flex-1 border-white/10 text-gray-300 hover:bg-white/5">
            <Link2 className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          <Button variant="outline" className="flex-1 border-white/10 text-gray-300 hover:bg-white/5">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </motion.div>

      {/* Comments Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: easeInOutCubic }}
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
        }}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Comments
              </h3>
              <p className="text-xs text-gray-400">{comments.filter(c => !c.resolved).length} active discussions</p>
            </div>
          </div>
        </div>

        {/* Comment Input */}
        <div className="p-6 border-b border-white/10">
          <div className="flex gap-3">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-pink-500 text-white text-sm">
                {currentUser?.full_name?.split(' ').map(n => n[0]).join('') || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
              {newComment && (
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setNewComment("")} className="border-white/10">
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleAddComment} className="bg-gradient-to-r from-orange-500 to-pink-500">
                    Comment
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comment List */}
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          {comments.map((comment, idx) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "flex gap-3 p-4 rounded-xl transition-all",
                comment.resolved ? "bg-white/5 opacity-60" : "bg-white/10"
              )}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.user.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs">
                  {comment.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{comment.user.name}</span>
                  {getRoleIcon(comment.user.role)}
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {comment.timestamp}
                  </span>
                  {comment.resolved && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                      Resolved
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}