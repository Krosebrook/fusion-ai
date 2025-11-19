import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AgentDashboard from "@/components/code-agent/AgentDashboard";
import TaskQueue from "@/components/code-agent/TaskQueue";
import TaskExecutor from "@/components/code-agent/TaskExecutor";
import TriggerManager from "@/components/code-agent/TriggerManager";
import { Bot, Activity, Zap, Settings } from "lucide-react";

const easeInOutCubic = [0.4, 0, 0.2, 1];

export default function AICodeAgentPage() {
  const [user, setUser] = useState(null);
  const [agentStatus, setAgentStatus] = useState("idle");
  const [tasks, setTasks] = useState([]);
  const [executingTask, setExecutingTask] = useState(null);
  const [triggers, setTriggers] = useState([]);

  useEffect(() => {
    loadData();
    
    // Simulate agent heartbeat
    const interval = setInterval(() => {
      if (agentStatus === "active" && tasks.length > 0) {
        processNextTask();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [agentStatus, tasks]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const userTasks = await base44.entities.Task.filter({
        created_by: currentUser.email,
        workflow_type: "autonomous_agent"
      });
      setTasks(userTasks);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const processNextTask = async () => {
    const pendingTask = tasks.find(t => t.status === "pending");
    if (!pendingTask) return;

    setExecutingTask(pendingTask);
    
    try {
      await base44.entities.Task.update(pendingTask.id, {
        status: "in_progress"
      });

      // Simulate task execution
      await new Promise(resolve => setTimeout(resolve, 3000));

      await base44.entities.Task.update(pendingTask.id, {
        status: "completed",
        metadata: {
          ...pendingTask.metadata,
          completedAt: new Date().toISOString()
        }
      });

      setTasks(tasks.map(t => 
        t.id === pendingTask.id 
          ? { ...t, status: "completed" } 
          : t
      ));
    } catch (error) {
      await base44.entities.Task.update(pendingTask.id, {
        status: "failed"
      });
    } finally {
      setExecutingTask(null);
    }
  };

  const addTask = async (taskData) => {
    const newTask = await base44.entities.Task.create({
      ...taskData,
      workflow_type: "autonomous_agent",
      status: "pending",
      metadata: {
        createdAt: new Date().toISOString()
      }
    });
    setTasks([...tasks, newTask]);
  };

  const stats = [
    { label: "Agent Status", value: agentStatus, icon: Bot, color: agentStatus === "active" ? "#10B981" : "#6B7280" },
    { label: "Tasks in Queue", value: tasks.filter(t => t.status === "pending").length, icon: Activity, color: "#00B4D8" },
    { label: "Completed Today", value: tasks.filter(t => t.status === "completed").length, icon: Zap, color: "#FF7B00" },
    { label: "Active Triggers", value: triggers.length, icon: Settings, color: "#8B5CF6" }
  ];

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeInOutCubic }}
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-cyan-500/30"
            >
              <Bot className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                AI Code Agent
              </h1>
              <p className="text-gray-400 mt-1">Autonomous task execution with real-time monitoring</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, ease: easeInOutCubic }}
              className="rounded-xl border border-white/10 p-6"
              style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
                backdropFilter: "blur(20px)"
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white capitalize">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="queue">Task Queue ({tasks.length})</TabsTrigger>
            <TabsTrigger value="executor">Executor</TabsTrigger>
            <TabsTrigger value="triggers">Triggers</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AgentDashboard 
              status={agentStatus}
              onStatusChange={setAgentStatus}
              tasks={tasks}
              executingTask={executingTask}
            />
          </TabsContent>

          <TabsContent value="queue">
            <TaskQueue 
              tasks={tasks}
              onAddTask={addTask}
              onUpdateTask={(taskId, updates) => {
                setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
              }}
            />
          </TabsContent>

          <TabsContent value="executor">
            <TaskExecutor 
              task={executingTask}
              recentTasks={tasks.filter(t => t.status === "completed").slice(-5)}
            />
          </TabsContent>

          <TabsContent value="triggers">
            <TriggerManager 
              triggers={triggers}
              onTriggersChange={setTriggers}
              onTriggerActivate={(trigger) => addTask({
                title: trigger.taskTitle,
                description: `Auto-triggered: ${trigger.name}`
              })}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}