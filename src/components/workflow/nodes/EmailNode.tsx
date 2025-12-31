import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Mail } from 'lucide-react';

export const EmailNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div 
      className={`
        px-4 py-3 rounded-xl bg-card border-2 transition-all duration-200 min-w-[200px]
        ${selected ? 'border-rose-500 shadow-lg shadow-rose-500/20' : 'border-border'}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-rose-500 !border-2 !border-card"
      />
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0">
          <Mail className="w-4 h-4 text-rose-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{data.label || 'Send Email'}</p>
          {data.to && (
            <p className="text-xs text-muted-foreground truncate">
              To: {data.to}
            </p>
          )}
          {data.subject && (
            <p className="text-xs text-muted-foreground truncate">
              {data.subject}
            </p>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-rose-500 !border-2 !border-card"
      />
    </div>
  );
});

EmailNode.displayName = 'EmailNode';
