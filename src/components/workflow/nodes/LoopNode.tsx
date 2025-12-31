import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Repeat } from 'lucide-react';

export const LoopNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div 
      className={`
        px-4 py-3 rounded-xl bg-card border-2 transition-all duration-200 min-w-[180px]
        ${selected ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' : 'border-border'}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-card"
      />
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <Repeat className="w-4 h-4 text-cyan-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{data.label || 'Loop'}</p>
          {data.iterations && (
            <p className="text-xs text-muted-foreground">
              {data.iterations}x iterations
            </p>
          )}
          {data.collection && (
            <code className="text-xs text-cyan-500 font-mono bg-cyan-500/10 px-1.5 py-0.5 rounded">
              {data.collection}
            </code>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="loop"
        style={{ left: '30%' }}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-card"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="done"
        style={{ left: '70%' }}
        className="!w-3 !h-3 !bg-success !border-2 !border-card"
      />
    </div>
  );
});

LoopNode.displayName = 'LoopNode';
