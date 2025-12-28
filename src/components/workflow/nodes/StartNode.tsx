import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Play } from 'lucide-react';

export const StartNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div 
      className={`
        px-4 py-3 rounded-xl bg-card border-2 transition-all duration-200
        ${selected ? 'border-node-start shadow-lg shadow-success/20' : 'border-border'}
      `}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
          <Play className="w-4 h-4 text-success" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{data.label || 'Start'}</p>
          <p className="text-xs text-muted-foreground">Workflow trigger</p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-success !border-2 !border-card"
      />
    </div>
  );
});

StartNode.displayName = 'StartNode';
