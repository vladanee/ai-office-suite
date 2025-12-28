import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Webhook } from 'lucide-react';

export const WebhookNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div 
      className={`
        px-4 py-3 rounded-xl bg-card border-2 transition-all duration-200 min-w-[200px]
        ${selected ? 'border-accent shadow-lg shadow-accent/20' : 'border-border'}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-accent !border-2 !border-card"
      />
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
          <Webhook className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{data.label || 'Webhook'}</p>
          {data.url && (
            <p className="text-xs text-muted-foreground truncate font-mono">{data.url}</p>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-accent !border-2 !border-card"
      />
    </div>
  );
});

WebhookNode.displayName = 'WebhookNode';
