import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Bell, GitBranch, AtSign, Send, MoreVertical, Smile, Heart, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Utility function for pluralization
const pluralize = (count, singular, plural) => {
  return count === 1 ? singular : (plural || `${singular}s`);
};

export default function CollaborationWorkspace() {
  const [activeWorkspace, setActiveWorkspace] = useState('project-alpha');
  const [commentText, setCommentText] = useState('');
  const [unreadCount, setUnreadCount] = useState(3);

  const workspaces = [
    { id: 'project-alpha', name: 'Project Alpha', members: 8 },
    { id: 'project-beta', name: 'Project Beta', members: 5 },
    { id: 'project-gamma', name: 'Project Gamma', members: 12 },
  ];

  const onlineUsers = [
    { id: 1, name: 'John Doe', avatar: '', status: 'active', currentPage: 'Dashboard' },
    { id: 2, name: 'Jane Smith', avatar: '', status: 'active', currentPage: 'Code Editor' },
    { id: 3, name: 'Bob Johnson', avatar: '', status: 'away', currentPage: 'Settings' },
    { id: 4, name: 'Alice Williams', avatar: '', status: 'active', currentPage: 'Dashboard' },
  ];

  const comments = [
    {
      id: 1,
      user: 'Jane Smith',
      avatar: '',
      content: 'Great work on the new feature! @JohnDoe can you review the API integration?',
      timestamp: '5 minutes ago',
      replies: 2,
      reactions: { thumbsUp: 3, heart: 1 }
    },
    {
      id: 2,
      user: 'Bob Johnson',
      avatar: '',
      content: 'I found a small bug in the authentication flow. Should we create a ticket?',
      timestamp: '15 minutes ago',
      replies: 1,
      reactions: { thumbsUp: 2 }
    },
    {
      id: 3,
      user: 'Alice Williams',
      avatar: '',
      content: 'Updated the deployment pipeline. All tests are passing now! 🎉',
      timestamp: '1 hour ago',
      replies: 0,
      reactions: { heart: 5, thumbsUp: 4 }
    },
  ];

  const activityTimeline = [
    { id: 1, user: 'Jane Smith', action: 'edited', target: 'App.jsx', timestamp: '2 minutes ago' },
    { id: 2, user: 'John Doe', action: 'commented on', target: 'Pull Request #42', timestamp: '10 minutes ago' },
    { id: 3, user: 'Bob Johnson', action: 'created', target: 'New Component', timestamp: '25 minutes ago' },
    { id: 4, user: 'Alice Williams', action: 'merged', target: 'Feature Branch', timestamp: '1 hour ago' },
  ];

  const notifications = [
    { id: 1, type: 'mention', message: 'Jane Smith mentioned you in a comment', unread: true },
    { id: 2, type: 'reply', message: 'Bob Johnson replied to your comment', unread: true },
    { id: 3, type: 'activity', message: 'Alice Williams updated the project', unread: true },
  ];

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-400' : status === 'away' ? 'bg-yellow-400' : 'bg-gray-400';
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSendComment = () => {
    if (commentText.trim()) {
      console.log('Sending comment:', commentText);
      setCommentText('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Collaboration Workspace
                </h1>
                <p className="text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Work together in real-time with your team
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select value={activeWorkspace} onValueChange={setActiveWorkspace} data-b44-sync="true">
                <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 text-white">
                  <GitBranch className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {workspaces.map(workspace => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.name} ({workspace.members})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <Button
                  variant="outline"
                  className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                  data-b44-sync="true"
                >
                  <Bell className="w-4 h-4" />
                </Button>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Canvas Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Live Presence */}
            <Card className="bg-slate-800 border-slate-700" data-b44-sync="true">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Online Team Members ({onlineUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {onlineUsers.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-slate-700/50 border border-slate-600"
                      data-b44-sync="true"
                    >
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-slate-800`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.currentPage}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="bg-slate-800 border-slate-700" data-b44-sync="true">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Discussion & Comments
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Collaborate and share feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-lg bg-slate-700/50 border border-slate-600"
                        data-b44-sync="true"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={comment.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                                {getInitials(comment.user)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-white">{comment.user}</p>
                              <p className="text-xs text-slate-400">{comment.timestamp}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-400 hover:text-white"
                            data-b44-sync="true"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <p className="text-slate-300 text-sm mb-3">{comment.content}</p>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-400 hover:text-white h-7 px-2"
                              data-b44-sync="true"
                            >
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              {comment.reactions.thumbsUp}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-400 hover:text-white h-7 px-2"
                              data-b44-sync="true"
                            >
                              <Heart className="w-3 h-3 mr-1" />
                              {comment.reactions.heart}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-400 hover:text-white h-7 px-2"
                              data-b44-sync="true"
                            >
                              <Smile className="w-3 h-3 mr-1" />
                            </Button>
                          </div>
                          <Separator orientation="vertical" className="h-4 bg-slate-600" />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-400 hover:text-white h-7 px-2"
                            data-b44-sync="true"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {comment.replies} {pluralize(comment.replies, 'reply', 'replies')}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>

                <Separator className="my-4 bg-slate-700" />

                {/* Comment Input */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Share your thoughts or @mention a teammate..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white resize-none"
                    rows={3}
                    data-b44-sync="true"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-white"
                        data-b44-sync="true"
                      >
                        <AtSign className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-white"
                        data-b44-sync="true"
                      >
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={handleSendComment}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                      data-b44-sync="true"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Notifications */}
            <Card className="bg-slate-800 border-slate-700" data-b44-sync="true">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge className="bg-orange-500 text-white ml-auto">
                      {unreadCount}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          notification.unread
                            ? 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20'
                            : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                        }`}
                        data-b44-sync="true"
                      >
                        <div className="flex items-start gap-2">
                          {notification.unread && (
                            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                          )}
                          <p className="text-sm text-slate-300 flex-1">{notification.message}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card className="bg-slate-800 border-slate-700" data-b44-sync="true">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {activityTimeline.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-3"
                        data-b44-sync="true"
                      >
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-medium">
                            {getInitials(activity.user)}
                          </div>
                          {index < activityTimeline.length - 1 && (
                            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-slate-700" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm text-white">
                            <span className="font-medium text-cyan-400">{activity.user}</span>
                            {' '}{activity.action}{' '}
                            <span className="text-slate-300">{activity.target}</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-1">{activity.timestamp}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
