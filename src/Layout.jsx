import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Wrench, BarChart3, Menu, X, PlayCircle, ArrowRight, UserPlus, Code, BookOpen, Globe, Link2,
  Rocket, Activity, Shield, Users as UsersIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { AuthProvider } from "@/components/hooks/useAuth";
import { GlobalErrorBoundary } from "@/components/core/GlobalErrorBoundary";
import NotificationCenter from "./components/collaboration/NotificationCenter";
import { AuroraBackground } from "./components/effects/AuroraBackground";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const ListItem = React.forwardRef(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-800 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none text-white">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-slate-400">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

function LayoutContent({ children }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  
  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // PWA Meta Tags & Manifest
  React.useEffect(() => {
    // Viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover';
      document.head.appendChild(meta);
    }

    // Theme color
    let themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
      themeColor = document.createElement('meta');
      themeColor.name = 'theme-color';
      document.head.appendChild(themeColor);
    }
    themeColor.content = '#0F172A';

    // Manifest link
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = '/manifest.json';
      document.head.appendChild(manifestLink);
    }

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/api/sw').catch(() => {});
    }

    // Update manifest link to use API endpoint
    if (manifestLink) {
      manifestLink.href = '/api/manifest';
    }

    // Apple touch icon
    let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!appleTouchIcon) {
      appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.href = '/icon-192.png';
      document.head.appendChild(appleTouchIcon);
    }

    // Apple mobile web app capable
    const appleMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!appleMeta) {
      const meta = document.createElement('meta');
      meta.name = 'apple-mobile-web-app-capable';
      meta.content = 'yes';
      document.head.appendChild(meta);
    }

    // Apple mobile web app title
    const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (!appleTitle) {
      const meta = document.createElement('meta');
      meta.name = 'apple-mobile-web-app-title';
      meta.content = 'FlashFusion';
      document.head.appendChild(meta);
    }

    // Apple status bar style
    const appleStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleStatus) {
      const meta = document.createElement('meta');
      meta.name = 'apple-mobile-web-app-status-bar-style';
      meta.content = 'black-translucent';
      document.head.appendChild(meta);
    }

    // Description meta
    const description = document.querySelector('meta[name="description"]');
    if (!description) {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Transform ideas into reality with AI-powered development tools';
      document.head.appendChild(meta);
    }
  }, []);

  const isActive = (path) => location.pathname === path;
  
  const publicNavItems = [
    { name: "Features", path: createPageUrl("Home") + "#features" },
    { name: "Pricing", path: createPageUrl("Home") + "#pricing" },
    { name: "FAQ", path: createPageUrl("Home") + "#faq" }
  ];

  const authenticatedNavItems = [
    { name: "Dashboard", path: createPageUrl("Dashboard"), icon: LayoutDashboard },
    { name: "Dev Dashboard", path: createPageUrl("DeveloperDashboard"), icon: Code },
    { name: "Analytics", path: createPageUrl("Analytics"), icon: BarChart3 },
    { name: "Integrations", path: createPageUrl("Integrations"), icon: Link2 },
    { name: "Activity", path: createPageUrl("ActivityDashboard"), icon: Activity },
    { name: "Collaboration", path: createPageUrl("CollaborationWorkspace"), icon: UsersIcon },
    { name: "RBAC", path: createPageUrl("RBACManager"), icon: Shield }
  ];
  
  const toolComponents = [
    {
      title: "App Builder",
      href: createPageUrl("AppBuilder"),
      description: "Generate full-stack applications from a text prompt.",
      icon: Code,
    },
    {
      title: "Website Cloner",
      href: createPageUrl("WebsiteCloner"),
      description: "Clone any existing website with AI-powered code generation.",
      icon: Globe,
    },
    {
      title: "Content Studio",
      href: createPageUrl("ContentStudio"),
      description: "Create educational materials, lesson plans, and assessments.",
      icon: BookOpen,
    },
  ];

  const cicdComponents = [
    {
      title: "CI/CD Automation",
      href: createPageUrl("CICDAutomation"),
      description: "Configure and manage your deployment pipelines.",
    },
    {
      title: "Activity Dashboard",
      href: createPageUrl("ActivityDashboard"),
      description: "Track generations, API usage, and performance metrics.",
    },
    {
      title: "RBAC Manager",
      href: createPageUrl("RBACManager"),
      description: "Manage roles, permissions, and user access control.",
    },
    {
      title: "Collaboration Workspace",
      href: createPageUrl("CollaborationWorkspace"),
      description: "Work together in real-time with your team.",
    },
    {
      title: "Advanced Analytics",
      href: createPageUrl("AdvancedAnalytics"),
      description: "Deep insights with AI-powered predictions and bottleneck analysis.",
    },
    {
      title: "Extended Analytics",
      href: createPageUrl("ExtendedAnalytics"),
      description: "Code quality, dependencies, costs, and compliance reports.",
    },
    {
      title: "Deployment Center",
      href: createPageUrl("DeploymentCenter"),
      description: "Multi-environment deployments with blue-green and canary strategies.",
    },
    {
      title: "Secrets Vault",
      href: createPageUrl("SecretsVault"),
      description: "Enterprise secrets management with external vault integration.",
    },
    {
      title: "Agent Management",
      href: createPageUrl("AgentManagement"),
      description: "Configure custom agents with behavioral parameters and workflows.",
    },
    {
      title: "Agent Orchestrator",
      href: createPageUrl("AgentOrchestrator"),
      description: "Multi-agent collaboration for intelligent automation workflows.",
    },
    {
      title: "Agent Orchestration",
      href: createPageUrl("AgentOrchestration"),
      description: "Advanced multi-agent roles, permissions, and task execution.",
    },
    {
        title: "Developer Tools",
        href: createPageUrl("DeveloperTools"),
        description: "CLI, VS Code extension, and API playground for local dev.",
      },
      {
        title: "API Documentation",
        href: createPageUrl("APIDocumentation"),
        description: "Full API reference and SDK for external integrations.",
      },
      {
          title: "Integrations Hub",
          href: createPageUrl("IntegrationsHub"),
          description: "27 deep integrations: n8n, Zapier, Notion, Google, GitHub, OpenAI, Claude, and more.",
        },
        {
          title: "Plugin Marketplace",
          href: createPageUrl("PluginMarketplace"),
          description: "Extend with third-party tools and custom AI models via plugin architecture.",
        },
        {
          title: "Plugin Dev Studio",
          href: createPageUrl("PluginDevStudio"),
          description: "Build and test plugins with boilerplate generator and debugging tools.",
        },
  ];

  const navItems = user ? authenticatedNavItems : publicNavItems;

  // Calculate dynamic spacer height based on whether the promo banner is visible
  // The promo banner is roughly 40px tall (10px padding top + ~20px content + 10px padding bottom)
  // The nav bar itself is roughly 73px tall (16px padding top + 40px content + 16px padding bottom + 1px border)
  // So, if no user, banner (40px) + nav (73px) = 113px. If user, only nav (73px).
  const stickyHeaderHeight = user ? '73px' : '113px';

  return (
    <div className="aurora-shell" style={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: `
        radial-gradient(1200px 800px at 20% 10%, rgba(138,92,255,0.18), transparent 60%),
        radial-gradient(900px 600px at 80% 0%, rgba(255,59,212,0.14), transparent 55%),
        linear-gradient(180deg, #04040c, #07071a)
      `,
      color: 'rgba(255,255,255,0.92)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          background: #060612;
          color: rgba(255,255,255,0.92);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 16px;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overscroll-behavior: none;
          -webkit-tap-highlight-color: transparent;
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: 'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        /* PWA Safe Areas */
        @supports(padding: max(0px)) {
          body {
            padding-left: max(0px, env(safe-area-inset-left));
            padding-right: max(0px, env(safe-area-inset-right));
          }
        }

        /* Mobile Optimizations */
        @media (max-width: 768px) {
          * {
            -webkit-user-select: none;
            user-select: none;
          }

          input, textarea, button, select {
            -webkit-user-select: text;
            user-select: text;
          }
        }
        
        .ff-gradient-text {
          background: linear-gradient(135deg, #FF7B00 0%, #00B4D8 50%, #E91E63 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .ff-card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .ff-card:hover {
          border-color: rgba(255, 123, 0, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(255, 123, 0, 0.2);
        }

        .ff-card-interactive:hover {
          background: rgba(255, 123, 0, 0.15);
          border-color: rgba(255, 123, 0, 0.5);
        }
        
        .ff-btn-primary {
          background: #FF7B00;
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .ff-btn-primary:hover {
          background: #E66D00;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255, 123, 0, 0.4);
        }
        
        .ff-btn-secondary {
          background: rgba(0, 180, 216, 0.1);
          color: #00B4D8;
          border: 1px solid #00B4D8;
          padding: 12px 32px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .ff-btn-secondary:hover {
          background: rgba(0, 180, 216, 0.2);
          transform: translateY(-2px);
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .ff-fade-in {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .ff-nav-link {
          color: #CBD5E1;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 500;
        }
        
        .ff-nav-link:hover {
          color: #FF7B00;
          background: rgba(255, 123, 0, 0.1);
        }
        
        .ff-nav-link-active {
          color: #FF7B00;
          background: rgba(255, 123, 0, 0.15);
        }

        .ff-sticky-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .ff-nav-scrolled {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
        }

        .ff-promo-banner {
          background: linear-gradient(135deg, rgba(233, 30, 99, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%);
          padding: 10px 24px;
          text-align: center;
          animation: slideDown 0.5s ease;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .ff-mobile-menu {
          background: rgba(15, 23, 42, 0.98);
          backdrop-filter: blur(12px);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        @media (min-width: 768px) {
          .ff-desktop-nav {
            display: flex !important;
          }
          .ff-mobile-menu-btn {
            display: none !important;
          }
        }

        @media (max-width: 767px) {
          .ff-desktop-nav {
            display: none !important;
          }
          .ff-mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>

      {/* Sticky Navigation */}
      <div className={`ff-sticky-nav ${scrolled ? 'ff-nav-scrolled' : ''}`}>
        {/* Promotional Banner */}
        {!user && (
          <div className="ff-promo-banner">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>
                🎁 Limited Time Launch Offer:
              </span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: 'white' }}>
                50% OFF
              </span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)' }}>
                for 4 months | Limited spots available
              </span>
            </div>
          </div>
        )}

        {/* Main Navigation Bar */}
        <nav style={{
          backgroundColor: scrolled ? 'transparent' : 'rgba(15, 23, 42, 0.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {/* Logo */}
            <Link to={createPageUrl("Home")} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FF7B00, #E91E63)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '20px',
                boxShadow: '0 4px 12px rgba(255, 123, 0, 0.3)'
              }}>
                F
              </div>
              <span style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#FFFFFF',
                letterSpacing: '-0.5px'
              }}>
                FlashFusion
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="ff-desktop-nav" style={{
              display: 'none',
              gap: '8px',
              alignItems: 'center'
            }}>
              {user ? (
                <NavigationMenu>
                  <NavigationMenuList>
                    {authenticatedNavItems.map(item => (
                      <NavigationMenuItem key={item.name}>
                        <Link to={item.path} legacyBehavior passHref>
                          <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white focus:bg-slate-800", isActive(item.path) && "bg-slate-800 text-white")}>
                            <item.icon className="w-4 h-4 mr-2" />
                            {item.name}
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    ))}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white focus:bg-slate-800">
                        <Wrench className="w-4 h-4 mr-2" />
                        AI Tools
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-slate-900/95 border border-slate-800 backdrop-blur-sm">
                          {toolComponents.map((component) => (
                            <ListItem
                              key={component.title}
                              title={component.title}
                              href={component.href}
                            >
                              {component.description}
                            </ListItem>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white focus:bg-slate-800">
                        <Rocket className="w-4 h-4 mr-2" />
                        CI/CD
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-slate-900/95 border border-slate-800 backdrop-blur-sm">
                          {cicdComponents.map((component) => (
                            <ListItem
                              key={component.title}
                              title={component.title}
                              href={component.href}
                            >
                              {component.description}
                            </ListItem>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              ) : (
                <>
                  {navItems.map(item => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`ff-nav-link ${isActive(item.path) ? 'ff-nav-link-active' : ''}`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </>
              )}
              
              {!user && (
                <Link
                  to={createPageUrl("Home") + "#demo"}
                  style={{
                    color: '#00B4D8',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: '1px solid #00B4D8',
                    background: 'rgba(0, 180, 216, 0.1)',
                    transition: 'all 0.3s ease',
                    marginLeft: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 180, 216, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 180, 216, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <PlayCircle className="w-4 h-4" />
                  Try Interactive Demo
                </Link>
              )}
            </div>

            {/* Notifications */}
            {user && (
              <div className="ff-desktop-nav" style={{
                display: 'none',
                gap: '12px',
                alignItems: 'center'
              }}>
                <NotificationCenter user={user} />
              </div>
            )}

            {/* Auth Buttons */}
            <div className="ff-desktop-nav" style={{
              display: 'none',
              gap: '12px',
              alignItems: 'center'
            }}>
              {user ? (
                <>
                  <div style={{
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#CBD5E1'
                  }}>
                    {user.full_name || user.email}
                  </div>
                  <Button
                    onClick={() => base44.auth.logout()}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#EF4444',
                      border: '1px solid #EF4444',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => base44.auth.redirectToLogin()}
                    style={{
                      background: 'transparent',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                  >
                    <ArrowRight size={16} />
                    Sign In
                  </Button>
                  <Button
                    onClick={() => base44.auth.redirectToLogin()}
                    style={{
                      background: 'linear-gradient(135deg, #FF7B00, #E91E63)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      boxShadow: '0 4px 12px rgba(255, 123, 0, 0.3)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 123, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 123, 0, 0.3)';
                    }}
                  >
                    <UserPlus size={16} />
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="ff-mobile-menu-btn"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '8px'
              }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="ff-mobile-menu" style={{
              padding: '16px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {/* For mobile, if user is authenticated, we show dashboard, analytics, and then "AI Tools" as a single link */}
              {user ? (
                <>
                  {authenticatedNavItems.map(item => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`ff-nav-link ${isActive(item.path) ? 'ff-nav-link-active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon && <item.icon style={{ width: '18px', height: '18px' }} />}
                      {item.name}
                    </Link>
                  ))}
                  {/* For mobile, the AI Tools becomes a single link to a default tools page or a general tools overview */}
                  <Link
                    to={createPageUrl("Tools")}
                    className={`ff-nav-link ${isActive(createPageUrl("Tools")) ? 'ff-nav-link-active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Wrench style={{ width: '18px', height: '18px' }} />
                    AI Tools
                  </Link>
                </>
              ) : (
                navItems.map(item => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`ff-nav-link ${isActive(item.path) ? 'ff-nav-link-active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon && <item.icon style={{ width: '18px', height: '18px' }} />}
                    {item.name}
                  </Link>
                ))
              )}
              
              {!user && (
                <Link
                  to={createPageUrl("Home") + "#demo"}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    color: '#00B4D8',
                    textDecoration: 'none',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '500',
                    border: '1px solid #00B4D8',
                    background: 'rgba(0, 180, 216, 0.1)',
                    marginTop: '8px',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <PlayCircle className="w-4 h-4" />
                  Try Interactive Demo
                </Link>
              )}
              
              <div style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '16px',
                marginTop: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {user ? (
                  <>
                    <div style={{
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#CBD5E1',
                      textAlign: 'center'
                    }}>
                      {user.full_name || user.email}
                    </div>
                    <Button
                      onClick={() => base44.auth.logout()}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#EF4444',
                        border: '1px solid #EF4444',
                        width: '100%',
                        padding: '12px'
                      }}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => base44.auth.redirectToLogin()}
                      style={{
                        background: 'transparent',
                        color: '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        width: '100%',
                        padding: '12px'
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => base44.auth.redirectToLogin()}
                      style={{
                        background: 'linear-gradient(135deg, #FF7B00, #E91E63)',
                        color: 'white',
                        border: 'none',
                        width: '100%',
                        padding: '12px',
                        boxShadow: '0 4px 12px rgba(255, 123, 0, 0.3)'
                      }}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Aurora Background Layer */}
      <AuroraBackground />

      {/* Spacer for fixed nav */}
      <div style={{ height: stickyHeaderHeight }} />

      {/* Main Content */}
      <main>
        {children}
      </main>



      {/* Footer */}
      <footer style={{
        marginTop: '80px',
        padding: '40px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        color: '#94A3B8'
      }}>
        <p>© 2024 FlashFusion. Transform ideas into reality with AI.</p>
      </footer>
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <LayoutContent>{children}</LayoutContent>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}