import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare, Send, Bot, ArrowRight, Clock, CheckCircle2,
  AlertCircle, Loader2, Radio, Filter, Zap
} from "lucide-react";

const MESSAGE_TYPE_CONFIG = {
  request: { color: '#00B4D8', icon: ArrowRight, label: 'Request' },
  response: { color: '#10B981', icon: CheckCircle2, label: 'Response' },
  broadcast: { color: '#F59E0B', icon: Radio, label: 'Broadcast' },
  handoff: { color: '#8B5CF6', icon: Zap, label: 'Handoff' },
  status_update: { color: '#6B7280', icon: Clock, label: 'Status' },
  error: { color: '#EF4444', icon: AlertCircle, label: 'Error' },
  completion: { color: '#10B981', icon: CheckCircle2, label: 'Complete' }
};

export default function AgentCommunicationPanel({ collaborationId, agents = [] }) {
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [selectedSender, setSelectedSender] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['agentMessages', collaborationId],
    queryFn: () => collaborationId 
      ? base44.entities.AgentMessage?.filter?.({ collaboration_id: collaborationId }, '-created_date', 100) || []
      : [],
    refetchInterval: 2000
  });

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.AgentMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['agentMessages', collaborationId]);
      setNewMessage('');
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const filteredMessages = messages.filter(m => {
    if (filter === 'all') return true;
    return m.message_type === filter;
  }).reverse();

  const getAgentInfo = (agentId) => {
    return agents.find(a => a.id === agentId) || { name: 'Unknown', color: '#6B7280' };
  };

  const handleSend = () => {
    if (!newMessage.trim() || !selectedSender) return;
    
    sendMutation.mutate({
      collaboration_id: collaborationId,
      sender_agent_id: selectedSender,
      sender_agent_name: getAgentInfo(selectedSender).name,
      recipient_agent_id: selectedRecipient,
      recipient_agent_name: selectedRecipient ? getAgentInfo(selectedRecipient).name : null,
      message_type: selectedRecipient ? 'request' : 'broadcast',
      priority: 'normal',
      content: newMessage,
      status: 'pending'
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-orange-400" />
          Agent Communication
        </h3>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'ghost'}
            onClick={() => setFilter('all')}
            className="h-7 px-2 text-xs"
          >
            All
          </Button>
          {Object.entries(MESSAGE_TYPE_CONFIG).slice(0, 4).map(([type, config]) => (
            <Button
              key={type}
              size="sm"
              variant={filter === type ? 'default' : 'ghost'}
              onClick={() => setFilter(type)}
              className="h-7 px-2 text-xs"
              style={filter === type ? { background: config.color } : {}}
            >
              {config.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          <AnimatePresence>
            {filteredMessages.map((message, idx) => {
              const sender = getAgentInfo(message.sender_agent_id);
              const recipient = message.recipient_agent_id ? getAgentInfo(message.recipient_agent_id) : null;
              const typeConfig = MESSAGE_TYPE_CONFIG[message.message_type] || MESSAGE_TYPE_CONFIG.request;
              const TypeIcon = typeConfig.icon;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.02 }}
                  className="rounded-lg border border-white/10 overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${typeConfig.color}08 0%, rgba(30, 41, 59, 0.9) 100%)` }}
                >
                  {/* Message Header */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center"
                           style={{ background: `${sender.color}30` }}>
                        <Bot className="w-3 h-3" style={{ color: sender.color }} />
                      </div>
                      <span className="text-sm font-medium text-white">{message.sender_agent_name || sender.name}</span>
                      
                      {recipient && (
                        <>
                          <ArrowRight className="w-3 h-3 text-gray-500" />
                          <div className="w-6 h-6 rounded-full flex items-center justify-center"
                               style={{ background: `${recipient.color}30` }}>
                            <Bot className="w-3 h-3" style={{ color: recipient.color }} />
                          </div>
                          <span className="text-sm text-gray-400">{message.recipient_agent_name || recipient.name}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge 
                        className="text-xs border"
                        style={{ background: `${typeConfig.color}20`, color: typeConfig.color, borderColor: `${typeConfig.color}30` }}
                      >
                        <TypeIcon className="w-3 h-3 mr-1" />
                        {typeConfig.label}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_date).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="p-3">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{message.content}</p>
                    
                    {message.structured_data && (
                      <pre className="mt-2 p-2 rounded bg-black/30 text-xs text-gray-400 overflow-x-auto">
                        {JSON.stringify(message.structured_data, null, 2)}
                      </pre>
                    )}

                    {message.metadata?.latency_ms && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {message.metadata.latency_ms}ms
                        {message.metadata.tokens_used && (
                          <span>• {message.metadata.tokens_used} tokens</span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredMessages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No messages yet</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Compose */}
      {collaborationId && agents.length > 0 && (
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex gap-2">
            <select
              value={selectedSender || ''}
              onChange={(e) => setSelectedSender(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            >
              <option value="">From Agent...</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <select
              value={selectedRecipient || ''}
              onChange={(e) => setSelectedRecipient(e.target.value || null)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            >
              <option value="">Broadcast</option>
              {agents.filter(a => a.id !== selectedSender).map(a => (
                <option key={a.id} value={a.id}>To: {a.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="bg-white/5 border-white/10 text-white flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || !selectedSender || sendMutation.isPending}
              className="bg-gradient-to-r from-orange-500 to-pink-500"
            >
              {sendMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}