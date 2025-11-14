
import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Code, Zap, Shield, BarChart3, ShoppingCart, 
  Globe, Workflow, Brain, CheckCircle, ArrowRight, Check, 
  Gift, Clock, Users, PlayCircle, DollarSign, PenTool, Bot, Code2, MoveRight, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import InteractiveDemoPreview from "@/components/InteractiveDemoPreview";
import { Switch } from "@/components/ui/switch";

// Accordion Component for FAQ
const AccordionItem = ({ question, answer, isOpen, onClick }) => (
  <div className="border-b border-gray-700 py-6">
    <button
      onClick={onClick}
      className="w-full flex justify-between items-center text-left"
    >
      <h3 className="text-lg font-medium text-white">{question}</h3>
      {isOpen ? <ChevronUp className="text-orange-400" /> : <ChevronDown className="text-gray-400" />}
    </button>
    {isOpen && (
      <div className="mt-4 text-gray-400 leading-relaxed">
        <p>{answer}</p>
      </div>
    )}
  </div>
);

export default function HomePage() {
  const [pricingTier, setPricingTier] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);

  const pricingPlans = {
    monthly: [
      { 
        name: "Starter Pro", 
        price: "$29", 
        description: "Perfect for individual creators",
        features: [
          "50 AI generations/month", 
          "Basic deployment tools", 
          "Community support",
          "1 team member",
          "Standard security"
        ], 
        cta: "Start Free Trial", 
        popular: false 
      },
      { 
        name: "Professional Pro", 
        price: "$99", 
        description: "Best for growing businesses",
        features: [
          "Unlimited AI generations", 
          "Advanced deployment", 
          "Priority support", 
          "10 team members",
          "Enhanced security",
          "Custom integrations",
          "API access"
        ], 
        cta: "Get Started", 
        popular: true 
      },
      { 
        name: "Enterprise Pro", 
        price: "Custom", 
        description: "For large organizations",
        features: [
          "Everything in Professional",
          "Dedicated account manager",
          "Custom AI training",
          "Unlimited team members",
          "SLA guarantee",
          "On-premise deployment"
        ], 
        cta: "Contact Sales", 
        popular: false 
      }
    ],
    annual: [
      { 
        name: "Starter Pro", 
        price: "$24", 
        description: "Perfect for individual creators",
        features: [
          "50 AI generations/month", 
          "Basic deployment tools", 
          "Community support",
          "1 team member",
          "Standard security"
        ], 
        cta: "Start Free Trial", 
        popular: false 
      },
      { 
        name: "Professional Pro", 
        price: "$83", 
        description: "Best for growing businesses",
        features: [
          "Unlimited AI generations", 
          "Advanced deployment", 
          "Priority support", 
          "10 team members",
          "Enhanced security",
          "Custom integrations",
          "API access"
        ], 
        cta: "Get Started", 
        popular: true 
      },
      { 
        name: "Enterprise Pro", 
        price: "Custom", 
        description: "For large organizations",
        features: [
          "Everything in Professional",
          "Dedicated account manager",
          "Custom AI training",
          "Unlimited team members",
          "SLA guarantee",
          "On-premise deployment"
        ], 
        cta: "Contact Sales", 
        popular: false 
      }
    ]
  };

  const faqs = [
    {
      question: "What is FlashFusion and how does it work?",
      answer: "FlashFusion is an AI-powered development platform that transforms your concepts into production-ready applications, content, and revenue streams in minutes."
    },
    {
      question: "How does the AI content generation work?",
      answer: "Our AI uses advanced language models to generate code, copy, and creative assets based on your specifications, with 98% accuracy."
    },
    {
      question: "How secure is my data and content?",
      answer: "We use bank-level encryption, SOC 2 compliance, and never share your data. Your intellectual property remains 100% yours."
    },
    {
      question: "Can I use FlashFusion content for commercial purposes?",
      answer: "Yes! All content generated on FlashFusion is yours to use commercially without restrictions."
    },
    {
      question: "Do you offer a free trial?",
      answer: "Yes, all plans come with a 14-day free trial. No credit card is required to get started."
    }
  ];

  const floatingFeatures = [
    { icon: Zap, text: '10x Faster Development', color: 'text-yellow-400' },
    { icon: Shield, text: 'Enterprise Security', color: 'text-cyan-400' },
    { icon: DollarSign, text: 'Built-in Monetization', color: 'text-pink-400' },
  ];

  const trustedByLogos = [
    "https://storage.googleapis.com/builder-prod-config/companies/logos/google-light.svg",
    "https://storage.googleapis.com/builder-prod-config/companies/logos/amazon-light.svg",
    "https://storage.googleapis.com/builder-prod-config/companies/logos/microsoft-light.svg",
    "https://storage.googleapis.com/builder-prod-config/companies/logos/airbnb-light.svg",
    "https://storage.googleapis.com/builder-prod-config/companies/logos/spotify-light.svg",
  ];

  const howItWorksSteps = [
    { icon: PenTool, title: "1. Describe", description: "Explain your idea in plain English, from a simple task to a full application." },
    { icon: Bot, title: "2. Generate", description: "Our AI agents analyze, plan, and generate production-ready code and content." },
    { icon: Code2, title: "3. Deploy", description: "Deploy your creation to over 20 platforms with a single click and go live instantly." }
  ];

  const useCases = {
    developers: {
      title: "Build & Ship Faster",
      description: "Stop writing boilerplate. Generate full-stack apps, APIs, and components, then deploy instantly. Focus on hard problems, not repetitive code.",
      image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop",
      features: ["Full-Stack App Generation", "API & Backend Creation", "One-Click Deployment"]
    },
    creators: {
      title: "Create at Scale",
      description: "Turn your knowledge into a business. Generate courses, marketing copy, and social media content effortlessly, then monetize it with our commerce tools.",
      image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop",
      features: ["Educational Content Studio", "Marketing Content Suite", "Creator Commerce Hub"]
    },
    entrepreneurs: {
      title: "Automate Your Business",
      description: "Build internal tools, automate workflows, and get AI-powered business insights without hiring a full dev team. Launch your MVP in days, not months.",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
      features: ["Business Intelligence Hub", "Multi-Agent Orchestration", "Custom Internal Tools"]
    },
  };
  const [activeUseCase, setActiveUseCase] = useState('developers');

  const testimonials = [
    {
      name: "Sarah L.",
      role: "Indie Developer",
      quote: "FlashFusion took my side project from idea to deployed MVP in a weekend. The AI-generated code was surprisingly clean. This is the future.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop",
    },
    {
      name: "Mike T.",
      role: "Founder, CreativeCo",
      quote: "As a non-technical founder, FlashFusion is my secret weapon. I can now build internal tools and automate workflows without writing a single line of code.",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop",
    },
    {
      name: "Jessica P.",
      role: "Content Creator",
      quote: "I went from spending 20 hours a week on content creation to just 5. The quality is top-notch, and I'm able to focus on growing my brand.",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=300&auto=format&fit=crop",
    }
  ];

  const integrationLogos = [
    { name: "Vercel", src: "https://www.svgrepo.com/show/354515/vercel-icon.svg" },
    { name: "GitHub", src: "https://www.svgrepo.com/show/353784/github-icon.svg" },
    { name: "Figma", src: "https://www.svgrepo.com/show/353733/figma.svg" },
    { name: "Stripe", src: "https://www.svgrepo.com/show/354397/stripe.svg" },
    { name: "Slack", src: "https://www.svgrepo.com/show/354333/slack-icon.svg" },
    { name: "Notion", src: "https://www.svgrepo.com/show/354129/notion-icon.svg" },
  ];

  const handleFaqToggle = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div style={{
      backgroundImage: `url('https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2070&auto=format&fit=crop')`,
      backgroundAttachment: 'fixed',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden" style={{
        background: 'rgba(15, 23, 42, 0.6)'
      }}>
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" />
        
        <div className="max-w-6xl mx-auto relative z-10">

          {/* Top Banners */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="inline-flex items-center gap-3 bg-gray-800/50 border border-gray-700 rounded-full px-4 py-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300 text-sm font-medium">Join 10,000+ creators building the future</span>
            </div>
            <div className="inline-flex items-center gap-3 bg-purple-900/50 border border-purple-700 rounded-full px-4 py-2 text-sm">
              <Gift className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-white">Limited Time Launch Offer:</span>
              <span className="font-bold text-pink-400">50% OFF</span>
              <span className="text-gray-300">for 4 months</span>
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Limited spots available</span>
            </div>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white">Transform Ideas Into </span>
              <span className="bg-gradient-to-r from-yellow-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Reality With AI
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The most advanced AI development platform that turns your concepts into{' '}
              <span className="text-orange-400 font-semibold">production-ready applications</span>,
              content, and revenue streams in minutes, not months.
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
             <InteractiveDemoPreview />

             {/* Floating Feature Tags */}
             <div className="absolute inset-0 flex items-center justify-center">
                {floatingFeatures.map((feature, i) => (
                    <div 
                        key={i}
                        className={`absolute flex items-center gap-2 bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-full px-4 py-2 ${feature.color}`}
                        style={{
                            '--initial-rotate': `${i * 60 - 60}deg`,
                            '--neg-initial-rotate': `${-(i * 60 - 60)}deg`,
                            transform: `rotate(${i * 60 - 60}deg) translate(250px) rotate(${-(i * 60 - 60)}deg)`,
                            animation: `float-feature ${6 + i*2}s ease-in-out infinite alternate`
                        }}
                    >
                        <feature.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{feature.text}</span>
                    </div>
                ))}
             </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
            <div className="relative">
              <Button
                onClick={() => window.location.href = createPageUrl("Dashboard")}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg px-10 py-8 rounded-xl shadow-2xl shadow-orange-500/30"
              >
                <div className="flex flex-col items-center">
                  <span className="font-bold">Get 50% Off - Start Building</span>
                  <span className="text-xs text-orange-200 mt-1">4 months promotional pricing</span>
                </div>
              </Button>
              <div className="absolute -top-3 -right-3 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full transform rotate-12">
                50% OFF
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => document.querySelector('#demo')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white text-lg px-10 py-8 rounded-xl"
            >
              <div className="flex flex-col items-center">
                <span className="font-bold flex items-center gap-2"><PlayCircle className="w-5 h-5"/> Try Interactive Demo</span>
                <span className="text-xs text-gray-500 mt-1">No signup required</span>
              </div>
            </Button>
          </div>

        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6">
          <h3 className="text-center text-gray-400 text-sm font-semibold tracking-wider uppercase mb-8">
            Trusted by innovators at
          </h3>
          <div className="flex justify-center items-center gap-x-8 md:gap-x-12 flex-wrap">
            {trustedByLogos.map((logo, index) => (
              <img key={index} src={logo} alt={`Logo ${index+1}`} className="h-6 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all" />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-gray-900/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Your Idea to Reality in 3 Simple Steps
            </h2>
            <p className="text-gray-400 text-lg">
              FlashFusion streamlines the entire creation process, from concept to deployment.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="relative z-10 bg-gray-800/50 border border-gray-700 rounded-xl p-8">
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center mb-6 mx-auto`}>
                    <step.icon className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
                {index < howItWorksSteps.length - 1 && (
                  <div className="absolute top-1/2 left-full -translate-y-1/2 w-1/3 hidden md:block">
                      <MoveRight className="w-8 h-8 text-gray-600 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 px-6 bg-gray-900/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Every Kind of Creator
            </h2>
            <p className="text-gray-400 text-lg">
              Whether you're a developer, founder, or creative, FlashFusion adapts to your workflow.
            </p>
          </div>
          <div className="flex justify-center gap-4 mb-8 border-b border-gray-700">
            {Object.keys(useCases).map(key => (
              <button
                key={key}
                onClick={() => setActiveUseCase(key)}
                className={`px-4 py-3 font-medium capitalize transition-colors ${activeUseCase === key ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400 hover:text-white'}`}
              >
                {key}
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-4">{useCases[activeUseCase].title}</h3>
              <p className="text-gray-300 text-lg mb-6">{useCases[activeUseCase].description}</p>
              <ul className="space-y-3">
                {useCases[activeUseCase].features.map(feature => (
                  <li key={feature} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <img src={useCases[activeUseCase].image} alt={useCases[activeUseCase].title} className="rounded-xl shadow-2xl shadow-black/30" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6 bg-gray-900/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Loved by Thousands of Creators</h2>
            <p className="text-gray-400 text-lg">Don't just take our word for it. Here's what our users are saying.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-14 h-14 rounded-full object-cover"/>
                  <div>
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-orange-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                create & scale
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Professional-grade AI tools designed for creators, developers, and entrepreneurs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Code,
                title: "AI Code Generation",
                description: "Generate production-ready code in any language with advanced AI models trained on billions of code examples",
                badge: "75.9K accuracy",
                gradient: "from-orange-500 to-red-500",
              },
              {
                icon: Globe,
                title: "Website Cloner",
                description: "Clone any website with AI-powered code generation. Convert designs to code instantly",
                badge: "NEW",
                gradient: "from-blue-500 to-cyan-500",
                link: createPageUrl("WebsiteCloner"),
              },
              {
                icon: Brain,
                title: "Content Creation",
                description: "Create stunning visuals, compelling copy, and engaging media content at the speed of thought",
                badge: "No limits",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Zap,
                title: "One-Click Deploy",
                description: "Deploy your applications instantly across 20+ platforms with automated optimization and scaling",
                badge: "Fastest Deploy",
                gradient: "from-yellow-500 to-orange-500",
              },
              {
                icon: ShoppingCart,
                title: "Revenue Streams",
                description: "Built-in monetization tools including marketplace integration, subscription management, and analytics",
                badge: "Up to 16.9K",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Bank-level security with end-to-end encryption, SOC 2 compliance, and advanced threat protection",
                badge: "100% secure",
                gradient: "from-indigo-500 to-purple-500",
              },
              {
                icon: BarChart3,
                title: "Analytics & Insights",
                description: "Real-time performance tracking, user behavior analysis, and AI-powered optimization recommendations",
                badge: "Real-time data",
                gradient: "from-pink-500 to-rose-500",
              },
              {
                icon: Workflow,
                title: "Multi-Agent Orchestration",
                description: "Coordinate multiple AI agents to handle complex workflows and automate business processes",
                badge: "Advanced",
                gradient: "from-cyan-500 to-blue-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                onClick={() => feature.link && (window.location.href = feature.link)}
                className={`bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all ${
                  feature.link ? 'cursor-pointer hover:scale-105' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  {feature.badge && (
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
                      {feature.badge}
                    </span>
                  )}
                </div>

                <p className="text-gray-400 mb-4">{feature.description}</p>

                {feature.link && (
                  <div className="flex items-center text-blue-400 text-sm font-medium">
                    Learn more <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Integrations Section */}
      <section className="py-20 bg-gray-900/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Works With Your Stack</h2>
            <p className="text-gray-400 text-lg">Integrate seamlessly with the tools you already use and love.</p>
          </div>
          <div className="flex justify-center items-center gap-x-12 md:gap-x-16 flex-wrap filter grayscale opacity-60">
            {integrationLogos.map((logo, index) => (
              <img key={index} src={logo.src} alt={logo.name} title={logo.name} className="h-10 my-4" />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{
        padding: '120px 24px',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.95) 100%)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: '800',
              marginBottom: '16px'
            }}>
              Choose Your Plan
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#CBD5E1',
              marginBottom: '32px'
            }}>
              All plans include our core AI development platform with premium support.
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className={`font-medium ${pricingTier === 'monthly' ? 'text-orange-400' : 'text-gray-400'}`}>Monthly</span>
              <Switch
                checked={pricingTier === 'annual'}
                onCheckedChange={(checked) => setPricingTier(checked ? 'annual' : 'monthly')}
              />
              <span className={`font-medium ${pricingTier === 'annual' ? 'text-orange-400' : 'text-gray-400'}`}>
                Annually <span className="text-green-400 text-sm">(Save 15%)</span>
              </span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {pricingPlans[pricingTier].map(plan => (
              <div
                key={plan.name}
                className="ff-card"
                style={{
                  padding: '40px',
                  position: 'relative',
                  border: plan.popular ? '2px solid #FF7B00' : '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#FF7B00',
                    color: 'white',
                    padding: '6px 20px',
                    borderRadius: '100px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase'
                  }}>
                    Most Popular
                  </div>
                )}

                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  marginBottom: '8px'
                }}>
                  {plan.name}
                </h3>

                <p style={{
                  color: '#94A3B8',
                  fontSize: '14px',
                  marginBottom: '24px'
                }}>
                  {plan.description}
                </p>

                <div style={{ marginBottom: '32px' }}>
                  <span style={{
                    fontSize: '48px',
                    fontWeight: '800',
                    color: '#FFFFFF'
                  }}>
                    {plan.price}
                  </span>
                  {plan.price !== "Custom" && (
                    <span style={{ color: '#94A3B8', fontSize: '16px' }}>/month</span>
                  )}
                </div>

                <button
                  className={plan.popular ? "ff-btn-primary" : "ff-btn-secondary"}
                  style={{
                    width: '100%',
                    marginBottom: '32px',
                    padding: '14px'
                  }}
                >
                  {plan.cta}
                </button>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '24px' }}>
                  {plan.features.map(feature => (
                    <div key={feature} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px',
                      fontSize: '14px',
                      color: '#CBD5E1'
                    }}>
                      <Check size={18} style={{ color: '#10B981', flexShrink: 0 }} />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{ padding: '120px 24px', background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: '800',
              marginBottom: '16px'
            }}>
              Frequently Asked Questions
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#CBD5E1'
            }}>
              Find answers to common questions about FlashFusion.
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaq === index}
                onClick={() => handleFaqToggle(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '120px 24px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: '800',
            marginBottom: '24px'
          }}>
            Ready to build the <span className="ff-gradient-text">future</span>?
          </h2>

          <p style={{
            fontSize: '20px',
            color: '#CBD5E1',
            marginBottom: '48px'
          }}>
            Join thousands of creators, developers, and entrepreneurs who are already
            building amazing things with FlashFusion AI.
          </p>

          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link to={createPageUrl("Dashboard")}>
              <button className="ff-btn-primary ff-glow-orange" style={{
                fontSize: '18px',
                padding: '18px 48px'
              }}>
                Start Building - 50% OFF
              </button>
            </Link>

            <Link to={createPageUrl("Tools")}>
              <button className="ff-btn-secondary" style={{
                fontSize: '18px',
                padding: '18px 48px'
              }}>
                Try Demo First
              </button>
            </Link>
          </div>

          <p style={{
            fontSize: '14px',
            color: '#94A3B8',
            marginTop: '32px'
          }}>
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </section>
      <style>{`
        @keyframes float-feature {
            from { transform: translateY(0px) rotate(var(--initial-rotate, 0deg)) translate(var(--translate-dist, 250px)) rotate(var(--neg-initial-rotate, 0deg)); }
            to { transform: translateY(20px) rotate(var(--initial-rotate, 0deg)) translate(var(--translate-dist, 250px)) rotate(var(--neg-initial-rotate, 0deg)); }
        }
      `}</style>
    </div>
  );
}
