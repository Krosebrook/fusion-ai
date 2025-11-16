import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { User } from "@/entities/User";
import StatsGrid from "@/components/analytics/StatsGrid";
import InteractiveChart from "@/components/analytics/InteractiveChart";
import PredictiveInsights from "@/components/analytics/PredictiveInsights";
import AnomalyDetection from "@/components/analytics/AnomalyDetection";
import ABTestingView from "@/components/analytics/ABTestingView";
import DraggableWidget from "@/components/analytics/DraggableWidget";
import { 
  BarChart3, Users, Activity, Eye, Clock, TrendingUp, LayoutGrid, Lock, Unlock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const easeInOutCubic = [0.4, 0, 0.2, 1];

export default function EnhancedAnalyticsPage() {
  const [user, setUser] = useState(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [widgets, setWidgets] = useState([
    { id: "anomalies", type: "anomalies", enabled: true },
    { id: "predictive", type: "predictive", enabled: true },
    { id: "growth", type: "chart-growth", enabled: true },
    { id: "sessions", type: "chart-sessions", enabled: true },
    { id: "abtesting", type: "abtesting", enabled: true },
  ]);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setWidgets(items);
  };

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

  const renderWidget = (widget) => {
    switch (widget.type) {
      case "anomalies":
        return <AnomalyDetection />;
      case "predictive":
        return <PredictiveInsights />;
      case "chart-growth":
        return (
          <InteractiveChart
            title="User Growth"
            data={userGrowthData}
            dataKey="users"
            color="#00B4D8"
          />
        );
      case "chart-sessions":
        return (
          <InteractiveChart
            title="Session Activity"
            data={sessionData}
            dataKey="value"
            color="#10B981"
          />
        );
      case "abtesting":
        return <ABTestingView />;
      default:
        return null;
    }
  };

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
                AI-Powered Analytics
              </h1>
              <p className="text-gray-400 mt-1">Predictive insights with interactive drill-downs</p>
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
            
            <Button 
              onClick={() => setEditMode(!editMode)}
              className={editMode ? "bg-orange-500 hover:bg-orange-600" : "bg-white/5 hover:bg-white/10"}
            >
              {editMode ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
              {editMode ? "Lock Layout" : "Customize"}
            </Button>

            <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg shadow-orange-500/30">
              <TrendingUp className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </motion.div>

        {/* Edit Mode Banner */}
        {editMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-orange-500/30 p-4 flex items-center justify-center gap-3"
            style={{
              background: "linear-gradient(135deg, rgba(255, 123, 0, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%)",
              backdropFilter: "blur(10px)"
            }}
          >
            <LayoutGrid className="w-5 h-5 text-orange-400" />
            <p className="text-sm text-orange-400 font-medium">
              Drag & drop widgets to customize your dashboard layout
            </p>
          </motion.div>
        )}

        {/* Stats Grid */}
        <StatsGrid stats={stats} />

        {/* Draggable Widgets */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="widgets">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {widgets.filter(w => w.enabled).map((widget, index) => (
                  editMode ? (
                    <DraggableWidget key={widget.id} id={widget.id} index={index}>
                      {renderWidget(widget)}
                    </DraggableWidget>
                  ) : (
                    <motion.div
                      key={widget.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {renderWidget(widget)}
                    </motion.div>
                  )
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}