import { format } from 'date-fns';
import { 
  Clock, 
  Calendar, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  CheckCircle2,
  Circle,
  Timer,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Task } from '@/hooks/useTasks';

interface TaskCardProps {
  task: Task;
  personaName?: string;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  compact?: boolean;
}

const priorityConfig = {
  low: { color: 'bg-muted text-muted-foreground', label: 'Low' },
  medium: { color: 'bg-warning/20 text-warning', label: 'Medium' },
  high: { color: 'bg-destructive/20 text-destructive', label: 'High' },
  urgent: { color: 'bg-destructive text-destructive-foreground', label: 'Urgent' },
};

const statusIcons = {
  todo: Circle,
  in_progress: Timer,
  in_review: AlertCircle,
  done: CheckCircle2,
  cancelled: Circle,
};

export function TaskCard({ 
  task, 
  personaName, 
  onEdit, 
  onDelete, 
  onStatusChange,
  compact = false 
}: TaskCardProps) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
  const StatusIcon = statusIcons[task.status];

  return (
    <Card className={cn(
      'group hover:border-primary/30 transition-all duration-200',
      isOverdue && 'border-destructive/50',
      task.status === 'done' && 'opacity-70'
    )}>
      <CardContent className={cn('p-4', compact && 'p-3')}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <StatusIcon className={cn(
              'w-4 h-4 mt-0.5 flex-shrink-0',
              task.status === 'done' ? 'text-success' : 'text-muted-foreground'
            )} />
            <div className="flex-1 min-w-0">
              <h4 className={cn(
                'font-medium text-foreground truncate',
                task.status === 'done' && 'line-through'
              )}>
                {task.title}
              </h4>
              {!compact && task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {task.description}
                </p>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon-sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {task.status !== 'todo' && (
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'todo')}>
                  Move to To Do
                </DropdownMenuItem>
              )}
              {task.status !== 'in_progress' && (
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'in_progress')}>
                  Move to In Progress
                </DropdownMenuItem>
              )}
              {task.status !== 'done' && (
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'done')}>
                  Mark as Done
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(task)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Badge className={priorityConfig[task.priority].color}>
            {priorityConfig[task.priority].label}
          </Badge>
          
          {task.source === 'ai_generated' && (
            <Badge variant="outline" className="gap-1">
              <Sparkles className="w-3 h-3" />
              AI
            </Badge>
          )}

          {task.estimated_hours && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {task.estimated_hours}h
            </span>
          )}

          {task.due_date && (
            <span className={cn(
              'flex items-center gap-1 text-xs',
              isOverdue ? 'text-destructive' : 'text-muted-foreground'
            )}>
              <Calendar className="w-3 h-3" />
              {format(new Date(task.due_date), 'MMM d')}
            </span>
          )}
        </div>

        {personaName && (
          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Assigned to: <span className="text-foreground">{personaName}</span>
            </span>
          </div>
        )}

        {!compact && task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
