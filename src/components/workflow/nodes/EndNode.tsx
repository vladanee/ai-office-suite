import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { StopCircle } from 'lucide-react';

export const EndNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div 
      className={`
        px-4 py-3 rounded-xl bg-card border-2 transition-all duration-200
        ${selected ? 'border-destructive shadow-lg shadow-destructive/20' : 'border-border'}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-destructive !border-2 !border-card"
      />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
          <StopCircle className="w-4 h-4 text-destructive" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{data.label || 'End'}</p>
          <p className="text-xs text-muted-foreground">Workflow complete</p>
        </div>
      </div>
    </div>
  );
});

EndNode.displayName = 'EndNode';
