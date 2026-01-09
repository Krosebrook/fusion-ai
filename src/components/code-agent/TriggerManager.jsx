import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Zap, Clock, Code, GitBranch, Trash2 } from "lucide-react";

const triggerTypes = [
  { value: "scheduled", label: "Scheduled", icon: Clock, description: "Run at specific intervals" },
  { value: "webhook", label: "Webhook", icon: Zap, description: "Trigger via HTTP webhook" },
  { value: "code_push", label: "Code Push", icon: GitBranch, description: "On repository push" },
  { value: "manual", label: "Manual", icon: Code, description: "Manual execution only" }
];

export default function TriggerManager({ triggers, onTriggersChange, onTriggerActivate }) {
  const [showForm, setShowForm] = useState(false);
  const [newTrigger, setNewTrigger] = useState({
    name: "",
    type: "scheduled",
    taskTitle: "",
    schedule: "0 0 * * *"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onTriggersChange([...triggers, { ...newTrigger, id: Date.now(), active: true }]);
    setNewTrigger({ name: "", type: "scheduled", taskTitle: "", schedule: "0 0 * * *" });
    setShowForm(false);
  };

  const deleteTrigger = (triggerId) => {
    onTriggersChange(triggers.filter(t => t.id !== triggerId));
  };

  const toggleTrigger = (triggerId) => {
    onTriggersChange(
      triggers.map(t => t.id === triggerId ? { ...t, active: !t.active } : t)
    );
  };

  return (
    <div className="space-y-6">
      {/* Add Trigger Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Trigger
        </Button>
      </motion.div>

      {/* Add Trigger Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-white/10 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
              backdropFilter: "blur(20px)"
            }}
          >
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                placeholder="Trigger name"
                value={newTrigger.name}
                onChange={(e) => setNewTrigger({ ...newTrigger, name: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                required
              />
              
              <Select
                value={newTrigger.type}
                onValueChange={(value) => setNewTrigger({ ...newTrigger, type: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {triggerTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Task title to trigger"
                value={newTrigger.taskTitle}
                onChange={(e) => setNewTrigger({ ...newTrigger, taskTitle: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                required
              />

              {newTrigger.type === "scheduled" && (
                <Input
                  placeholder="Cron schedule (e.g., 0 0 * * *)"
                  value={newTrigger.schedule}
                  onChange={(e) => setNewTrigger({ ...newTrigger, schedule: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              )}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-white/10">
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-500 hover:bg-purple-600">
                  Create Trigger
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Types Guide */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {triggerTypes.map((type, idx) => (
          <motion.div
            key={type.value}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-xl border border-white/10 p-4"
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
              backdropFilter: "blur(20px)"
            }}
          >
            <type.icon className="w-6 h-6 text-purple-400 mb-2" />
            <h4 className="text-sm font-bold text-white mb-1">{type.label}</h4>
            <p className="text-xs text-gray-400">{type.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Active Triggers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 p-6"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
          backdropFilter: "blur(20px)"
        }}
      >
        <h3 className="text-lg font-bold text-white mb-4">Active Triggers</h3>
        
        {triggers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No triggers configured</p>
            <p className="text-sm text-gray-500 mt-1">Add a trigger to automate tasks</p>
          </div>
        ) : (
          <div className="space-y-3">
            {triggers.map((trigger, idx) => {
              const TriggerIcon = triggerTypes.find(t => t.value === trigger.type)?.icon || Zap;
              
              return (
                <motion.div
                  key={trigger.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`rounded-xl border p-4 ${
                    trigger.active 
                      ? 'border-purple-500/30 bg-purple-500/10' 
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        trigger.active ? 'bg-purple-500/20' : 'bg-white/5'
                      }`}>
                        <TriggerIcon className={`w-5 h-5 ${trigger.active ? 'text-purple-400' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{trigger.name}</h4>
                        <p className="text-xs text-gray-400 mt-1">Triggers: {trigger.taskTitle}</p>
                        {trigger.type === "scheduled" && (
                          <p className="text-xs text-gray-500 mt-1">Schedule: {trigger.schedule}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleTrigger(trigger.id)}
                        className={trigger.active ? 'text-purple-400' : 'text-gray-400'}
                      >
                        <Zap className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTrigger(trigger.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}