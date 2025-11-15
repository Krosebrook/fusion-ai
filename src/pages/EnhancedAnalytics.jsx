import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User } from "@/entities/User";
import { Event } from "@/entities/Event";
import { Session } from "@/entities/Session";
import StatsGrid from "@/components/analytics/StatsGrid";
import CinematicChart from "@/components/analytics/CinematicChart";
import { 
  BarChart3, Users, Activity, Eye, Clock, Target, 
  TrendingUp, Zap, Globe, MousePointer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const easeInOutCubic = [0.4, 0, 0.2, 1];

export default function EnhancedAnalyticsPage() {
  const [user, setUser] = useState(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      // Load analytics data here
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data - replace with real data
  const stats = [
    {
      label: "Total Users",
      value: "12,458",
      trend: 12.5,
      subtitle: "Last 7 days",
      icon: Users,
      color: "#00B4D8",
      sparkline: [40, 60, 45, 70, 55, 80, 75]
    },
    {
      label: "Active Sessions",
      value: "3,247",
      trend: 8.3,
      subtitle: "Currently active",
      icon: Activity,
      color: "#10B981",
      sparkline: [30, 50, 40, 65, 50, 75, 85]
    },
    {
      label: "Page Views",
      value: "48.2K",
      trend: -2.4,
      subtitle: "This month",
      icon: Eye,
      color: "#FF7B00",
      sparkline: [50, 70, 60, 55, 45, 65, 60]
    },
    {
      label: "Avg. Duration",
      value: "4m 32s",
      trend: 15.8,
      subtitle: "Per session",
      icon: Clock,
      color: "#8B5CF6",
      sparkline: [35, 45, 55, 60, 70, 65, 80]
    }
  ];

  const userGrowthData = [
    { name: "Jan", value: 4000, users: 2400 },
    { name: "Feb", value: 3000, users: 1398 },
    { name: "Mar", value: 2000, users: 9800 },
    { name: "Apr", value: 2780, users: 3908 },
    { name: "May", value: 1890, users: 4800 },
    { name: "Jun", value: 2390, users: 3800 },
    { name: "Jul", value: 3490, users: 4300 }
  ];

  const sessionData = [
    { name: "Mon", value: 65 },
    { name: "Tue", value: 85 },
    { name: "Wed", value: 75 },
    { name: "Thu", value: 95 },
    { name: "Fri", value: 88 },
    { name: "Sat", value: 70 },
    { name: "Sun", value: 62 }
  ];

  const conversionData = [
    { name: "Week 1", value: 24 },
    { name: "Week 2", value: 38 },
    { name: "Week 3", value: 42 },
    { name: "Week 4", value: 56 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeInOutCubic }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-orange-500/30"
            >
              <BarChart3 className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Analytics Dashboard
              </h1>
              <p className="text-gray-400 mt-1">Real-time insights with cinematic visuals</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg shadow-orange-500/30">
              <TrendingUp className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <StatsGrid stats={stats} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CinematicChart
            title="User Growth"
            subtitle="New users over time"
            value="12,458"
            change="+12.5%"
            data={userGrowthData}
            dataKey="users"
            type="area"
            color="#00B4D8"
            height={300}
          />

          <CinematicChart
            title="Session Activity"
            subtitle="Active sessions this week"
            value="3,247"
            change="+8.3%"
            data={sessionData}
            dataKey="value"
            type="line"
            color="#10B981"
            height={300}
          />

          <CinematicChart
            title="Conversion Rate"
            subtitle="Weekly conversion metrics"
            value="42%"
            change="+15.8%"
            data={conversionData}
            dataKey="value"
            type="bar"
            color="#FF7B00"
            height={300}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: easeInOutCubic }}
            className="rounded-2xl border border-white/10 p-6"
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
            }}
          >
            <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Top Performing Pages
            </h3>
            <div className="space-y-4">
              {[
                { page: "/dashboard", views: "8,432", change: "+12%", color: "#00B4D8" },
                { page: "/analytics", views: "6,231", change: "+8%", color: "#10B981" },
                { page: "/app-builder", views: "5,847", change: "+15%", color: "#FF7B00" },
                { page: "/home", views: "4,956", change: "-2%", color: "#8B5CF6" }
              ].map((item, idx) => (
                <motion.div
                  key={item.page}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-2 h-10 rounded-full"
                      style={{ 
                        background: `linear-gradient(to bottom, ${item.color}, transparent)`,
                        boxShadow: `0 0 12px ${item.color}`
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{item.page}</p>
                      <p className="text-xs text-gray-400">{item.views} views</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${
                    item.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {item.change}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Real-time Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: easeInOutCubic }}
          className="rounded-2xl border border-white/10 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Real-Time Activity
            </h3>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium text-green-400">Live</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              { action: "New user registered", user: "alex@example.com", time: "2s ago", icon: Users },
              { action: "Page view", page: "/dashboard", time: "5s ago", icon: Eye },
              { action: "Button clicked", element: "Generate App", time: "12s ago", icon: MousePointer },
              { action: "Session started", location: "San Francisco, CA", time: "18s ago", icon: Globe }
            ].map((activity, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center">
                  <activity.icon className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{activity.action}</p>
                  <p className="text-xs text-gray-400">{activity.user || activity.page || activity.element || activity.location}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}