/**
 * API Call Node - External API integration
 */

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Plug } from 'lucide-react';

export const APICallNode = memo(({ data, isConnectable }) => {
  return (
    <div className="px-6 py-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border-2 border-blue-500/50 backdrop-blur-md shadow-[0_8px_32px_rgba(59,130,246,0.3)] min-w-[200px]">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-blue-300"
      />
      
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-blue-500/20">
          <Plug className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{data.label}</div>
          <div className="text-blue-300 text-xs">{data.config?.method || 'GET'} {data.config?.endpoint || 'API'}</div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-blue-300"
      />
    </div>
  );
});

APICallNode.displayName = 'APICallNode';