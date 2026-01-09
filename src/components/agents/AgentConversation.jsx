import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";

export default function AgentConversation({ agents }) {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: 'Welcome to the Agent Orchestrator. You can chat with multiple agents simultaneously. They will collaborate to help you with complex tasks.',
      agents: agents.map(a => a.id)
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedAgents, setSelectedAgents] = useState(agents.map(a => a.id));
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message) => {
      // Simulate multi-agent response
      const responses = [];
      
      for (const agentId of selectedAgents) {
        const agent = agents.find(a => a.id === agentId);
        
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `You are ${agent.name}, a ${agent.role}. Your capabilities include: ${agent.capabilities.join(', ')}.
          
User message: ${message}

Respond helpfully and concisely. If this relates to your expertise, provide specific actionable advice. If it's outside your scope, briefly acknowledge and suggest which agent might help better.

Keep response under 100 words.`,
          response_json_schema: {
            type: "object",
            properties: {
              response: { type: "string" },
              action_suggested: { type: "string" },
              delegate_to: { type: "string" }
            }
          }
        });

        responses.push({
          agentId,
          ...response
        });
      }

      return responses;
    },
    onSuccess: (responses) => {
      responses.forEach(res => {
        setMessages(prev => [...prev, {
          role: 'agent',
          agentId: res.agentId,
          content: res.response,
          action: res.action_suggested,
          delegate: res.delegate_to
        }]);
      });
    }
  });

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, {
      role: 'user',
      content: input
    }]);

    chatMutation.mutate(input);
    setInput('');
  };

  const getAgentColor = (agentId) => agents.find(a => a.id === agentId)?.color || '#6B7280';
  const getAgentName = (agentId) => agents.find(a => a.id === agentId)?.name || agentId;
  const getAgentIcon = (agentId) => agents.find(a => a.id === agentId)?.icon || Bot;

  const toggleAgent = (agentId) => {
    if (selectedAgents.includes(agentId)) {
      if (selectedAgents.length > 1) {
        setSelectedAgents(selectedAgents.filter(id => id !== agentId));
      }
    } else {
      setSelectedAgents([...selectedAgents, agentId]);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden"
         style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}>
      {/* Agent Selector */}
      <div className="p-4 border-b border-white/10">
        <p className="text-xs text-gray-400 mb-2">Active Agents:</p>
        <div className="flex flex-wrap gap-2">
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => toggleAgent(agent.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                selectedAgents.includes(agent.id)
                  ? 'ring-2'
                  : 'opacity-50'
              }`}
              style={{
                background: `${agent.color}20`,
                ringColor: agent.color
              }}
            >
              <agent.icon className="w-4 h-4" style={{ color: agent.color }} />
              <span className="text-xs text-white">{agent.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, idx) => {
            if (msg.role === 'system') {
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-xs">
                    <Sparkles className="w-4 h-4" />
                    {msg.content}
                  </div>
                </motion.div>
              );
            }

            if (msg.role === 'user') {
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-end"
                >
                  <div className="max-w-[70%] flex items-start gap-2">
                    <div className="p-3 rounded-2xl rounded-tr-sm bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm">
                      {msg.content}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </motion.div>
              );
            }

            if (msg.role === 'agent') {
              const AgentIcon = getAgentIcon(msg.agentId);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[70%] flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                         style={{ background: getAgentColor(msg.agentId) }}>
                      <AgentIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: getAgentColor(msg.agentId) }}>
                        {getAgentName(msg.agentId)}
                      </p>
                      <div className="p-3 rounded-2xl rounded-tl-sm bg-white/10 text-white text-sm">
                        {msg.content}
                        
                        {msg.action && (
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <Button size="sm" className="text-xs h-7 bg-white/10">
                              <Sparkles className="w-3 h-3 mr-1" />
                              {msg.action}
                            </Button>
                          </div>
                        )}

                        {msg.delegate && (
                          <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                            <ArrowRight className="w-3 h-3" />
                            Suggest: Ask {msg.delegate}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }

            return null;
          })}
        </AnimatePresence>

        {chatMutation.isPending && (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Agents are collaborating...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask the agents..."
            className="bg-white/5 border-white/10 text-white"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            className="bg-gradient-to-r from-orange-500 to-pink-500"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}