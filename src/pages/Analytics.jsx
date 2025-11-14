import { useState, useEffect } from "react";
import { agentSDK } from "@/agents";
import { InsightReport } from "@/entities/InsightReport";
import { Task } from "@/entities/Task";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, Send, Loader2, BarChart3, AlertTriangle, Target, Brain, FileText, ExternalLink, Filter
} from "lucide-react";

export default function AnalyticsPage() {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadConversations();
    loadReports();
    loadTasks();
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
        agent_name: "SignalSage"
      });
      setConversations(convs);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const loadReports = async () => {
    try {
      const reportList = await InsightReport.list('-created_date', 20);
      setReports(reportList);
    } catch (error) {
      console.error("Error loading reports:", error);
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

  const createNewConversation = async () => {
    try {
      const conv = await agentSDK.createConversation({
        agent_name: "SignalSage",
        metadata: {
          name: `Analysis ${new Date().toLocaleString()}`,
          description: "SignalSage analytics session"
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
      loadReports();
      loadTasks();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    {
      title: "Funnel Analysis",
      prompt: "Weekly funnel /signup → /checkout with drop-off reasons and 7-day forecast.",
      icon: Target
    },
    {
      title: "Anomaly Detection",
      prompt: "Find anomalies in orders.amount last 48h; open tasks for any >P95 deviation with a hypothesis.",
      icon: AlertTriangle
    },
    {
      title: "User Segmentation",
      prompt: "Segment repeat buyers vs first-timers and list top 3 retention levers.",
      icon: Filter
    }
  ];

  const getReportTypeColor = (type) => {
    const colors = {
      funnel_analysis: '#00B4D8',
      forecast: '#F59E0B',
      anomaly_detection: '#EF4444',
      segmentation: '#8B5CF6',
      cohort_analysis: '#10B981',
      retention: '#E91E63'
    };
    return colors[type] || '#94A3B8';
  };

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 0.8) return { text: 'High', color: '#10B981' };
    if (confidence >= 0.6) return { text: 'Medium', color: '#F59E0B' };
    return { text: 'Low', color: '#EF4444' };
  };

  const whatsappURL = agentSDK.getWhatsAppConnectURL('SignalSage');

  const filteredReports = filterType === 'all' 
    ? reports 
    : reports.filter(r => r.report_type === filterType);

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
                background: 'linear-gradient(135deg, #00B4D820, #00B4D810)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Brain size={28} style={{ color: '#00B4D8' }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: 'clamp(28px, 4vw, 42px)',
                  fontWeight: '800',
                  marginBottom: '8px'
                }}>
                  SignalSage Analytics
                </h1>
                <p style={{ fontSize: '16px', color: '#94A3B8' }}>
                  Decision-grade insights with confidence scores
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Button
                onClick={createNewConversation}
                className="ff-btn-primary"
                style={{ background: '#00B4D8' }}
              >
                New Analysis
              </Button>
              <a href={whatsappURL} target="_blank" rel="noopener noreferrer">
                <Button className="ff-btn-secondary">
                  💬 WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div className="ff-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <FileText size={20} style={{ color: '#00B4D8' }} />
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>Reports</span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '800' }}>{reports.length}</p>
          </div>
          <div className="ff-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Target size={20} style={{ color: '#F59E0B' }} />
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>Active Tasks</span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '800' }}>
              {tasks.filter(t => t.status !== 'completed').length}
            </p>
          </div>
          <div className="ff-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <TrendingUp size={20} style={{ color: '#10B981' }} />
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>Avg Confidence</span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '800' }}>
              {reports.length > 0 
                ? Math.round((reports.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / reports.length) * 100)
                : 0}%
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Quick Prompts */}
            <div className="ff-card" style={{ padding: '24px' }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '16px',
                color: '#FFFFFF'
              }}>
                Quick Analysis
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {quickPrompts.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setInputMessage(item.prompt)}
                    style={{
                      padding: '16px',
                      background: 'rgba(0, 180, 216, 0.1)',
                      border: '1px solid rgba(0, 180, 216, 0.3)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    className="ff-card-interactive"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <item.icon size={20} style={{ color: '#00B4D8' }} />
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF' }}>
                        {item.title}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: '1.5' }}>
                      {item.prompt}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="ff-card" style={{ padding: '24px' }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '16px',
                color: '#FFFFFF'
              }}>
                Analysis Sessions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {conversations.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>
                    No sessions yet
                  </p>
                ) : (
                  conversations.slice(0, 5).map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => setCurrentConversation(conv)}
                      style={{
                        padding: '12px',
                        background: currentConversation?.id === conv.id ? 'rgba(0, 180, 216, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${currentConversation?.id === conv.id ? '#00B4D8' : 'rgba(255, 255, 255, 0.1)'}`,
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
                        {conv.metadata?.name || 'Analysis'}
                      </p>
                      <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                        {new Date(conv.created_date).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Chat Interface */}
            <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                height: '400px',
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
                    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                      <Brain size={48} style={{ color: '#00B4D8', margin: '0 auto 16px' }} />
                      <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                        Start Your Analysis
                      </h3>
                      <p style={{ color: '#94A3B8', marginBottom: '24px' }}>
                        Ask SignalSage to analyze your data and get actionable insights
                      </p>
                      <Button onClick={createNewConversation} className="ff-btn-primary" style={{ background: '#00B4D8' }}>
                        Begin Analysis
                      </Button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 24px' }}>
                      <p style={{ color: '#94A3B8', marginBottom: '16px' }}>
                        What would you like to analyze?
                      </p>
                      <p style={{ fontSize: '13px', color: '#64748B' }}>
                        Try clicking one of the quick prompts on the left
                      </p>
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
                            maxWidth: '85%',
                            padding: '16px',
                            background: msg.role === 'user' ? '#00B4D8' : 'rgba(255, 255, 255, 0.05)',
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
                        placeholder="Ask for insights, forecasts, or analysis..."
                        rows={2}
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
                          background: '#00B4D8',
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

            {/* Reports List */}
            <div className="ff-card" style={{ padding: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#FFFFFF'
                }}>
                  Insight Reports
                </h2>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger style={{ width: '200px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="funnel_analysis">Funnel Analysis</SelectItem>
                    <SelectItem value="forecast">Forecast</SelectItem>
                    <SelectItem value="anomaly_detection">Anomaly Detection</SelectItem>
                    <SelectItem value="segmentation">Segmentation</SelectItem>
                    <SelectItem value="retention">Retention</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredReports.length === 0 ? (
                  <div style={{
                    padding: '60px 24px',
                    textAlign: 'center',
                    border: '2px dashed rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px'
                  }}>
                    <BarChart3 size={48} style={{ color: '#94A3B8', margin: '0 auto 16px' }} />
                    <p style={{ color: '#94A3B8' }}>No reports yet</p>
                    <p style={{ fontSize: '13px', color: '#64748B', marginTop: '8px' }}>
                      Start an analysis to generate insights
                    </p>
                  </div>
                ) : (
                  filteredReports.map(report => {
                    const confidenceBadge = getConfidenceBadge(report.confidence_score || 0);
                    return (
                      <div
                        key={report.id}
                        className="ff-card"
                        style={{
                          padding: '20px',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px'
                        }}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{
                              fontSize: '16px',
                              fontWeight: '700',
                              color: '#FFFFFF',
                              marginBottom: '8px'
                            }}>
                              {report.title}
                            </h3>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{
                                padding: '4px 12px',
                                background: `${getReportTypeColor(report.report_type)}20`,
                                color: getReportTypeColor(report.report_type),
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                {report.report_type?.replace('_', ' ')}
                              </span>
                              <span style={{
                                padding: '4px 12px',
                                background: `${confidenceBadge.color}20`,
                                color: confidenceBadge.color,
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                {confidenceBadge.text} Confidence
                              </span>
                            </div>
                          </div>
                          <ExternalLink size={18} style={{ color: '#94A3B8' }} />
                        </div>

                        {report.insights && report.insights.length > 0 && (
                          <div style={{
                            padding: '12px',
                            background: 'rgba(0, 180, 216, 0.05)',
                            borderRadius: '8px',
                            marginTop: '12px'
                          }}>
                            <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '1.6' }}>
                              {report.insights[0].finding}
                            </p>
                          </div>
                        )}

                        <p style={{
                          fontSize: '12px',
                          color: '#64748B',
                          marginTop: '12px'
                        }}>
                          {new Date(report.created_date).toLocaleString()}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}