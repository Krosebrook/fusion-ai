import { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Zap, Code, ArrowRight, 
  Chrome, Github, Mail, Eye, EyeOff, Loader2
} from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if already authenticated
  useEffect(() => {
    User.me().then(user => {
      if (user) {
        window.location.href = '/Dashboard';
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await User.login();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Code,
      title: "AI-Powered Development",
      description: "Generate production-ready code in seconds"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Deploy to 20+ platforms instantly"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption & SOC 2 compliance"
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Creators" },
    { value: "50M+", label: "Lines Generated" },
    { value: "99.9%", label: "Uptime SLA" }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.3,
        background: `
          radial-gradient(circle at 20% 30%, rgba(255, 123, 0, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(0, 180, 216, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(233, 30, 99, 0.1) 0%, transparent 50%)
        `
      }} />

      {/* Floating Orbs */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 123, 0, 0.2) 0%, transparent 70%)',
        filter: 'blur(40px)',
        animation: 'float 8s ease-in-out infinite'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 180, 216, 0.2) 0%, transparent 70%)',
        filter: 'blur(40px)',
        animation: 'float 10s ease-in-out infinite reverse'
      }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(0) translateX(20px); }
          75% { transform: translateY(20px) translateX(10px); }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .auth-container {
          animation: fadeIn 0.6s ease-out;
        }

        .auth-left {
          animation: slideInLeft 0.8s ease-out;
        }

        .auth-right {
          animation: slideInRight 0.8s ease-out;
        }

        .feature-card {
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.08);
        }

        .social-btn {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .social-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .social-btn:hover::before {
          width: 300px;
          height: 300px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-wrapper input:focus {
          border-color: #FF7B00;
          box-shadow: 0 0 0 3px rgba(255, 123, 0, 0.1);
        }

        .stat-card {
          animation: fadeIn 1s ease-out backwards;
        }

        .stat-card:nth-child(1) { animation-delay: 0.2s; }
        .stat-card:nth-child(2) { animation-delay: 0.4s; }
        .stat-card:nth-child(3) { animation-delay: 0.6s; }
      `}</style>

      <div className="auth-container" style={{
        maxWidth: '1200px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '48px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Left Side - Branding & Features */}
        <div className="auth-left" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '32px'
        }}>
          {/* Logo & Tagline */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #FF7B00, #E91E63)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 'bold',
                boxShadow: '0 8px 32px rgba(255, 123, 0, 0.4)'
              }}>
                F
              </div>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  letterSpacing: '-0.5px',
                  marginBottom: '4px'
                }}>
                  FlashFusion
                </h1>
                <p style={{
                  fontSize: '14px',
                  color: '#94A3B8'
                }}>
                  Transform Ideas Into Reality
                </p>
              </div>
            </div>

            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              lineHeight: '1.3',
              marginBottom: '16px'
            }}>
              Build the future with{' '}
              <span className="ff-gradient-text">AI-powered development</span>
            </h2>
            
            <p style={{
              fontSize: '16px',
              color: '#CBD5E1',
              lineHeight: '1.6'
            }}>
              Join thousands of creators, developers, and entrepreneurs using FlashFusion 
              to turn concepts into production-ready applications in minutes.
            </p>
          </div>

          {/* Features */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card"
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(255, 123, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <feature.icon size={24} style={{ color: '#FF7B00' }} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#94A3B8'
                  }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {stats.map((stat, index) => (
              <div key={index} className="stat-card" style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #FF7B00, #00B4D8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '4px'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#94A3B8'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="auth-right" style={{
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '480px',
            padding: '48px',
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Form Header */}
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                marginBottom: '8px'
              }}>
                {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#94A3B8'
              }}>
                {mode === 'signin' 
                  ? 'Sign in to continue your journey' 
                  : 'Start building amazing things today'}
              </p>
            </div>

            {/* Social Auth Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '32px'
            }}>
              <Button
                onClick={() => User.login()}
                className="social-btn"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer'
                }}
              >
                <Chrome size={20} />
                Continue with Google
              </Button>

              <Button
                onClick={() => User.login()}
                className="social-btn"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer'
                }}
              >
                <Github size={20} />
                Continue with GitHub
              </Button>
            </div>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{
                flex: 1,
                height: '1px',
                background: 'rgba(255, 255, 255, 0.1)'
              }} />
              <span style={{
                fontSize: '12px',
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Or continue with email
              </span>
              <div style={{
                flex: 1,
                height: '1px',
                background: 'rgba(255, 255, 255, 0.1)'
              }} />
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* Email Input */}
              <div className="input-wrapper">
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: '#CBD5E1'
                }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94A3B8'
                  }} />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 48px',
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '15px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="input-wrapper">
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: '#CBD5E1'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 48px 14px 16px',
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '15px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  padding: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#EF4444',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              {/* Remember & Forgot */}
              {mode === 'signin' && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '14px'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#CBD5E1',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    Remember me
                  </label>
                  <a href="#" style={{
                    color: '#FF7B00',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}>
                    Forgot password?
                  </a>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #FF7B00, #E91E63)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 24px rgba(255, 123, 0, 0.3)',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={20} />
                  </>
                )}
              </Button>

              {/* Toggle Mode */}
              <div style={{
                textAlign: 'center',
                fontSize: '14px',
                color: '#94A3B8'
              }}>
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FF7B00',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </form>

            {/* Terms */}
            <p style={{
              marginTop: '24px',
              fontSize: '12px',
              color: '#64748B',
              textAlign: 'center',
              lineHeight: '1.6'
            }}>
              By continuing, you agree to our{' '}
              <a href="#" style={{ color: '#FF7B00', textDecoration: 'none' }}>Terms of Service</a>
              {' '}and{' '}
              <a href="#" style={{ color: '#FF7B00', textDecoration: 'none' }}>Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}