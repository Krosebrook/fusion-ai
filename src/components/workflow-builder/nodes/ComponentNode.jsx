/**
 * Component Node - Reusable workflow component instance
 */

import { memo, useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Package, Settings, ExternalLink } from 'lucide-react';
import { CinematicBadge } from '../../atoms/CinematicBadge';

export const ComponentNode = memo(({ data, isConnectable, id }) => {
  const [showConfig, setShowConfig] = useState(false);
  const { setNodes } = useReactFlow();

  const component = data.component || {};
  const inputs = component.inputs || [];
  const outputs = component.outputs || [];

  return (
    <div className="group px-5 py-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-600/20 border-2 border-cyan-500/50 backdrop-blur-md shadow-[0_8px_32px_rgba(6,182,212,0.3)] min-w-[220px] relative">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-cyan-300"
      />
      
      <button
        onClick={() => setShowConfig(true)}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all"
      >
        <Settings className="w-3.5 h-3.5 text-white" />
      </button>

      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-cyan-500/20">
          <Package className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm flex items-center gap-2">
            {data.label || component.name}
            <ExternalLink className="w-3 h-3 opacity-60" />
          </div>
          <div className="text-cyan-300 text-xs">Component</div>
        </div>
      </div>

      {inputs.length > 0 && (
        <div className="mb-2">
          <div className="text-xs text-cyan-400 mb-1">Inputs:</div>
          {inputs.map((input, idx) => (
            <div key={idx} className="text-xs text-white/70 truncate">
              • {input.name}
            </div>
          ))}
        </div>
      )}

      {component.version && (
        <CinematicBadge variant="info" size="sm" className="mt-2">
          v{component.version}
        </CinematicBadge>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-cyan-300"
      />
    </div>
  );
});

ComponentNode.displayName = 'ComponentNode';