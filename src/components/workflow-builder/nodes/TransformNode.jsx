/**
 * Transform Node - Data transformation
 */

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Shuffle } from 'lucide-react';

export const TransformNode = memo(({ data, isConnectable }) => {
  return (
    <div className="px-6 py-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-600/20 border-2 border-cyan-500/50 backdrop-blur-md shadow-[0_8px_32px_rgba(6,182,212,0.3)] min-w-[200px]">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-cyan-300"
      />
      
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-cyan-500/20">
          <Shuffle className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{data.label}</div>
          <div className="text-cyan-300 text-xs">{data.config?.operation || 'Transform'}</div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-cyan-300"
      />
    </div>
  );
});

TransformNode.displayName = 'TransformNode';