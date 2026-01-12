import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart3, Clock, Download, Filter, TrendingUp, Code, FileText, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function ActivityDashboard() {
  const [timeFilter, setTimeFilter] = useState('week');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock data for demonstration
  const stats = [
    { label: 'Total Generations', value: '1,247', change: '+12%', icon: Zap, color: 'from-orange-500 to-pink-500' },
    { label: 'API Calls', value: '8,542', change: '+8%', icon: Code, color: 'from-cyan-500 to-blue-500' },
    { label: 'Credits Used', value: '4,231', change: '+15%', icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
    { label: 'Active Projects', value: '23', change: '+3', icon: FileText, color: 'from-green-500 to-cyan-500' },
  ];

  const chartData = [
    { date: 'Mon', generations: 45, apiCalls: 120 },
    { date: 'Tue', generations: 52, apiCalls: 145 },
    { date: 'Wed', generations: 48, apiCalls: 132 },
    { date: 'Thu', generations: 61, apiCalls: 158 },
    { date: 'Fri', generations: 55, apiCalls: 142 },
    { date: 'Sat', generations: 38, apiCalls: 95 },
    { date: 'Sun', generations: 42, apiCalls: 108 },
  ];

  const recentActivities = [
    { id: 1, type: 'code', title: 'Generated React Component', time: '2 minutes ago', status: 'success' },
    { id: 2, type: 'content', title: 'Created Blog Post', time: '15 minutes ago', status: 'success' },
    { id: 3, type: 'pipeline', title: 'Executed CI/CD Pipeline', time: '1 hour ago', status: 'success' },
    { id: 4, type: 'code', title: 'Generated API Endpoint', time: '2 hours ago', status: 'success' },
    { id: 5, type: 'content', title: 'Generated Marketing Copy', time: '3 hours ago', status: 'success' },
  ];

  const handleExport = (format) => {
    console.log(`Exporting as ${format}`);
    // TODO: Implement actual export logic
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Activity Dashboard
                </h1>
                <p className="text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Track your generations, API usage, and performance
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Select value={timeFilter} onValueChange={setTimeFilter} data-b44-sync="true">
                <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-white">
                  <Clock className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                onClick={() => handleExport('csv')}
                data-b44-sync="true"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="bg-slate-800 border-slate-700"
                data-b44-sync="true"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription className="text-slate-400">{stat.label}</CardDescription>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <p className="text-sm text-green-400">{stat.change} from last period</p>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Tabs defaultValue="activity" className="w-full" data-b44-sync="true">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="activity" className="data-[state=active]:bg-slate-700">
                <BarChart3 className="w-4 h-4 mr-2" />
                Activity Trends
              </TabsTrigger>
              <TabsTrigger value="usage" className="data-[state=active]:bg-slate-700">
                <TrendingUp className="w-4 h-4 mr-2" />
                Usage Overview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity">
              <Card className="bg-slate-800 border-slate-700" data-b44-sync="true">
                <CardHeader>
                  <CardTitle className="text-white">Weekly Activity</CardTitle>
                  <CardDescription className="text-slate-400">
                    Your generation and API call patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#F1F5F9' }}
                      />
                      <Bar dataKey="generations" fill="#FF7B00" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="apiCalls" fill="#00B4D8" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="usage">
              <Card className="bg-slate-800 border-slate-700" data-b44-sync="true">
                <CardHeader>
                  <CardTitle className="text-white">Usage Metrics</CardTitle>
                  <CardDescription className="text-slate-400">
                    Credits and API usage over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#F1F5F9' }}
                      />
                      <Line type="monotone" dataKey="generations" stroke="#FF7B00" strokeWidth={2} />
                      <Line type="monotone" dataKey="apiCalls" stroke="#00B4D8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800 border-slate-700" data-b44-sync="true">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                  <CardDescription className="text-slate-400">
                    Your latest generations and actions
                  </CardDescription>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter} data-b44-sync="true">
                  <SelectTrigger className="w-[140px] bg-slate-700 border-slate-600 text-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="pipeline">Pipeline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 border border-slate-600 hover:border-slate-500 transition-colors"
                    data-b44-sync="true"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.type === 'code' ? 'bg-gradient-to-br from-orange-500 to-pink-500' :
                        activity.type === 'content' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                        'bg-gradient-to-br from-cyan-500 to-blue-500'
                      }`}>
                        {activity.type === 'code' && <Code className="w-5 h-5 text-white" />}
                        {activity.type === 'content' && <FileText className="w-5 h-5 text-white" />}
                        {activity.type === 'pipeline' && <Zap className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{activity.title}</h4>
                        <p className="text-sm text-slate-400">{activity.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                        {activity.status}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-white"
                        data-b44-sync="true"
                      >
                        View
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
