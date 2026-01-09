import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ListTodo, Plus, Play, RotateCcw, CheckCircle2,
  AlertCircle, Clock, Loader2, Bot, ChevronRight, X,
  ArrowUpCircle, ArrowDownCircle, Minus
} from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG = {
  pending: { color: '#6B7280', bg: 'bg-gray-500/20', icon: Clock },
  in_progress: { color: '#F59E0B', bg: 'bg-yellow-500/20', icon: Loader2 },
  waiting_input: { color: '#8B5CF6', bg: 'bg-purple-500/20', icon: Clock },
  completed: { color: '#10B981', bg: 'bg-green-500/20', icon: CheckCircle2 },
  failed: { color: '#EF4444', bg: 'bg-red-500/20', icon: AlertCircle },
  cancelled: { color: '#6B7280', bg: 'bg-gray-500/20', icon: X }
};

const PRIORITY_CONFIG = {
  low: { color: '#6B7280', icon: ArrowDownCircle },
  normal: { color: '#00B4D8', icon: Minus },
  high: { color: '#F59E0B', icon: ArrowUpCircle },
  critical: { color: '#EF4444', icon: AlertCircle }
};

export default function TaskExecutionManager({ collaborationId, agents = [] }) {
  const queryClient = useQueryClient();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['agentTasks', collaborationId],
    queryFn: () => collaborationId
      ? base44.entities.AgentTask?.filter?.({ collaboration_id: collaborationId }, '-created_date', 50) || []
      : base44.entities.AgentTask?.list?.('-created_date', 50) || [],
    refetchInterval: 3000
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AgentTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['agentTasks']);
      toast.success("Task created");
      setShowCreateTask(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AgentTask.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['agentTasks']);
      toast.success("Task updated");
    }
  });

  const executeMutation = useMutation({
    mutationFn: async (task) => {
      // Update status to in_progress
      await base44.entities.AgentTask.update(task.id, {
        status: 'in_progress',
        started_at: new Date().toISOString(),
        execution_log: [
          ...(task.execution_log || []),
          {
            timestamp: new Date().toISOString(),
            action: 'started',
            details: 'Task execution started',
            agent_id: task.assigned_agent_id
          }
        ]
      });

      // Get agent and execute
      const agent = agents.find(a => a.id === task.assigned_agent_id);
      
      // Simulate AI execution
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are ${agent?.name || 'an AI agent'}. ${agent?.system_prompt || ''}

Task: ${task.title}
Description: ${task.description}
Input Data: ${JSON.stringify(task.input_data || {})}

Execute this task and provide the output.`,
        response_json_schema: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            output: { type: "object" },
            summary: { type: "string" }
          }
        }
      });

      // Update with result
      await base44.entities.AgentTask.update(task.id, {
        status: result.success ? 'completed' : 'failed',
        completed_at: new Date().toISOString(),
        output_data: result.output,
        execution_log: [
          ...(task.execution_log || []),
          {
            timestamp: new Date().toISOString(),
            action: result.success ? 'completed' : 'failed',
            details: result.summary,
            agent_id: task.assigned_agent_id
          }
        ]
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agentTasks']);
      toast.success("Task executed");
    },
    onError: (error) => {
      toast.error("Execution failed: " + error.message);
    }
  });

  const filteredTasks = tasks.filter(t => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const getAgent = (agentId) => agents.find(a => a.id === agentId) || { name: 'Unknown', color: '#6B7280' };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    failed: tasks.filter(t => t.status === 'failed').length
  };

  const completionRate = taskStats.total > 0 
    ? Math.round((taskStats.completed / taskStats.total) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-orange-400" />
            Task Execution Manager
          </h3>
          <p className="text-sm text-gray-400">Manage and execute multi-agent tasks</p>
        </div>
        <Button
          onClick={() => setShowCreateTask(true)}
          className="bg-gradient-to-r from-orange-500 to-pink-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-white/10 p-4 bg-white/5">
          <p className="text-2xl font-bold text-white">{taskStats.total}</p>
          <p className="text-xs text-gray-400">Total Tasks</p>
        </div>
        <div className="rounded-lg border border-green-500/30 p-4 bg-green-500/10">
          <p className="text-2xl font-bold text-green-400">{taskStats.completed}</p>
          <p className="text-xs text-gray-400">Completed</p>
        </div>
        <div className="rounded-lg border border-yellow-500/30 p-4 bg-yellow-500/10">
          <p className="text-2xl font-bold text-yellow-400">{taskStats.inProgress}</p>
          <p className="text-xs text-gray-400">In Progress</p>
        </div>
        <div className="rounded-lg border border-white/10 p-4 bg-white/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Completion</p>
            <p className="text-sm font-bold text-white">{completionRate}%</p>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'pending', 'in_progress', 'completed', 'failed'].map(status => (
          <Button
            key={status}
            size="sm"
            variant={filterStatus === status ? 'default' : 'outline'}
            onClick={() => setFilterStatus(status)}
            className={filterStatus === status ? '' : 'border-white/10 text-gray-400'}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredTasks.map((task, idx) => {
            const agent = getAgent(task.assigned_agent_id);
            const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
            const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.normal;
            const StatusIcon = statusConfig.icon;
            const PriorityIcon = priorityConfig.icon;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.02 }}
                className={`rounded-lg border border-white/10 overflow-hidden ${
                  selectedTask?.id === task.id ? 'ring-2 ring-orange-500' : ''
                }`}
                style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
              >
                {/* Task Header */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5"
                  onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${agent.color}20` }}
                    >
                      <Bot className="w-5 h-5" style={{ color: agent.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">{task.title}</h4>
                        <Badge className={`${statusConfig.bg} border-0`} style={{ color: statusConfig.color }}>
                          <StatusIcon className={`w-3 h-3 mr-1 ${task.status === 'in_progress' ? 'animate-spin' : ''}`} />
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <PriorityIcon className="w-4 h-4" style={{ color: priorityConfig.color }} />
                      </div>
                      <p className="text-xs text-gray-400">
                        Assigned to {task.assigned_agent_name || agent.name}
                        {task.deadline && ` • Due ${new Date(task.deadline).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {task.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          executeMutation.mutate(task);
                        }}
                        disabled={executeMutation.isPending}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        {executeMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    {task.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateMutation.mutate({ id: task.id, data: { status: 'pending', retry_count: (task.retry_count || 0) + 1 } });
                        }}
                        className="border-yellow-500/30 text-yellow-400"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                    <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${selectedTask?.id === task.id ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {selectedTask?.id === task.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-4 space-y-4">
                        {/* Description */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-400 mb-1">Description</h5>
                          <p className="text-sm text-gray-300">{task.description}</p>
                        </div>

                        {/* Input/Output Data */}
                        <div className="grid grid-cols-2 gap-4">
                          {task.input_data && (
                            <div>
                              <h5 className="text-xs font-medium text-gray-400 mb-1">Input Data</h5>
                              <pre className="text-xs text-gray-300 bg-black/30 p-2 rounded overflow-x-auto">
                                {JSON.stringify(task.input_data, null, 2)}
                              </pre>
                            </div>
                          )}
                          {task.output_data && (
                            <div>
                              <h5 className="text-xs font-medium text-gray-400 mb-1">Output Data</h5>
                              <pre className="text-xs text-green-300 bg-black/30 p-2 rounded overflow-x-auto">
                                {JSON.stringify(task.output_data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>

                        {/* Execution Log */}
                        {task.execution_log?.length > 0 && (
                          <div>
                            <h5 className="text-xs font-medium text-gray-400 mb-2">Execution Log</h5>
                            <div className="space-y-1">
                              {task.execution_log.map((log, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                  <span className="text-gray-500">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {log.action}
                                  </Badge>
                                  <span className="text-gray-400">{log.details}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Error */}
                        {task.error_message && (
                          <div className="p-3 rounded bg-red-500/10 border border-red-500/30">
                            <p className="text-sm text-red-400">{task.error_message}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreateTask && (
          <CreateTaskModal
            collaborationId={collaborationId}
            agents={agents}
            onClose={() => setShowCreateTask(false)}
            onSave={(data) => createMutation.mutate(data)}
            isSaving={createMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CreateTaskModal({ collaborationId, agents, onClose, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    collaboration_id: collaborationId,
    title: "",
    description: "",
    assigned_agent_id: "",
    priority: "normal",
    task_type: "execution",
    input_data: {},
    status: "pending"
  });

  const handleSave = () => {
    const agent = agents.find(a => a.id === formData.assigned_agent_id);
    onSave({
      ...formData,
      assigned_agent_name: agent?.name
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-lg rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-6">Create Task</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Describe what needs to be done"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Assign to Agent</label>
              <Select 
                value={formData.assigned_agent_id} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, assigned_agent_id: v }))}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {agents.map(a => (
                    <SelectItem key={a.id} value={a.id} className="text-white">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" style={{ color: a.color }} />
                        {a.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400">Priority</label>
              <Select 
                value={formData.priority} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v }))}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-white capitalize">
                      <div className="flex items-center gap-2">
                        <config.icon className="w-4 h-4" style={{ color: config.color }} />
                        {key}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="border-white/10">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.title || !formData.assigned_agent_id}
              className="bg-gradient-to-r from-orange-500 to-pink-500"
            >
              {isSaving ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}