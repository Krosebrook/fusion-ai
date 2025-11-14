import { useState, useEffect } from "react";
import { agentSDK } from "@/agents";
import { Task } from "@/entities/Task";
import { AuditLog } from "@/entities/AuditLog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Network, Send, Loader2, CheckCircle, XCircle, Clock, 
  AlertCircle, FileText 
} from "lucide-react";

export default function WorkflowsPage() {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    loadConversations();
    loadTasks();
    loadAuditLogs();
  }, []);

  useEffect(() => {
    if (currentConversation) {
      const unsubscribe = agentSDK.subscribeToConversation(
        currentConversation.id,
        (data) => {
          setMessages(data.messages || []);
        }
      );
      return () => unsubscribe();
    }
  }, [currentConversation]);

  const loadConversations = async () => {
    try {
      const convs = await agentSDK.listConversations({
        agent_name: "FlowDirector"
      });
      setConversations(convs);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const loadTasks = async () => {
    try {
      const taskList = await Task.list('-created_date', 10);
      setTasks(taskList);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const logs = await AuditLog.list('-created_date', 20);
      setAuditLogs(logs);
    } catch (error) {
      console.error("Error loading audit logs:", error);
    }
  };

  const createNewConversation = async () => {
    try {
      const conv = await agentSDK.createConversation({
        agent_name: "FlowDirector",
        metadata: {
          name: `Workflow ${new Date().toLocaleString()}`,
          description: "FlowDirector workflow execution"
        }
      });
      setCurrentConversation(conv);
      setConversations([conv, ...conversations]);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    if (!currentConversation) {
      await createNewConversation();
      return;
    }

    setLoading(true);
    try {
      await agentSDK.addMessage(currentConversation, {
        role: "user",
        content: inputMessage
      });
      setInputMessage('');
      loadTasks();
      loadAuditLogs();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} style={{ color: '#10B981' }} />;
      case 'failed': return <XCircle size={16} style={{ color: '#EF4444' }} />;
      case 'in_progress': return <Loader2 size={16} className="animate-spin" style={{ color: '#F59E0B' }} />;
      default: return <Clock size={16} style={{ color: '#94A3B8' }} />;
    }
  };

  const whatsappURL = agentSDK.getWhatsAppConnectURL('FlowDirector');

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
                background: 'linear-gradient(135deg, #F59E0B20, #F59E0B10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Network size={28} style={{ color: '#F59E0B' }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: 'clamp(28px, 4vw, 42px)',
                  fontWeight: '800',
                  marginBottom: '8px'
                }}>
                  FlowDirector Orchestrator
                </h1>
                <p style={{ fontSize: '16px', color: '#94A3B8' }}>
                  Deterministic workflow execution with audit trails
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Button
                onClick={createNewConversation}
                className="ff-btn-primary"
                style={{ background: '#F59E0B' }}
              >
                New Workflow
              </Button>
              <a href={whatsappURL} target="_blank" rel="noopener noreferrer">
                <Button className="ff-btn-secondary">
                  💬 WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1fr) 2fr minmax(300px, 1fr)',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Conversations Sidebar */}
          <div className="ff-card" style={{ padding: '24px' }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '16px',
              color: '#FFFFFF'
            }}>
              Workflow Sessions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {conversations.length === 0 ? (
                <p style={{ color: '#94A3B8', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>
                  No workflows yet
                </p>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => setCurrentConversation(conv)}
                    style={{
                      padding: '12px',
                      background: currentConversation?.id === conv.id ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${currentConversation?.id === conv.id ? '#F59E0B' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#FFFFFF',
                      marginBottom: '4px'
                    }}>
                      {conv.metadata?.name || 'Workflow'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                      {new Date(conv.created_date).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              height: '600px',
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
                {!currentConversation ? (
                  <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                    <Network size={48} style={{ color: '#F59E0B', margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                      Start a Workflow
                    </h3>
                    <p style={{ color: '#94A3B8', marginBottom: '24px' }}>
                      Create a new workflow session to execute business processes
                    </p>
                    <Button onClick={createNewConversation} className="ff-btn-primary" style={{ background: '#F59E0B' }}>
                      Create Workflow
                    </Button>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 24px' }}>
                    <p style={{ color: '#94A3B8' }}>Send a message to start the workflow</p>
                    <div style={{ marginTop: '24px', textAlign: 'left' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#CBD5E1' }}>
                        Example prompts:
                      </p>
                      {[
                        'Start onboarding for jordan@example.com on the Starter plan.',
                        'Create order for user u_123: 2 × SKU-A1 with coupon LAUNCH10.',
                        'Re-run the failed step on task_8892.'
                      ].map(prompt => (
                        <div
                          key={prompt}
                          onClick={() => setInputMessage(prompt)}
                          style={{
                            padding: '12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: '#CBD5E1'
                          }}
                        >
                          {prompt}
                        </div>
                      ))}
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
                          maxWidth: '80%',
                          padding: '16px',
                          background: msg.role === 'user' ? '#F59E0B' : 'rgba(255, 255, 255, 0.05)',
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
              {currentConversation && (
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
                      placeholder="Describe the workflow to execute..."
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
                        background: '#F59E0B',
                        alignSelf: 'flex-end'
                      }}
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Tasks */}
            <div className="ff-card" style={{ padding: '24px' }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '16px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FileText size={18} />
                Recent Tasks
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {tasks.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
                    No tasks yet
                  </p>
                ) : (
                  tasks.map(task => (
                    <div
                      key={task.id}
                      style={{
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        {getStatusIcon(task.status)}
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', flex: 1 }}>
                          {task.title}
                        </p>
                      </div>
                      {task.workflow_type && (
                        <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                          {task.workflow_type}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Audit Logs */}
            <div className="ff-card" style={{ padding: '24px' }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '16px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={18} />
                Audit Trail
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {auditLogs.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
                    No logs yet
                  </p>
                ) : (
                  auditLogs.map(log => (
                    <div
                      key={log.id}
                      style={{
                        padding: '10px',
                        background: log.status === 'failed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${log.status === 'failed' ? '#EF4444' : 'rgba(255, 255, 255, 0.05)'}`,
                        borderRadius: '6px'
                      }}
                    >
                      <p style={{ fontSize: '12px', fontWeight: '600', color: '#FFFFFF', marginBottom: '4px' }}>
                        {log.event_type} - {log.action}
                      </p>
                      <p style={{ fontSize: '11px', color: '#94A3B8' }}>
                        {new Date(log.created_date).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}