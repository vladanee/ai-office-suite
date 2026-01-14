import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface SocialNodeData {
  label?: string;
  platform?: 'twitter' | 'linkedin' | 'instagram' | 'facebook';
  content?: string;
  comment?: string;
}

const platformConfig = {
  twitter: {
    name: 'Twitter/X',
    icon: '𝕏',
    color: 'bg-slate-800 dark:bg-slate-700',
    textColor: 'text-white',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'in',
    color: 'bg-blue-600',
    textColor: 'text-white',
  },
  instagram: {
    name: 'Instagram',
    icon: '📷',
    color: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
    textColor: 'text-white',
  },
  facebook: {
    name: 'Facebook',
    icon: 'f',
    color: 'bg-blue-500',
    textColor: 'text-white',
  },
};

export const SocialNode = memo(({ data, selected }: NodeProps<SocialNodeData>) => {
  const platform = data.platform || 'twitter';
  const config = platformConfig[platform];

  return (
    <div className={`
      bg-card border-2 rounded-xl p-4 min-w-[180px] shadow-lg
      transition-all duration-200
      ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
      
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center font-bold ${config.textColor}`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {data.label || `Post to ${config.name}`}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {data.content ? data.content.substring(0, 25) + '...' : config.name}
          </p>
        </div>
      </div>

      {/* Comment indicator */}
      {data.comment && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground italic truncate">
            💬 {data.comment.substring(0, 30)}...
          </p>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
    </div>
  );
});

SocialNode.displayName = 'SocialNode';
