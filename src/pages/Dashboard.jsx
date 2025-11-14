import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { Project } from "@/entities/Project";
import { 
  Code, FileText, TrendingUp, Shield, ShoppingCart, Sparkles,
  Plus, Clock, CheckCircle, AlertCircle, ArrowRight, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const userProjects = await Project.filter({ created_by: currentUser.email }, '-created_date', 10);
      setProjects(userProjects);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const aiTools = [
    {
      id: 'app-builder',
      name: 'Full-Stack App Builder',
      description: 'Complete web application with frontend, backend, and database',
      icon: Code,
      color: '#FF7B00',
      time: '3-5 minutes',
      page: 'AppBuilder'
    },
    {
      id: 'content-studio',
      name: 'Educational Content Studio',
      description: 'Blog posts, social media content, and marketing materials',
      icon: FileText,
      color: '#00B4D8',
      time: '30 seconds - 2 minutes',
      page: 'ContentStudio'
    },
    {
      id: 'analytics',
      name: 'Business Intelligence Hub',
      description: 'Track performance, audience, and AI-powered insights',
      icon: TrendingUp,
      color: '#10B981',
      time: 'Real-time data',
      page: 'Analytics'
    },
    {
      id: 'security',
      name: 'Enterprise Security Suite',
      description: 'All-in-one security with end-to-end advanced protection',
      icon: Shield,
      color: '#8B5CF6',
      time: 'Always on',
      page: 'Security'
    },
    {
      id: 'commerce',
      name: 'Creator Commerce Hub',
      description: 'Turn your creative work into revenue with integrated tools',
      icon: ShoppingCart,
      color: '#E91E63',
      time: '2-3 days',
      page: 'Commerce'
    },
    {
      id: 'orchestration',
      name: 'Multi-Agent Orchestration',
      description: 'Reusable components, API endpoints, and integrations',
      icon: Sparkles,
      color: '#F59E0B',
      time: '1-3 minutes',
      page: 'Orchestration'
    }
  ];

  const stats = [
    { label: 'Active Projects', value: projects.length, icon: Code, color: '#FF7B00' },
    { label: 'AI Generations', value: '0', icon: Zap, color: '#00B4D8' },
    { label: 'This Month', value: '$0', icon: TrendingUp, color: '#10B981' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} style={{ color: '#10B981' }} />;
      case 'generating': return <Clock size={16} style={{ color: '#F59E0B' }} />;
      case 'draft': return <AlertCircle size={16} style={{ color: '#94A3B8' }} />;
      default: return <Clock size={16} style={{ color: '#94A3B8' }} />;
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(255, 123, 0, 0.2)',
            borderTopColor: '#FF7B00',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#94A3B8' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Welcome Header */}
        <div style={{ marginBottom: '48px' }} className="ff-fade-in">
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: '800',
            marginBottom: '8px'
          }}>
            Welcome back, {user?.full_name || 'there'}! 👋
          </h1>
          <p style={{ fontSize: '18px', color: '#94A3B8' }}>
            Let's build something amazing today
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="ff-card"
              style={{
                padding: '32px',
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '8px' }}>
                    {stat.label}
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: '800', color: '#FFFFFF' }}>
                    {stat.value}
                  </p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${stat.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <stat.icon size={24} style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Tools Grid */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <h2 style={{
              fontSize: 'clamp(24px, 3vw, 32px)',
              fontWeight: '800'
            }}>
              AI-Powered Tools
            </h2>
            <Link to={createPageUrl("Tools")}>
              <Button className="ff-btn-secondary">
                View All Tools <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </Button>
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {aiTools.map((tool, index) => (
              <Link key={tool.id} to={createPageUrl(tool.page)}>
                <div
                  className="ff-card"
                  style={{
                    padding: '32px',
                    height: '100%',
                    cursor: 'pointer',
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${tool.color}20, ${tool.color}10)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <tool.icon size={28} style={{ color: tool.color }} />
                  </div>

                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    marginBottom: '8px',
                    color: '#FFFFFF'
                  }}>
                    {tool.name}
                  </h3>

                  <p style={{
                    fontSize: '14px',
                    color: '#94A3B8',
                    marginBottom: '16px',
                    lineHeight: '1.5'
                  }}>
                    {tool.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: tool.color
                  }}>
                    <Clock size={14} />
                    {tool.time}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <h2 style={{
              fontSize: 'clamp(24px, 3vw, 32px)',
              fontWeight: '800'
            }}>
              Recent Projects
            </h2>
            <Link to={createPageUrl("AppBuilder")}>
              <Button className="ff-btn-primary">
                <Plus size={18} style={{ marginRight: '8px' }} />
                New Project
              </Button>
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="ff-card" style={{
              padding: '64px 32px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(255, 123, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <Code size={40} style={{ color: '#FF7B00' }} />
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '12px'
              }}>
                No projects yet
              </h3>
              <p style={{
                color: '#94A3B8',
                marginBottom: '32px'
              }}>
                Start by creating your first AI-powered project
              </p>
              <Link to={createPageUrl("AppBuilder")}>
                <Button className="ff-btn-primary">
                  Create Your First Project
                </Button>
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {projects.map(project => (
                <div key={project.id} className="ff-card" style={{ padding: '24px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#FFFFFF'
                    }}>
                      {project.name}
                    </h3>
                    {getStatusIcon(project.status)}
                  </div>

                  <p style={{
                    fontSize: '13px',
                    color: '#94A3B8',
                    marginBottom: '12px',
                    textTransform: 'capitalize'
                  }}>
                    {project.type?.replace('_', ' ')}
                  </p>

                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: 'rgba(255, 123, 0, 0.1)',
                    color: '#FF7B00',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {project.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}