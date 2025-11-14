import { useState, useEffect, useRef } from "react";
import { agentSDK } from "@/agents";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Bot, User as UserIcon, Minimize2, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CopilotChat({ minimized = false, onMinimize, onClose }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(minimized);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeConversation();
  }, []);

  useEffect(() => {
    if (conversation) {
      const unsubscribe = agentSDK.subscribeToConversation(
        conversation.id,
        (data) => {
          setMessages(data.messages || []);
          scrollToBottom();
        }
      );
      return () => unsubscribe();
    }
  }, [conversation]);

  const initializeConversation = async () => {
    try {
      const convs = await agentSDK.listConversations({
        agent_name: "Copilot"
      });
      
      if (convs.length > 0) {
        setConversation(convs[0]);
      } else {
        const conv = await agentSDK.createConversation({
          agent_name: "Copilot",
          metadata: {
            name: "Copilot Session",
            description: "In-app assistant conversation"
          }
        });
        setConversation(conv);
      }
    } catch (error) {
      console.error("Error initializing copilot:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !conversation) return;
    
    setLoading(true);
    try {
      await agentSDK.addMessage(conversation, {
        role: "user",
        content: inputMessage
      });
      setInputMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const quickActions = [
    { label: "Show my projects", icon: "📊" },
    { label: "Add a note", icon: "📝" },
    { label: "Draft content", icon: "✍️" },
    { label: "How do I...?", icon: "❓" }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{
          position: 'fixed',
          bottom: isMinimized ? '20px' : '20px',
          right: '20px',
          width: isMinimized ? '320px' : '420px',
          height: isMinimized ? '60px' : '600px',
          backgroundColor: '#1E293B',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 1000,
          transition: 'all 0.3s ease'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #FF7B0020, #00B4D820)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #FF7B00, #00B4D8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={20} style={{ color: '#FFFFFF' }} />
            </div>
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#FFFFFF',
                marginBottom: '2px'
              }}>
                Copilot
              </h3>
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                Your FlashFusion assistant
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                padding: '4px'
              }}
            >
              {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Bot size={48} style={{ color: '#FF7B00', margin: '0 auto 16px' }} />
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    marginBottom: '8px',
                    color: '#FFFFFF'
                  }}>
                    Hi! I'm Copilot 👋
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    color: '#94A3B8',
                    marginBottom: '20px',
                    lineHeight: '1.5'
                  }}>
                    I can help you navigate FlashFusion, manage projects, draft content, and answer questions.
                  </p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px'
                  }}>
                    {quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInputMessage(action.label)}
                        style={{
                          padding: '10px',
                          background: 'rgba(255, 123, 0, 0.1)',
                          border: '1px solid rgba(255, 123, 0, 0.3)',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          justifyContent: 'center'
                        }}
                      >
                        <span>{action.icon}</span>
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                      flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: msg.role === 'user' 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'linear-gradient(135deg, #FF7B00, #00B4D8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {msg.role === 'user' ? (
                        <UserIcon size={16} style={{ color: '#FFFFFF' }} />
                      ) : (
                        <Bot size={16} style={{ color: '#FFFFFF' }} />
                      )}
                    </div>
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '12px',
                        background: msg.role === 'user' 
                          ? 'rgba(255, 123, 0, 0.2)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask me anything..."
                  rows={2}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    resize: 'none',
                    borderRadius: '8px'
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={loading || !inputMessage.trim()}
                  style={{
                    background: '#FF7B00',
                    alignSelf: 'flex-end',
                    minWidth: '40px',
                    padding: '10px'
                  }}
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                </Button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}