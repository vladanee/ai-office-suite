import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Timer } from 'lucide-react';

export const DelayNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div 
      className={`
        px-4 py-3 rounded-xl bg-card border-2 transition-all duration-200 min-w-[180px]
        ${selected ? 'border-amber-500 shadow-lg shadow-amber-500/20' : 'border-border'}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-card"
      />
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Timer className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{data.label || 'Delay'}</p>
          {data.delay && (
            <p className="text-xs text-muted-foreground">
              Wait {data.delay}s
            </p>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-card"
      />
    </div>
  );
});

DelayNode.displayName = 'DelayNode';
