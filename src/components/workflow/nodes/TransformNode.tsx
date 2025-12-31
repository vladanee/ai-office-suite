import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Shuffle } from 'lucide-react';

export const TransformNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div 
      className={`
        px-4 py-3 rounded-xl bg-card border-2 transition-all duration-200 min-w-[200px]
        ${selected ? 'border-violet-500 shadow-lg shadow-violet-500/20' : 'border-border'}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-violet-500 !border-2 !border-card"
      />
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
          <Shuffle className="w-4 h-4 text-violet-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{data.label || 'Transform'}</p>
          {data.transform && (
            <code className="text-xs text-violet-500 font-mono bg-violet-500/10 px-1.5 py-0.5 rounded block truncate">
              {data.transform}
            </code>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-violet-500 !border-2 !border-card"
      />
    </div>
  );
});

TransformNode.displayName = 'TransformNode';
