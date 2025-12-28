import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  Workflow,
  Clock,
  CheckCircle2,
  BarChart3,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TopBar } from '@/components/layout/TopBar';
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
  Cell
} from 'recharts';

const lineData = [
  { name: 'Mon', runs: 12, success: 11 },
  { name: 'Tue', runs: 19, success: 18 },
  { name: 'Wed', runs: 15, success: 14 },
  { name: 'Thu', runs: 22, success: 20 },
  { name: 'Fri', runs: 28, success: 26 },
  { name: 'Sat', runs: 8, success: 8 },
  { name: 'Sun', runs: 5, success: 5 },
];

const barData = [
  { name: 'Support', tasks: 45 },
  { name: 'Sales', tasks: 32 },
  { name: 'Engineering', tasks: 58 },
  { name: 'Marketing', tasks: 24 },
];

const pieData = [
  { name: 'Completed', value: 68, color: 'hsl(142, 71%, 45%)' },
  { name: 'Running', value: 12, color: 'hsl(217, 91%, 60%)' },
  { name: 'Failed', value: 8, color: 'hsl(0, 84%, 60%)' },
  { name: 'Paused', value: 12, color: 'hsl(38, 92%, 50%)' },
];

const kpiCards = [
  { label: 'Avg. Completion Time', value: '4.2m', change: '-12%', trend: 'down', icon: Clock },
  { label: 'Success Rate', value: '94.2%', change: '+2.1%', trend: 'up', icon: CheckCircle2 },
  { label: 'Active Personas', value: '12', change: '+3', trend: 'up', icon: Users },
  { label: 'Tasks Processed', value: '1,284', change: '+156', trend: 'up', icon: Activity },
];

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

export default function Analytics() {
  return (
    <div className="min-h-screen">
      <TopBar 
        title="Analytics" 
        subtitle="Performance insights and KPIs"
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
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
                      <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {kpi.trend === 'up' ? (
                          <TrendingUp className="w-3 h-3 text-success" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-success" />
                        )}
                        <span className="text-xs text-success">{kpi.change}</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <kpi.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <motion.div variants={itemVariants} initial="hidden" animate="show">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Performance</CardTitle>
                <CardDescription>Runs vs successful completions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="runs" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="success" 
                        stroke="hsl(var(--success))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--success))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pie Chart */}
          <motion.div variants={itemVariants} initial="hidden" animate="show">
            <Card>
              <CardHeader>
                <CardTitle>Run Status Distribution</CardTitle>
                <CardDescription>Current workflow execution states</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bar Chart */}
        <motion.div variants={itemVariants} initial="hidden" animate="show">
          <Card>
            <CardHeader>
              <CardTitle>Tasks by Department</CardTitle>
              <CardDescription>Total tasks processed per department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar 
                      dataKey="tasks" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
