import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Search, Filter, Star, TrendingUp, Zap, ExternalLink,
  Sparkles, Code, BarChart3, Workflow, TestTube, Rocket
} from "lucide-react";
import { motion } from "framer-motion";

const categoryIcons = {
  ai_tools: Sparkles,
  development: Code,
  analytics: BarChart3,
  automation: Zap,
  workflow: Workflow,
  testing: TestTube,
  deployment: Rocket,
};

const categoryColors = {
  ai_tools: "from-purple-500 to-pink-500",
  development: "from-blue-500 to-cyan-500",
  analytics: "from-green-500 to-emerald-500",
  automation: "from-orange-500 to-yellow-500",
  workflow: "from-indigo-500 to-purple-500",
  testing: "from-red-500 to-pink-500",
  deployment: "from-cyan-500 to-blue-500",
};

export default function Marketplace() {
  usePageTracking('Marketplace');
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['apps'],
    queryFn: () => base44.entities.AppListing.list('-featured', 100),
  });

  const categories = [
    { id: "all", label: "All Apps", icon: Filter },
    { id: "ai_tools", label: "AI Tools", icon: Sparkles },
    { id: "development", label: "Development", icon: Code },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "automation", label: "Automation", icon: Zap },
    { id: "workflow", label: "Workflow", icon: Workflow },
  ];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredApps = apps.filter(app => app.featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 py-12"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            App Marketplace
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Discover powerful applications to transform your workflow
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search apps, features, categories..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) {
                  PersonalizationService.trackSearch(e.target.value);
                }
              }}
              className="pl-12 h-14 bg-slate-800/50 border-slate-700 text-lg"
            />
          </div>
        </motion.div>

        {/* Featured Apps */}
        {featuredApps.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold">Featured Apps</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredApps.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={app.is_internal ? app.app_url : '#'}
                    onClick={() => PersonalizationService.trackAppClick(app.id, app.name)}
                  >
                    <Card className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 hover:border-purple-500 transition-all cursor-pointer group">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${categoryColors[app.category] || 'from-slate-600 to-slate-700'}`}>
                          {React.createElement(categoryIcons[app.category] || Sparkles, { className: "w-6 h-6" })}
                        </div>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          Featured
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                        {app.name}
                      </h3>
                      <p className="text-slate-400 text-sm mb-4">{app.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          {app.rating || 4.5}
                        </div>
                        {!app.is_internal && <ExternalLink className="w-4 h-4 text-slate-400" />}
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {categories.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              onClick={() => setSelectedCategory(id)}
              variant={selectedCategory === id ? "default" : "outline"}
              className={`flex items-center gap-2 whitespace-nowrap ${
                selectedCategory === id 
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600' 
                  : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Apps Grid */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold">
              {selectedCategory === "all" ? "All Applications" : categories.find(c => c.id === selectedCategory)?.label}
            </h2>
            <span className="text-slate-400">({filteredApps.length})</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6 bg-slate-800/50 border-slate-700 animate-pulse">
                  <div className="h-12 w-12 bg-slate-700 rounded-xl mb-4"></div>
                  <div className="h-6 bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded"></div>
                </Card>
              ))}
            </div>
          ) : filteredApps.length === 0 ? (
            <Card className="p-12 bg-slate-800/50 border-slate-700 text-center">
              <p className="text-slate-400 text-lg">No apps found matching your criteria</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={app.is_internal ? app.app_url : '#'}
                    onClick={() => PersonalizationService.trackAppClick(app.id, app.name)}
                  >
                    <Card className="p-6 bg-slate-800/50 border-slate-700 hover:border-cyan-500 transition-all cursor-pointer group h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${categoryColors[app.category] || 'from-slate-600 to-slate-700'}`}>
                          {React.createElement(categoryIcons[app.category] || Sparkles, { className: "w-6 h-6" })}
                        </div>
                        {app.status === 'beta' && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            Beta
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                        {app.name}
                      </h3>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{app.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          {app.rating || 4.5}
                        </div>
                        <span className="text-slate-500">{app.install_count || 0} installs</span>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}