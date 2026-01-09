import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Bell, CheckCircle2, XCircle, AlertTriangle, MessageCircle, 
  Sparkles, X, ExternalLink
} from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const notificationIcons = {
  run_completed: CheckCircle2,
  run_failed: XCircle,
  comment_mention: MessageCircle,
  optimization_available: Sparkles,
  approval_required: AlertTriangle
};

const notificationColors = {
  run_completed: { icon: "#10B981", bg: "rgba(16, 185, 129, 0.1)" },
  run_failed: { icon: "#EF4444", bg: "rgba(239, 68, 68, 0.1)" },
  comment_mention: { icon: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)" },
  optimization_available: { icon: "#8B5CF6", bg: "rgba(139, 92, 246, 0.1)" },
  approval_required: { icon: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)" }
};

export default function NotificationCenter({ user }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.PipelineNotification.filter({ 
      user_email: user.email 
    }),
    enabled: !!user,
    refetchInterval: 10000 // Poll every 10s
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.PipelineNotification.update(id, { read: true }),
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => 
        base44.entities.PipelineNotification.update(n.id, { read: true })
      ));
    },
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PipelineNotification.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  const handleNotificationClick = (notification) => {
    markReadMutation.mutate(notification.id);
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.created_date) - new Date(a.created_date)
  );

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-10 w-10 p-0 text-gray-300"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-12 w-96 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)",
                backdropFilter: "blur(20px)"
              }}
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Notifications
                  </h3>
                  <p className="text-xs text-gray-400">{unreadCount} unread</p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAllReadMutation.mutate()}
                      className="text-blue-400 text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {sortedNotifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {sortedNotifications.map((notification, idx) => {
                      const Icon = notificationIcons[notification.type] || Bell;
                      const colors = notificationColors[notification.type] || notificationColors.run_completed;

                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className={`rounded-xl p-4 cursor-pointer transition-all ${
                            notification.read 
                              ? 'bg-white/[0.02] hover:bg-white/5' 
                              : 'bg-white/5 hover:bg-white/10 border border-white/10'
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: colors.bg }}
                            >
                              <Icon className="w-5 h-5" style={{ color: colors.icon }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="text-sm font-semibold text-white">{notification.title}</h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mb-2 leading-relaxed">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {moment(notification.created_date).fromNow()}
                                </span>
                                {notification.link && (
                                  <ExternalLink className="w-3 h-3 text-blue-400" />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMutation.mutate(notification.id);
                              }}
                              className="h-7 text-xs text-red-400"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Dismiss
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}