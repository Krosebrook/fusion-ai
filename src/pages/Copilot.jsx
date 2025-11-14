import { useState, useEffect } from "react";
import { agentSDK } from "@/agents";
import { Note } from "@/entities/Note";
import { Contact } from "@/entities/Contact";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bot, Send, Loader2, MessageSquare, FileText, 
  Users, HelpCircle, Zap
} from "lucide-react";

export default function CopilotPage() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    initializeConversation();
    loadData();
  }, []);

  useEffect(() => {
    if (conversation) {
      const unsubscribe = agentSDK.subscribeToConversation(
        conversation.id,
        (data) => {
          setMessages(data.messages || []);
        }
      );
      return () => unsubscribe();
    }
  }, [conversation]);

  const initializeConversation = async () => {
    try {
      const conv = await agentSDK.createConversation({
        agent_name: "Copilot",
        metadata: {
          name: "Copilot Full Session",
          description: "Full-featured copilot interface"
        }
      });
      setConversation(conv);
    } catch (error) {
      console.error("Error initializing copilot:", error);
    }
  };

  const loadData = async () => {
    try {
      const [notesList, contactsList] = await Promise.all([
        Note.list('-created_date', 5),
        Contact.list('-created_date', 5)
      ]);
      setNotes(notesList);
      setContacts(contactsList);
    } catch (error) {
      console.error("Error loading data:", error);
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
      // Reload data after agent might have made changes
      setTimeout(loadData, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    {
      category: "Project Management",
      icon: FileText,
      color: '#FF7B00',
      prompts: [
        "Show my active projects",
        "Create a new project called 'Q1 Launch'",
        "Update project status to in progress"
      ]
    },
    {
      category: "Notes & Tasks",
      icon: MessageSquare,
      color: '#00B4D8',
      prompts: [
        "Add note: Review design mockups by Friday",
        "Show my notes from this week",
        "Create a reminder for tomorrow 9am"
      ]
    },
    {
      category: "Content Creation",
      icon: Zap,
      color: '#E91E63',
      prompts: [
        "Draft a tweet about our new feature launch",
        "Write an email to schedule a meeting",
        "Create a blog post outline about AI agents"
      ]
    },
    {
      category: "Help & Navigation",
      icon: HelpCircle,
      color: '#10B981',
      prompts: [
        "How do I create a new project?",
        "Where is the analytics dashboard?",
        "Show me available commands"
      ]
    }
  ];

  const whatsappURL = agentSDK.getWhatsAppConnectURL('Copilot');

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }} className="ff-fade-in">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FF7B0020, #00B4D820)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={28} style={{ color: '#FF7B00' }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: 'clamp(28px, 4vw, 42px)',
                  fontWeight: '800',
                  marginBottom: '8px'
                }}>
                  Copilot Assistant
                </h1>
                <p style={{ fontSize: '16px', color: '#94A3B8' }}>
                  Your AI-powered helper for FlashFusion
                </p>
              </div>
            </div>

            <a href={whatsappURL} target="_blank" rel="noopener noreferrer">
              <Button className="ff-btn-primary">
                💬 Connect WhatsApp
              </Button>
            </a>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div className="ff-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <FileText size={20} style={{ color: '#FF7B00' }} />
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>Recent Notes</span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '800' }}>{notes.length}</p>
          </div>
          <div className="ff-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Users size={20} style={{ color: '#00B4D8' }} />
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>Contacts</span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '800' }}>{contacts.length}</p>
          </div>
          <div className="ff-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <MessageSquare size={20} style={{ color: '#E91E63' }} />
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>Messages</span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '800' }}>{messages.length}</p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Sidebar - Quick Prompts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {quickPrompts.map((category, idx) => (
              <div key={idx} className="ff-card" style={{ padding: '24px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <category.icon size={20} style={{ color: category.color }} />
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#FFFFFF'
                  }}>
                    {category.category}
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {category.prompts.map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => setInputMessage(prompt)}
                      style={{
                        padding: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        color: '#CBD5E1',
                        fontSize: '13px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      className="ff-card-interactive"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Main Chat Area */}
          <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              height: '700px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Messages */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                    <Bot size={64} style={{ color: '#FF7B00', margin: '0 auto 24px' }} />
                    <h2 style={{
                      fontSize: '28px',
                      fontWeight: '800',
                      marginBottom: '12px'
                    }}>
                      Hi! I'm your Copilot 👋
                    </h2>
                    <p style={{
                      fontSize: '16px',
                      color: '#94A3B8',
                      maxWidth: '500px',
                      margin: '0 auto 32px',
                      lineHeight: '1.6'
                    }}>
                      I can help you navigate FlashFusion, manage your projects, draft content, and answer questions.
                      Try one of the quick prompts on the left, or ask me anything!
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'center',
                      flexWrap: 'wrap'
                    }}>
                      <Button
                        onClick={() => setInputMessage("Show me what you can do")}
                        className="ff-btn-primary"
                      >
                        Get Started
                      </Button>
                      <a href={whatsappURL} target="_blank" rel="noopener noreferrer">
                        <Button className="ff-btn-secondary">
                          Connect WhatsApp
                        </Button>
                      </a>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '75%',
                          padding: '16px',
                          background: msg.role === 'user' ? '#FF7B00' : 'rgba(255, 255, 255, 0.05)',
                          border: msg.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          color: '#FFFFFF'
                        }}
                      >
                        <p style={{
                          fontSize: '14px',
                          lineHeight: '1.6',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Area */}
              <div style={{
                padding: '24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ask me anything or try a command like 'add note', 'show projects', or 'draft email'..."
                    rows={3}
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      resize: 'none'
                    }}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={loading || !inputMessage.trim()}
                    style={{
                      background: '#FF7B00',
                      alignSelf: 'flex-end',
                      minWidth: '50px'
                    }}
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}