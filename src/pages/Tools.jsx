import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Code, FileText, TrendingUp, Shield, ShoppingCart, Sparkles,
  Clock, ArrowRight, BookOpen, Cpu
} from "lucide-react";

export default function ToolsPage() {
  const toolCategories = [
    {
      category: 'Development',
      tools: [
        {
          id: 'app-builder',
          name: 'Full-Stack App Builder',
          description: 'Generate complete production-ready applications with frontend, backend, database schemas, and deployment configurations',
          icon: Code,
          color: '#FF7B00',
          time: '3-5 minutes',
          features: ['React/Vue/Angular', 'Node.js/Python', 'PostgreSQL/MongoDB', 'Auto-deployment'],
          page: 'AppBuilder'
        },
        {
          id: 'api-generator',
          name: 'API & Backend Generator',
          description: 'Create RESTful APIs, GraphQL endpoints, and serverless functions with authentication and documentation',
          icon: Cpu,
          color: '#8B5CF6',
          time: '1-2 minutes',
          features: ['REST & GraphQL', 'Auth included', 'Auto-docs', 'Rate limiting'],
          page: 'APIGenerator'
        }
      ]
    },
    {
      category: 'Content & Education',
      tools: [
        {
          id: 'content-studio',
          name: 'Educational Content Studio',
          description: 'Generate comprehensive educational materials including lesson plans, assessments, and interactive content',
          icon: BookOpen,
          color: '#00B4D8',
          time: '30 sec - 2 min',
          features: ['Standards-aligned', 'Multi-format', 'Differentiated', 'Assessment tools'],
          page: 'ContentStudio'
        },
        {
          id: 'marketing-suite',
          name: 'Marketing Content Suite',
          description: 'Create engaging blog posts, social media content, email campaigns, and marketing copy',
          icon: FileText,
          color: '#10B981',
          time: '1-3 minutes',
          features: ['SEO optimized', 'Multi-platform', 'A/B testing', 'Analytics'],
          page: 'MarketingSuite'
        }
      ]
    },
    {
      category: 'Business & Commerce',
      tools: [
        {
          id: 'commerce',
          name: 'Creator Commerce Hub',
          description: 'Build complete e-commerce solutions with payment processing, inventory management, and marketing automation',
          icon: ShoppingCart,
          color: '#E91E63',
          time: '2-3 days',
          features: ['Multi-marketplace', 'Payment integrations', 'Order tracking', 'Revenue analytics'],
          page: 'Commerce'
        },
        {
          id: 'analytics',
          name: 'Business Intelligence Hub',
          description: 'Comprehensive analytics with real-time dashboards, predictive insights, and performance tracking',
          icon: TrendingUp,
          color: '#10B981',
          time: 'Real-time',
          features: ['Real-time data', 'Predictive AI', 'Custom reports', 'Export tools'],
          page: 'Analytics'
        }
      ]
    },
    {
      category: 'Infrastructure & Security',
      tools: [
        {
          id: 'security',
          name: 'Enterprise Security Suite',
          description: 'All-in-one security platform with vulnerability scanning, compliance monitoring, and threat detection',
          icon: Shield,
          color: '#8B5CF6',
          time: 'Always on',
          features: ['SOC 2 compliance', 'Threat detection', 'Penetration testing', '24/7 monitoring'],
          page: 'Security'
        },
        {
          id: 'orchestration',
          name: 'Multi-Agent Orchestration',
          description: 'Coordinate multiple AI agents to work together on complex tasks and workflows',
          icon: Sparkles,
          color: '#F59E0B',
          time: '1-3 minutes',
          features: ['Agent coordination', 'Workflow automation', 'API integrations', 'Real-time sync'],
          page: 'Orchestration'
        }
      ]
    }
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }} className="ff-fade-in">
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: '800',
            marginBottom: '16px'
          }}>
            AI-Powered <span className="ff-gradient-text">Development Tools</span>
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#94A3B8',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Transform your ideas into production-ready applications, content, and revenue streams
            with our suite of professional AI tools
          </p>
        </div>

        {/* Tool Categories */}
        {toolCategories.map((category, catIndex) => (
          <div key={category.category} style={{ marginBottom: '80px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <h2 style={{
                fontSize: 'clamp(24px, 3vw, 32px)',
                fontWeight: '800'
              }}>
                {category.category}
              </h2>
              <div style={{
                flex: 1,
                height: '1px',
                background: 'linear-gradient(90deg, rgba(255, 123, 0, 0.3) 0%, transparent 100%)'
              }} />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
              gap: '32px'
            }}>
              {category.tools.map((tool, toolIndex) => (
                <Link key={tool.id} to={createPageUrl(tool.page)}>
                  <div
                    className="ff-card"
                    style={{
                      padding: '40px',
                      height: '100%',
                      cursor: 'pointer',
                      animation: `fadeInUp 0.6s ease-out ${(catIndex * 0.2) + (toolIndex * 0.15)}s both`
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '24px'
                    }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, ${tool.color}20, ${tool.color}10)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 24px ${tool.color}20`
                      }}>
                        <tool.icon size={32} style={{ color: tool.color }} />
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: `${tool.color}15`,
                        color: tool.color,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        <Clock size={12} />
                        {tool.time}
                      </div>
                    </div>

                    <h3 style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      marginBottom: '12px',
                      color: '#FFFFFF'
                    }}>
                      {tool.name}
                    </h3>

                    <p style={{
                      fontSize: '15px',
                      color: '#94A3B8',
                      lineHeight: '1.6',
                      marginBottom: '24px'
                    }}>
                      {tool.description}
                    </p>

                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: '24px'
                    }}>
                      {tool.features.map(feature => (
                        <span
                          key={feature}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#CBD5E1'
                          }}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: tool.color,
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Get Started <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* CTA Section */}
        <div className="ff-card" style={{
          padding: '64px 40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255, 123, 0, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%)',
          border: '1px solid rgba(255, 123, 0, 0.3)'
        }}>
          <h2 style={{
            fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: '800',
            marginBottom: '16px'
          }}>
            Need a custom tool?
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#94A3B8',
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            Our AI can create custom tools tailored to your specific needs.
            Contact us to discuss your requirements.
          </p>
          <button className="ff-btn-primary ff-glow-orange" style={{
            fontSize: '16px',
            padding: '14px 32px'
          }}>
            Request Custom Tool
          </button>
        </div>
      </div>
    </div>
  );
}