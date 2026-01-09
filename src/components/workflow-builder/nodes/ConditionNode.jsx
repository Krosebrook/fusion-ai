/**
 * Condition Node - Branching logic
 */

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { GitBranch } from 'lucide-react';

export const ConditionNode = memo(({ data, isConnectable }) => {
  return (
    <div className="px-6 py-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-2 border-amber-500/50 backdrop-blur-md shadow-[0_8px_32px_rgba(245,158,11,0.3)] min-w-[200px]">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-amber-300"
      />
      
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-amber-500/20">
          <GitBranch className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{data.label}</div>
          <div className="text-amber-300 text-xs">{data.config?.expression || 'if/else'}</div>
        </div>
      </div>

      <div className="flex justify-between gap-8">
        <div className="flex flex-col items-center">
          <span className="text-xs text-green-400 mb-1">True</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            isConnectable={isConnectable}
            className="!w-3 !h-3 !bg-green-500 !border-2 !border-green-300 !relative !left-0 !transform-none"
          />
        </div>
        
        <div className="flex flex-col items-center">
          <span className="text-xs text-red-400 mb-1">False</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            isConnectable={isConnectable}
            className="!w-3 !h-3 !bg-red-500 !border-2 !border-red-300 !relative !left-0 !transform-none"
          />
        </div>
      </div>
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';