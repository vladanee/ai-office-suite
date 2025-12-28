import { motion } from 'framer-motion';
import { Plus, Users, Settings, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore } from '@/store/appStore';

const colorMap: Record<string, string> = {
  primary: 'bg-primary/20 text-primary',
  accent: 'bg-accent/20 text-accent',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
};

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

export default function Departments() {
  const { departments, personas } = useAppStore();

  const getPersonasForDept = (deptId: string) => {
    return personas.filter(p => p.departmentId === deptId);
  };

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Departments" 
        subtitle="Organize your AI workforce"
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        }
      />

      <div className="p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {departments.map((dept) => {
            const deptPersonas = getPersonasForDept(dept.id);
            const activeCount = deptPersonas.filter(p => p.status === 'active').length;
            
            return (
              <motion.div key={dept.id} variants={itemVariants}>
                <Card className="group hover:border-primary/30 transition-all duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-xl ${colorMap[dept.color]} flex items-center justify-center`}>
                        <Users className="w-6 h-6" />
                      </div>
                      <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardTitle className="mt-4">{dept.name}</CardTitle>
                    <CardDescription>{dept.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{dept.personaCount} personas</Badge>
                        <Badge variant="success">{activeCount} active</Badge>
                      </div>
                    </div>

                    <div className="flex -space-x-2">
                      {deptPersonas.slice(0, 5).map((persona) => (
                        <div
                          key={persona.id}
                          className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-medium text-primary-foreground border-2 border-card"
                          title={persona.name}
                        >
                          {persona.avatar}
                        </div>
                      ))}
                      {deptPersonas.length > 5 && (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground border-2 border-card">
                          +{deptPersonas.length - 5}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="w-4 h-4 mr-2" />
                        Manage
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1">
                        View All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {/* Add New Card */}
          <motion.div variants={itemVariants}>
            <Card className="border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer group h-full min-h-[280px]">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="font-semibold text-foreground mb-2">Create Department</p>
                <p className="text-sm text-muted-foreground">Organize personas by function</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
