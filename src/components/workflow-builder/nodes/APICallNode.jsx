/**
 * API Call Node - External API integration with configuration
 */

import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Plug, Settings } from 'lucide-react';
import { APINodeConfigPanel } from '../APINodeConfigPanel';
import { useReactFlow } from 'reactflow';

export const APICallNode = memo(({ data, isConnectable, id }) => {
  const [showConfig, setShowConfig] = useState(false);
  const { setNodes } = useReactFlow();

  const handleSaveConfig = (updatedData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: updatedData } : node
      )
    );
    setShowConfig(false);
  };

  const connector = data.config?.connector || 'rest_api';
  const method = data.config?.method || 'GET';
  const endpoint = data.config?.endpoint || 'Configure API';

  return (
    <>
      <div className="group px-6 py-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border-2 border-blue-500/50 backdrop-blur-md shadow-[0_8px_32px_rgba(59,130,246,0.3)] min-w-[240px] relative">
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-blue-300"
        />
        
        <button
          onClick={() => setShowConfig(true)}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all"
        >
          <Settings className="w-3.5 h-3.5 text-white" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Plug className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm">{data.label}</div>
            <div className="text-blue-300 text-xs truncate">
              {method} {endpoint.substring(0, 30)}
            </div>
          </div>
        </div>

        {data.config?.dataMapping?.length > 0 && (
          <div className="text-xs text-blue-300 bg-blue-500/10 rounded-lg px-2 py-1">
            {data.config.dataMapping.length} field{data.config.dataMapping.length !== 1 ? 's' : ''} mapped
          </div>
        )}
        
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-blue-300"
        />
      </div>

      {showConfig && (
        <APINodeConfigPanel
          nodeData={data}
          onSave={handleSaveConfig}
          onClose={() => setShowConfig(false)}
        />
      )}
    </>
  );
});

APICallNode.displayName = 'APICallNode';