import React, { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Plus, Trash2, Eye, EyeOff, Copy, Save, Lock, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function EnvironmentVariables({ environments }) {
  const queryClient = useQueryClient();
  const [selectedEnv, setSelectedEnv] = useState(environments[0]?.id || "");
  const [variables, setVariables] = useState([]);
  const [showValues, setShowValues] = useState({});
  const [newVar, setNewVar] = useState({ key: "", value: "", encrypted: false });

  const env = environments.find(e => e.id === selectedEnv);

  React.useEffect(() => {
    if (env) {
      setVariables(env.variables || []);
    }
  }, [selectedEnv, env]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Environment.update(selectedEnv, {
        variables: variables
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['environments']);
    }
  });

  const addVariable = () => {
    if (newVar.key && newVar.value) {
      setVariables([...variables, { ...newVar }]);
      setNewVar({ key: "", value: "", encrypted: false });
    }
  };

  const removeVariable = (index) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const updateVariable = (index, field, value) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], [field]: value };
    setVariables(updated);
  };

  const toggleShowValue = (index) => {
    setShowValues(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const copyValue = (value) => {
    navigator.clipboard.writeText(value);
  };

  const getEnvColor = (type) => ({
    development: '#00B4D8',
    staging: '#F59E0B',
    production: '#10B981',
    custom: '#8B5CF6'
  }[type] || '#6B7280');

  return (
    <div className="space-y-6">
      {/* Environment Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            Environment Variables
          </h3>
          
          <Select value={selectedEnv} onValueChange={setSelectedEnv}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
              <Server className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10">
              {environments.map(e => (
                <SelectItem key={e.id} value={e.id} className="text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: getEnvColor(e.type) }} />
                    {e.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {env && (
          <div className="p-3 rounded-lg mb-4"
               style={{ background: `${getEnvColor(env.type)}10`, border: `1px solid ${getEnvColor(env.type)}30` }}>
            <div className="flex items-center gap-2 text-sm">
              <span style={{ color: getEnvColor(env.type) }}>{env.name}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{variables.length} variables</span>
              {env.deployment_url && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{env.deployment_url}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Variables List */}
        <div className="space-y-3">
          {variables.map((variable, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex-1 grid grid-cols-2 gap-3">
                <Input
                  value={variable.key}
                  onChange={(e) => updateVariable(idx, 'key', e.target.value)}
                  placeholder="VARIABLE_NAME"
                  className="bg-white/5 border-white/10 text-white font-mono text-sm"
                />
                <div className="relative">
                  <Input
                    type={showValues[idx] || !variable.encrypted ? "text" : "password"}
                    value={variable.value}
                    onChange={(e) => updateVariable(idx, 'value', e.target.value)}
                    placeholder="value"
                    className="bg-white/5 border-white/10 text-white font-mono text-sm pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {variable.encrypted && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleShowValue(idx)}
                        className="h-6 w-6 p-0 text-gray-400"
                      >
                        {showValues[idx] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyValue(variable.value)}
                      className="h-6 w-6 p-0 text-gray-400"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 p-2 rounded bg-white/5">
                  <Lock className={`w-3 h-3 ${variable.encrypted ? 'text-green-400' : 'text-gray-500'}`} />
                  <Switch
                    checked={variable.encrypted}
                    onCheckedChange={(checked) => updateVariable(idx, 'encrypted', checked)}
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeVariable(idx)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}

          {/* Add New Variable */}
          <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-white/20">
            <div className="flex-1 grid grid-cols-2 gap-3">
              <Input
                value={newVar.key}
                onChange={(e) => setNewVar({ ...newVar, key: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })}
                placeholder="NEW_VARIABLE"
                className="bg-white/5 border-white/10 text-white font-mono text-sm"
              />
              <Input
                type={newVar.encrypted ? "password" : "text"}
                value={newVar.value}
                onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
                placeholder="value"
                className="bg-white/5 border-white/10 text-white font-mono text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 p-2 rounded bg-white/5">
                <Lock className={`w-3 h-3 ${newVar.encrypted ? 'text-green-400' : 'text-gray-500'}`} />
                <Switch
                  checked={newVar.encrypted}
                  onCheckedChange={(checked) => setNewVar({ ...newVar, encrypted: checked })}
                />
              </div>
              <Button
                size="sm"
                onClick={addVariable}
                disabled={!newVar.key || !newVar.value}
                className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-4 pt-4 border-t border-white/10">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save Variables'}
          </Button>
        </div>
      </motion.div>

      {/* Usage Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <h4 className="text-sm font-semibold text-white mb-3">Usage in Pipeline</h4>
        <div className="bg-black/40 rounded-lg p-4 font-mono text-sm">
          <p className="text-gray-400"># Access in GitHub Actions:</p>
          <p className="text-green-400">{'${{ secrets.VARIABLE_NAME }}'}</p>
          <br />
          <p className="text-gray-400"># Access in shell:</p>
          <p className="text-green-400">echo $VARIABLE_NAME</p>
        </div>
      </motion.div>
    </div>
  );
}