import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Filter,
  RefreshCw,
  Eye,
  Search,
  Radio
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TopBar } from '@/components/layout/TopBar';
import { RunDetailDialog } from '@/components/runs/RunDetailDialog';
import { useCurrentOffice, useWorkflowRuns, WorkflowRunWithWorkflow } from '@/hooks/useOfficeData';

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
  const { currentOffice } = useCurrentOffice();
  const { runs, loading, refetch } = useWorkflowRuns(currentOffice?.id);
  const [selectedRun, setSelectedRun] = useState<WorkflowRunWithWorkflow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLive, setIsLive] = useState(true);
  const prevRunsRef = useRef<string>('');

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

  const filteredRuns = runs.filter(run => {
    const matchesSearch = searchQuery === '' || 
      run.workflow?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: runs.length,
    completed: runs.filter(r => r.status === 'completed').length,
    running: runs.filter(r => r.status === 'running').length,
    failed: runs.filter(r => r.status === 'failed').length,
  };

  const handleViewRun = (run: WorkflowRunWithWorkflow) => {
    setSelectedRun(run);
    setDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <TopBar title="Workflow Runs" subtitle="Monitor and manage execution history" />
        <div className="p-6 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Workflow Runs" 
        subtitle="Monitor and manage execution history"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
              <Radio className="w-3 h-3 text-success animate-pulse" />
              <span className="text-xs font-medium text-success">Live</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        }
      />

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Runs', value: stats.total, color: 'text-foreground' },
            { label: 'Completed', value: stats.completed, color: 'text-success' },
            { label: 'Running', value: stats.running, color: 'text-primary' },
            { label: 'Failed', value: stats.failed, color: 'text-destructive' },
          ].map((stat) => (
            <Card key={stat.label} variant="gradient">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search runs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Runs List */}
        <Card>
          <CardHeader>
            <CardTitle>Execution History</CardTitle>
            <CardDescription>View and manage all workflow runs</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRuns.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No runs found</h3>
                <p className="text-muted-foreground">
                  {runs.length === 0 
                    ? "Workflow runs will appear here once you start executing workflows."
                    : "No runs match your current filters."}
                </p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {filteredRuns.map((run) => (
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
                        <p className="font-medium text-foreground truncate">
                          {run.workflow?.name || 'Unknown Workflow'}
                        </p>
                        <Badge variant={getStatusBadge(run.status) as any}>
                          {run.status || 'pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Started {formatDate(run.started_at)}
                      </p>
                      {run.status === 'running' && (
                        <div className="mt-2 flex items-center gap-3">
                          <Progress value={run.progress || 0} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground">{run.progress || 0}%</span>
                        </div>
                      )}
                      {run.error && (
                        <p className="mt-1 text-sm text-destructive truncate">
                          Error: {run.error}
                        </p>
                      )}
                    </div>

                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-mono text-sm text-foreground">
                        {formatDuration(run.started_at, run.completed_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="outline" 
                        size="icon-sm"
                        onClick={() => handleViewRun(run)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      <RunDetailDialog 
        run={selectedRun}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
