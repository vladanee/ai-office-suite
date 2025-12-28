import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ListTodo, GripVertical } from 'lucide-react';

export const TaskNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div 
      className={`
        px-4 py-3 rounded-xl bg-card border-2 transition-all duration-200 min-w-[200px]
        ${selected ? 'border-primary shadow-lg shadow-primary/20' : 'border-border'}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-primary !border-2 !border-card"
      />
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <ListTodo className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{data.label || 'Task'}</p>
          {data.description && (
            <p className="text-xs text-muted-foreground truncate">{data.description}</p>
          )}
        </div>
        <GripVertical className="w-4 h-4 text-muted-foreground/50" />
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-primary !border-2 !border-card"
      />
    </div>
  );
});

TaskNode.displayName = 'TaskNode';
