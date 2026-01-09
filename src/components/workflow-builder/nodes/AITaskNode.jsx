/**
 * AI Task Node - Execute AI model operations
 */

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Sparkles } from 'lucide-react';

export const AITaskNode = memo(({ data, isConnectable }) => {
  return (
    <div className="px-6 py-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-2 border-purple-500/50 backdrop-blur-md shadow-[0_8px_32px_rgba(138,92,255,0.3)] min-w-[200px]">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-purple-300"
      />
      
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-purple-500/20">
          <Sparkles className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{data.label}</div>
          <div className="text-purple-300 text-xs">{data.config?.model || 'AI Model'}</div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-purple-300"
      />
    </div>
  );
});

AITaskNode.displayName = 'AITaskNode';