import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertCircle, Clock, RefreshCw, Calendar, Timer, Hash, FileText } from 'lucide-react';
import { WorkflowRunWithWorkflow } from '@/hooks/useOfficeData';

interface RunDetailDialogProps {
  run: WorkflowRunWithWorkflow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RunDetailDialog({ run, open, onOpenChange }: RunDetailDialogProps) {
  if (!run) return null;

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'running': return <RefreshCw className="w-5 h-5 text-primary animate-spin" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'paused': return <Clock className="w-5 h-5 text-warning" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'default';
      case 'failed': return 'destructive';
      case 'paused': return 'warning';
      default: return 'secondary';
    }
  };

  const formatDuration = (start: string | null, end: string | null) => {
    if (!start) return '-';
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const diff = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getStatusIcon(run.status)}
            <span>Run Details</span>
            <Badge variant={getStatusBadge(run.status) as any} className="ml-2">
              {run.status || 'pending'}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {run.workflow?.name || 'Unknown Workflow'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Overview Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Hash className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Run ID</p>
                  <p className="font-mono text-sm">{run.id.slice(0, 8)}...</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Timer className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-mono text-sm">{formatDuration(run.started_at, run.completed_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Started At</p>
                  <p className="text-sm">{formatDate(run.started_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Completed At</p>
                  <p className="text-sm">{formatDate(run.completed_at)}</p>
                </div>
              </div>
            </div>

            {/* Progress */}
            {run.status === 'running' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{run.progress || 0}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${run.progress || 0}%` }}
                  />
                </div>
                {run.current_node_id && (
                  <p className="text-xs text-muted-foreground">
                    Current node: <span className="font-mono">{run.current_node_id}</span>
                  </p>
                )}
              </div>
            )}

            {/* Error Section */}
            {run.error && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Error Details
                  </h4>
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <pre className="text-sm text-destructive whitespace-pre-wrap font-mono">
                      {run.error}
                    </pre>
                  </div>
                </div>
              </>
            )}

            {/* Result Section */}
            {run.result && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Result
                  </h4>
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                    <pre className="text-sm whitespace-pre-wrap font-mono overflow-x-auto">
                      {JSON.stringify(run.result, null, 2)}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
