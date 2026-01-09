/**
 * Trigger Node - Workflow entry point
 */

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Play } from 'lucide-react';

export const TriggerNode = memo(({ data, isConnectable }) => {
  return (
    <div className="px-6 py-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-2 border-green-500/50 backdrop-blur-md shadow-[0_8px_32px_rgba(16,185,129,0.3)] min-w-[200px]">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-green-500/20">
          <Play className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm">Trigger</div>
          <div className="text-green-300 text-xs">{data.config?.type || 'Manual'}</div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-green-300"
      />
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';