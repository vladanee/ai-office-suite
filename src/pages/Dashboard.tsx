import { motion } from 'framer-motion';
import { 
  Users, 
  Workflow, 
  Play, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Plus,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TopBar } from '@/components/layout/TopBar';
import { Link } from 'react-router-dom';
import { 
  useCurrentOffice, 
  useDashboardStats, 
  useWorkflowRuns, 
  usePersonas, 
  useDepartments 
} from '@/hooks/useOfficeData';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const { currentOffice, loading: officeLoading } = useCurrentOffice();
  const { stats, loading: statsLoading } = useDashboardStats(currentOffice?.id);
  const { runs, loading: runsLoading } = useWorkflowRuns(currentOffice?.id, 5);
  const { personas, loading: personasLoading } = usePersonas(currentOffice?.id);
  const { departments, loading: deptsLoading } = useDepartments(currentOffice?.id);

  const activePersonas = personas.filter(p => p.status === 'active');
  const isLoading = officeLoading || statsLoading || runsLoading || personasLoading || deptsLoading;

  const statsCards = [
    { 
      label: 'Active Personas', 
      value: stats.activePersonas.toString(), 
      change: `${personas.length} total`,
      trend: 'up',
      icon: Users,
      color: 'primary'
    },
    { 
      label: 'Workflows', 
      value: stats.totalWorkflows.toString(), 
      change: 'configured',
      trend: 'up',
      icon: Workflow,
      color: 'accent'
    },
    { 
      label: 'Total Runs', 
      value: stats.totalRuns.toString(), 
      change: 'all time',
      trend: 'up',
      icon: Play,
      color: 'success'
    },
    { 
      label: 'Success Rate', 
      value: `${stats.successRate}%`, 
      change: 'completed',
      trend: 'up',
      icon: TrendingUp,
      color: 'warning'
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentOffice) {
    return (
      <div className="min-h-screen">
        <TopBar title="Dashboard" subtitle="Welcome!" />
        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="max-w-md text-center p-8">
            <CardContent className="space-y-4">
              <Users className="w-12 h-12 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-semibold">No Office Found</h2>
              <p className="text-muted-foreground">
                You haven't joined or created an office yet. Create your first office to get started.
              </p>
              <Button asChild>
                <Link to="/settings">Create Office</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Dashboard" 
        subtitle={`Welcome back! Here's your ${currentOffice.name} overview.`}
        actions={
          <Button asChild>
            <Link to="/workflows">
              <Plus className="w-4 h-4 mr-2" />
              New Workflow
            </Link>
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {statsCards.map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card variant="gradient" className="hover:border-primary/30 transition-colors group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      <div className="flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-success" />
                        <span className="text-xs text-success">{stat.change}</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Runs */}
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Runs</CardTitle>
                  <CardDescription>Latest workflow executions</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/runs">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {runs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No workflow runs yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {runs.map((run) => (
                      <div 
                        key={run.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            run.status === 'completed' ? 'bg-success/20' :
                            run.status === 'running' ? 'bg-primary/20' :
                            run.status === 'failed' ? 'bg-destructive/20' :
                            'bg-warning/20'
                          }`}>
                            {run.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5 text-success" />
                            ) : run.status === 'running' ? (
                              <Play className="w-5 h-5 text-primary" />
                            ) : run.status === 'failed' ? (
                              <AlertCircle className="w-5 h-5 text-destructive" />
                            ) : (
                              <Clock className="w-5 h-5 text-warning" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Workflow Run</p>
                            <p className="text-sm text-muted-foreground">
                              {run.started_at ? new Date(run.started_at).toLocaleString() : 'Not started'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            run.status === 'completed' ? 'success' :
                            run.status === 'running' ? 'default' :
                            run.status === 'failed' ? 'destructive' :
                            'warning'
                          }>
                            {run.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{run.progress || 0}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Personas */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="show"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Active Personas</CardTitle>
                  <CardDescription>{activePersonas.length} currently active</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/personas">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {activePersonas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No active personas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activePersonas.slice(0, 4).map((persona) => (
                      <div 
                        key={persona.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-medium text-primary-foreground">
                          {persona.avatar || '🤖'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{persona.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{persona.role}</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Departments Overview */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="show"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Departments</CardTitle>
                <CardDescription>Your organizational structure</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/departments">Manage</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {departments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No departments created yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {departments.map((dept) => {
                    const deptPersonaCount = personas.filter(p => p.department_id === dept.id).length;
                    return (
                      <div 
                        key={dept.id}
                        className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border/50"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${dept.color}20` }}
                          >
                            <Users className="w-5 h-5" style={{ color: dept.color || 'hsl(var(--primary))' }} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{dept.name}</p>
                            <p className="text-xs text-muted-foreground">{deptPersonaCount} personas</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{dept.description || 'No description'}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
