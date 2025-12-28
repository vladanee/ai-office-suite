import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitBranch } from 'lucide-react';

export const ConditionalNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div 
      className={`
        px-4 py-3 rounded-xl bg-card border-2 transition-all duration-200 min-w-[180px]
        ${selected ? 'border-warning shadow-lg shadow-warning/20' : 'border-border'}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-warning !border-2 !border-card"
      />
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
          <GitBranch className="w-4 h-4 text-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{data.label || 'Condition'}</p>
          {data.condition && (
            <code className="text-xs text-warning font-mono bg-warning/10 px-1.5 py-0.5 rounded">
              {data.condition}
            </code>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={{ left: '30%' }}
        className="!w-3 !h-3 !bg-success !border-2 !border-card"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={{ left: '70%' }}
        className="!w-3 !h-3 !bg-destructive !border-2 !border-card"
      />
    </div>
  );
});

ConditionalNode.displayName = 'ConditionalNode';
