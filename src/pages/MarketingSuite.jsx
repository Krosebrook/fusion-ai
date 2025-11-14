import { FileText } from "lucide-react";

export default function MarketingSuitePage() {
  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <FileText size={40} style={{ color: '#10B981' }} />
        </div>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '800',
          marginBottom: '16px'
        }}>
          Marketing Suite
        </h1>
        <p style={{ fontSize: '18px', color: '#94A3B8' }}>
          Coming soon - Create SEO-optimized marketing content and campaigns
        </p>
      </div>
    </div>
  );
}