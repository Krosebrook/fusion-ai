import { Sparkles, Cpu, Zap, Network } from "lucide-react";

export default function OrchestrationPage() {
  const agents = [
    {
      icon: Cpu,
      name: 'Code Generator',
      description: 'Generates production-ready code',
      status: 'Ready',
      color: '#FF7B00'
    },
    {
      icon: Sparkles,
      name: 'Content Creator',
      description: 'Creates engaging content',
      status: 'Ready',
      color: '#00B4D8'
    },
    {
      icon: Network,
      name: 'API Integrator',
      description: 'Connects external services',
      status: 'Ready',
      color: '#E91E63'
    },
    {
      icon: Zap,
      name: 'Optimizer',
      description: 'Optimizes performance',
      status: 'Ready',
      color: '#10B981'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }} className="ff-fade-in">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F59E0B20, #F59E0B10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={28} style={{ color: '#F59E0B' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: '800',
                marginBottom: '8px'
              }}>
                Multi-Agent Orchestration
              </h1>
              <p style={{ fontSize: '16px', color: '#94A3B8' }}>
                Coordinate AI agents for complex workflows
              </p>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {agents.map((agent, index) => (
            <div
              key={agent.name}
              className="ff-card"
              style={{
                padding: '32px',
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: `${agent.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <agent.icon size={28} style={{ color: agent.color }} />
              </div>

              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '8px'
              }}>
                {agent.name}
              </h3>

              <p style={{
                fontSize: '14px',
                color: '#94A3B8',
                marginBottom: '16px'
              }}>
                {agent.description}
              </p>

              <div style={{
                display: 'inline-block',
                padding: '6px 12px',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600'
              }}>
                {agent.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}