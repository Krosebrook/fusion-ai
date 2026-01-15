import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Sparkles, Rocket, ArrowRight, Star, TrendingUp, Zap,
  Code, BarChart3, Workflow, Users, Globe, Shield
} from "lucide-react";

export default function HomePage() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: featuredApps = [] } = useQuery({
    queryKey: ['featured-apps'],
    queryFn: () => base44.entities.AppListing.filter({ featured: true }, '-rating', 6),
    initialData: [],
  });

  const stats = [
    { label: "Active Users", value: "10K+", icon: Users },
    { label: "Applications", value: "50+", icon: Rocket },
    { label: "Countries", value: "120+", icon: Globe },
    { label: "Uptime", value: "99.9%", icon: Shield },
  ];

  const categories = [
    { name: "AI Tools", icon: Sparkles, count: 12, color: "from-purple-500 to-pink-500" },
    { name: "Development", icon: Code, count: 8, color: "from-blue-500 to-cyan-500" },
    { name: "Analytics", icon: BarChart3, count: 6, color: "from-green-500 to-emerald-500" },
    { name: "Automation", icon: Zap, count: 10, color: "from-orange-500 to-yellow-500" },
  ];

  return (
    <div className="bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Welcome to FlashFusion Hub
            </Badge>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
              Your Central Command for AI-Powered Applications
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto">
              Access a curated ecosystem of intelligent tools, workflows, and integrations—all in one place.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {user ? (
                <>
                  <Link to={createPageUrl("Dashboard")}>
                    <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 px-8 py-6 text-lg">
                      <Rocket className="w-5 h-5 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link to={createPageUrl("Marketplace")}>
                    <Button variant="outline" className="border-slate-600 hover:bg-slate-800 px-8 py-6 text-lg">
                      Explore Marketplace
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => base44.auth.redirectToLogin()}
                    className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 px-8 py-6 text-lg"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Link to={createPageUrl("Marketplace")}>
                    <Button variant="outline" className="border-slate-600 hover:bg-slate-800 px-8 py-6 text-lg">
                      Browse Apps
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 px-6 border-y border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-cyan-400" />
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Apps */}
      {featuredApps.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-4xl font-bold mb-2">Featured Applications</h2>
                <p className="text-slate-400">Handpicked tools to accelerate your workflow</p>
              </div>
              <Link to={createPageUrl("Marketplace")}>
                <Button variant="outline" className="border-slate-600 hover:bg-slate-800">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredApps.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={app.is_internal ? app.app_url : '#'}>
                    <Card className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 hover:border-purple-500 transition-all cursor-pointer group overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                          {app.name}
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">{app.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-slate-700/50 text-slate-300 text-xs">
                            {app.category?.replace('_', ' ')}
                          </Badge>
                          <span className="text-slate-500 text-xs">{app.install_count || 0} installs</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Explore by Category</h2>
            <p className="text-slate-400">Find the perfect tools for your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={createPageUrl("Marketplace")}>
                  <Card className="p-6 bg-slate-800/50 border-slate-700 hover:border-cyan-500 transition-all cursor-pointer group text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <category.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-slate-400 text-sm">{category.count} apps</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl text-slate-300 mb-10">
              Join thousands of teams building the future with AI-powered applications
            </p>
            {!user && (
              <Button 
                onClick={() => base44.auth.redirectToLogin()}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 px-10 py-6 text-lg"
              >
                Start Building Today
                <Rocket className="w-5 h-5 ml-2" />
              </Button>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}