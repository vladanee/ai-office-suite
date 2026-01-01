import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Globe } from 'lucide-react';

interface HTTPNodeData {
  label?: string;
  method?: string;
  url?: string;
}

export const HTTPNode = memo(({ data, selected }: NodeProps<HTTPNodeData>) => {
  return (
    <div className={`
      bg-card border-2 rounded-xl p-4 min-w-[180px] shadow-lg
      transition-all duration-200
      ${selected ? 'border-accent ring-2 ring-accent/20' : 'border-border'}
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-accent !border-2 !border-background"
      />
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <Globe className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {data.label || 'HTTP Request'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {data.method || 'GET'} {data.url ? `→ ${data.url.substring(0, 20)}...` : ''}
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-accent !border-2 !border-background"
      />
    </div>
  );
});

HTTPNode.displayName = 'HTTPNode';
