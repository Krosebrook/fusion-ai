import { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Webhook, Plus, Trash2, Activity, AlertCircle, CheckCircle2 } from "lucide-react";

export default function WebhookManager() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    events: ["run.completed"],
    pipeline_ids: []
  });

  const { data: webhooks = [] } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => base44.entities.Webhook.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Generate secret
      const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      
      return base44.entities.Webhook.create({
        ...data,
        secret
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['webhooks']);
      setShowCreate(false);
      setFormData({ name: "", url: "", events: ["run.completed"], pipeline_ids: [] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Webhook.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['webhooks'])
  });

  const events = [
    { value: 'run.started', label: 'Run Started', icon: Activity },
    { value: 'run.completed', label: 'Run Completed', icon: CheckCircle2 },
    { value: 'run.failed', label: 'Run Failed', icon: AlertCircle },
    { value: 'optimization.available', label: 'Optimization Available', icon: Activity },
    { value: 'deployment.success', label: 'Deployment Success', icon: CheckCircle2 }
  ];

  return (
    <div className="space-y-6">
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl border border-blue-500/30 bg-white/5"
        >
          <h4 className="text-lg font-bold text-white mb-4">Create Webhook</h4>
          
          <div className="space-y-4">
            <div>
              <Label className="text-white mb-2 block">Webhook Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Slack Notifications"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-white mb-2 block">Endpoint URL</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://your-service.com/webhook"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-white mb-2 block">Events to Listen</Label>
              <div className="space-y-2">
                {events.map(event => (
                  <label key={event.value} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition">
                    <Checkbox
                      checked={formData.events.includes(event.value)}
                      onCheckedChange={(checked) => {
                        const updated = checked
                          ? [...formData.events, event.value]
                          : formData.events.filter(e => e !== event.value);
                        setFormData({ ...formData, events: updated });
                      }}
                    />
                    <event.icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white">{event.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => createMutation.mutate(formData)}
              disabled={!formData.name || !formData.url || formData.events.length === 0}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500"
            >
              <Webhook className="w-4 h-4 mr-2" />
              Create Webhook
            </Button>
            <Button
              onClick={() => setShowCreate(false)}
              variant="outline"
              className="border-white/20"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {!showCreate && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Webhooks</h3>
            <p className="text-sm text-gray-400">Receive real-time notifications</p>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Webhook
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {webhooks.map((webhook, idx) => (
          <motion.div
            key={webhook.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Webhook className="w-4 h-4 text-blue-400" />
                  {webhook.name}
                </h4>
                <p className="text-xs text-gray-400 font-mono mt-1">{webhook.url}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteMutation.mutate(webhook.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {webhook.total_calls || 0} calls
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-400" />
                {(webhook.total_calls || 0) - (webhook.failed_calls || 0)} success
              </div>
              {webhook.failed_calls > 0 && (
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  {webhook.failed_calls} failed
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1">
              {webhook.events.map(event => (
                <span
                  key={event}
                  className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400"
                >
                  {event}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {webhooks.length === 0 && !showCreate && (
        <div className="text-center py-12">
          <Webhook className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No webhooks configured</p>
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-blue-500/20 text-blue-400"
          >
            Create Your First Webhook
          </Button>
        </div>
      )}
    </div>
  );
}