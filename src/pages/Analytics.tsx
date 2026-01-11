import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  Workflow,
  Clock,
  CheckCircle2,
  Activity,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TopBar } from '@/components/layout/TopBar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { runTrends, statusDistribution, personaActivity, kpiData, isLoading } = useAnalyticsData();

  const kpiCards = [
    { 
      label: 'Avg. Completion Time', 
      value: kpiData?.avgCompletionTime || '0m', 
      change: kpiData?.avgCompletionChange || '0%', 
      trend: kpiData?.avgCompletionChange?.startsWith('-') ? 'down' : 'up', 
      icon: Clock,
      positive: kpiData?.avgCompletionChange?.startsWith('-') // Lower time is better
    },
    { 
      label: 'Success Rate', 
      value: kpiData?.successRate || '0%', 
      change: kpiData?.successRateChange || '0%', 
      trend: kpiData?.successRateChange?.startsWith('-') ? 'down' : 'up', 
      icon: CheckCircle2,
      positive: !kpiData?.successRateChange?.startsWith('-')
    },
    { 
      label: 'Active Personas', 
      value: String(kpiData?.activePersonas || 0), 
      change: kpiData?.personasChange || '0', 
      trend: 'up', 
      icon: Users,
      positive: true
    },
    { 
      label: 'Runs This Week', 
      value: String(kpiData?.totalRuns || 0), 
      change: kpiData?.runsChange || '0', 
      trend: kpiData?.runsChange?.startsWith('-') ? 'down' : 'up', 
      icon: Activity,
      positive: !kpiData?.runsChange?.startsWith('-')
    },
  ];

  const hasData = runTrends.length > 0 || statusDistribution.length > 0;

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Analytics" 
        subtitle="Real-time performance insights and KPIs"
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {kpiCards.map((kpi) => (
            <motion.div key={kpi.label} variants={itemVariants}>
              <Card variant="gradient">
                <CardContent className="p-5">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
                        <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {kpi.trend === 'up' ? (
                            <TrendingUp className={`w-3 h-3 ${kpi.positive ? 'text-success' : 'text-destructive'}`} />
                          ) : (
                            <TrendingDown className={`w-3 h-3 ${kpi.positive ? 'text-success' : 'text-destructive'}`} />
                          )}
                          <span className={`text-xs ${kpi.positive ? 'text-success' : 'text-destructive'}`}>
                            {kpi.change}
                          </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <kpi.icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Run Trends Line Chart */}
          <motion.div variants={itemVariants} initial="hidden" animate="show">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-primary" />
                  Run Trends (Last 7 Days)
                </CardTitle>
                <CardDescription>Total runs vs successful completions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : runTrends.some(d => d.total > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={runTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="total" 
                          name="Total Runs"
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="completed" 
                          name="Completed"
                          stroke="hsl(142, 71%, 45%)" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(142, 71%, 45%)' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="failed" 
                          name="Failed"
                          stroke="hsl(0, 84%, 60%)" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(0, 84%, 60%)' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Workflow className="w-12 h-12 mb-2 opacity-50" />
                      <p>No workflow runs yet</p>
                      <p className="text-sm">Run some workflows to see trends</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Distribution Pie Chart */}
          <motion.div variants={itemVariants} initial="hidden" animate="show">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Workflow Success Rates
                </CardTitle>
                <CardDescription>Distribution of run statuses across all workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  {isLoading ? (
                    <Skeleton className="h-48 w-48 rounded-full" />
                  ) : statusDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <CheckCircle2 className="w-12 h-12 mb-2 opacity-50" />
                      <p>No run data available</p>
                      <p className="text-sm">Execute workflows to see success rates</p>
                    </div>
                  )}
                </div>
                {statusDistribution.length > 0 && (
                  <div className="flex justify-center gap-4 mt-4 flex-wrap">
                    {statusDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.name} ({item.value})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Persona Activity Bar Chart */}
        <motion.div variants={itemVariants} initial="hidden" animate="show">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Persona Activity Metrics
              </CardTitle>
              <CardDescription>Chat sessions and messages per AI persona</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : personaActivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={personaActivity} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        type="number"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        allowDecimals={false}
                      />
                      <YAxis 
                        type="category"
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        width={100}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        dataKey="sessions" 
                        name="Sessions"
                        fill="hsl(var(--primary))"
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar 
                        dataKey="messages" 
                        name="Messages"
                        fill="hsl(217, 91%, 60%)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Users className="w-12 h-12 mb-2 opacity-50" />
                    <p>No persona activity yet</p>
                    <p className="text-sm">Chat with personas to see activity metrics</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
