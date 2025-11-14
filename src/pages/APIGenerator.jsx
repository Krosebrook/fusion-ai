import { Cpu } from "lucide-react";

export default function APIGeneratorPage() {
  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <Cpu size={40} style={{ color: '#8B5CF6' }} />
        </div>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '800',
          marginBottom: '16px'
        }}>
          API Generator
        </h1>
        <p style={{ fontSize: '18px', color: '#94A3B8' }}>
          Coming soon - Generate production-ready APIs with authentication and documentation
        </p>
      </div>
    </div>
  );
}