import { ShoppingCart, TrendingUp, Package, CreditCard } from "lucide-react";

export default function CommercePage() {
  const revenueStreams = [
    {
      icon: ShoppingCart,
      title: 'Marketplace Listings',
      description: 'List on popular creative marketplaces',
      revenue: '$0/month average',
      setup: '2-3 days',
      color: '#E91E63'
    },
    {
      icon: CreditCard,
      title: 'Subscription Model',
      description: 'Recurring revenue from premium content',
      revenue: '$0/month average',
      setup: '1 day',
      color: '#00B4D8'
    },
    {
      icon: Package,
      title: 'Direct Sales',
      description: 'Sell creations directly to customers',
      revenue: '$0 avg/sale',
      setup: 'Immediate',
      color: '#FF7B00'
    },
    {
      icon: TrendingUp,
      title: 'Affiliate Marketing',
      description: 'Earn commissions promoting products',
      revenue: '10% avg commission',
      setup: 'Immediate',
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
              background: 'linear-gradient(135deg, #E91E6320, #E91E6310)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingCart size={28} style={{ color: '#E91E63' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: '800',
                marginBottom: '8px'
              }}>
                Creator Commerce Hub
              </h1>
              <p style={{ fontSize: '16px', color: '#94A3B8' }}>
                Transform your work into revenue streams
              </p>
            </div>
          </div>
        </div>

        {/* Revenue Streams */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {revenueStreams.map((stream, index) => (
            <div
              key={stream.title}
              className="ff-card"
              style={{
                padding: '32px',
                cursor: 'pointer',
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: `${stream.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <stream.icon size={28} style={{ color: stream.color }} />
              </div>

              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '8px'
              }}>
                {stream.title}
              </h3>

              <p style={{
                fontSize: '14px',
                color: '#94A3B8',
                marginBottom: '16px',
                lineHeight: '1.5'
              }}>
                {stream.description}
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>
                    Avg Revenue
                  </p>
                  <p style={{ fontSize: '16px', fontWeight: '700', color: stream.color }}>
                    {stream.revenue}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>
                    Setup Time
                  </p>
                  <p style={{ fontSize: '16px', fontWeight: '700' }}>
                    {stream.setup}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}