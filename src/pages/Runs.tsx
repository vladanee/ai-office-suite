import { motion } from 'framer-motion';
import { 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Filter,
  RefreshCw,
  MoreVertical,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore } from '@/store/appStore';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export default function Runs() {
  const { runs } = useAppStore();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'running': return <RefreshCw className="w-5 h-5 text-primary animate-spin" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'paused': return <Clock className="w-5 h-5 text-warning" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'default';
      case 'failed': return 'destructive';
      case 'paused': return 'warning';
      default: return 'muted';
    }
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const diff = endTime.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Workflow Runs" 
        subtitle="Monitor and manage execution history"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button>
              <Play className="w-4 h-4 mr-2" />
              New Run
            </Button>
          </div>
        }
      />

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Runs', value: runs.length, color: 'primary' },
            { label: 'Completed', value: runs.filter(r => r.status === 'completed').length, color: 'success' },
            { label: 'Running', value: runs.filter(r => r.status === 'running').length, color: 'primary' },
            { label: 'Failed', value: runs.filter(r => r.status === 'failed').length, color: 'destructive' },
          ].map((stat) => (
            <Card key={stat.label} variant="gradient">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Runs List */}
        <Card>
          <CardHeader>
            <CardTitle>Execution History</CardTitle>
            <CardDescription>View and manage all workflow runs</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {runs.map((run) => (
                <motion.div
                  key={run.id}
                  variants={itemVariants}
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center border border-border">
                    {getStatusIcon(run.status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">Run #{run.id}</p>
                      <Badge variant={getStatusBadge(run.status) as any}>
                        {run.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Workflow {run.workflowId} • Started {run.startedAt.toLocaleString()}
                    </p>
                    {run.status === 'running' && (
                      <div className="mt-2 flex items-center gap-3">
                        <Progress value={run.progress} className="flex-1 h-2" />
                        <span className="text-sm text-muted-foreground">{run.progress}%</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-mono text-sm text-foreground">
                      {formatDuration(run.startedAt, run.completedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="icon-sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
