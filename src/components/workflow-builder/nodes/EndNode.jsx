/**
 * End Node - Workflow completion
 */

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { CheckCircle } from 'lucide-react';

export const EndNode = memo(({ data, isConnectable }) => {
  return (
    <div className="px-6 py-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-600/20 border-2 border-red-500/50 backdrop-blur-md shadow-[0_8px_32px_rgba(239,68,68,0.3)] min-w-[200px]">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-red-500 !border-2 !border-red-300"
      />
      
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-red-500/20">
          <CheckCircle className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm">End</div>
          <div className="text-red-300 text-xs">Workflow Complete</div>
        </div>
      </div>
    </div>
  );
});

EndNode.displayName = 'EndNode';