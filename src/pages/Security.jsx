import { Shield, Lock, AlertTriangle, CheckCircle, FileSearch } from "lucide-react";

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Shield,
      title: 'SOC 2 Compliance',
      description: 'Full compliance with industry security standards',
      status: 'active',
      color: '#10B981'
    },
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All data encrypted in transit and at rest',
      status: 'active',
      color: '#00B4D8'
    },
    {
      icon: FileSearch,
      title: 'Vulnerability Scanning',
      description: 'Automated security scans and threat detection',
      status: 'active',
      color: '#FF7B00'
    },
    {
      icon: AlertTriangle,
      title: 'Threat Monitoring',
      description: '24/7 monitoring for security threats',
      status: 'active',
      color: '#E91E63'
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
              background: 'linear-gradient(135deg, #8B5CF620, #8B5CF610)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={28} style={{ color: '#8B5CF6' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: '800',
                marginBottom: '8px'
              }}>
                Enterprise Security Suite
              </h1>
              <p style={{ fontSize: '16px', color: '#94A3B8' }}>
                Bank-level security with advanced protection
              </p>
            </div>
          </div>
        </div>

        {/* Security Status */}
        <div className="ff-card" style={{
          padding: '32px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <CheckCircle size={32} style={{ color: '#10B981' }} />
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                All Systems Secure
              </h2>
              <p style={{ color: '#CBD5E1' }}>
                Your application is protected with enterprise-grade security
              </p>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {securityFeatures.map((feature, index) => (
            <div
              key={feature.title}
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
                background: `${feature.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <feature.icon size={28} style={{ color: feature.color }} />
              </div>

              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '8px'
              }}>
                {feature.title}
              </h3>

              <p style={{
                fontSize: '14px',
                color: '#94A3B8',
                marginBottom: '16px'
              }}>
                {feature.description}
              </p>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600'
              }}>
                <CheckCircle size={14} />
                Active
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}