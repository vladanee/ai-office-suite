import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, MoreVertical, UserPlus, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore } from '@/store/appStore';
import { generatePersonaTasks, GeneratedTask } from '@/lib/aiTaskGenerator';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Personas() {
  const { personas, departments } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [showTasksDialog, setShowTasksDialog] = useState(false);
  const [selectedPersonaName, setSelectedPersonaName] = useState('');

  const filteredPersonas = personas.filter(persona => {
    const matchesSearch = persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          persona.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = !selectedDepartment || persona.departmentId === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getDepartmentName = (deptId: string) => {
    return departments.find(d => d.id === deptId)?.name || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'busy': return 'warning';
      case 'idle': return 'muted';
      default: return 'muted';
    }
  };

  const handleGenerateTasks = async (persona: typeof personas[0]) => {
    setGeneratingFor(persona.id);
    try {
      const result = await generatePersonaTasks({
        name: persona.name,
        role: persona.role,
        department: getDepartmentName(persona.departmentId),
        skills: persona.skills,
        workload: persona.status === 'busy' ? 'heavy' : 'normal',
      });

      if (result.success && result.tasks) {
        setGeneratedTasks(result.tasks);
        setSelectedPersonaName(persona.name);
        setShowTasksDialog(true);
        toast.success(`Generated ${result.tasks.length} tasks for ${persona.name}`);
      } else {
        throw new Error(result.error || 'Failed to generate tasks');
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate tasks');
    } finally {
      setGeneratingFor(null);
    }
  };

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Personas" 
        subtitle="AI-powered team members for your workflows"
        actions={
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Persona
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search personas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedDepartment === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDepartment(null)}
            >
              All
            </Button>
            {departments.map(dept => (
              <Button
                key={dept.id}
                variant={selectedDepartment === dept.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDepartment(dept.id)}
              >
                {dept.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Personas Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filteredPersonas.map((persona) => (
            <motion.div key={persona.id} variants={itemVariants}>
              <Card className="group hover:border-primary/30 transition-all duration-200 hover:shadow-glow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-lg font-semibold text-primary-foreground">
                          {persona.avatar}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card bg-${getStatusColor(persona.status)}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{persona.name}</h3>
                        <p className="text-sm text-muted-foreground">{persona.role}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* AI Generate Tasks Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mb-3"
                    onClick={() => handleGenerateTasks(persona)}
                    disabled={generatingFor === persona.id}
                  >
                    {generatingFor === persona.id ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 mr-2" />
                        Generate Tasks
                      </>
                    )}
                  </Button>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Department</span>
                      <span className="text-foreground">{getDepartmentName(persona.departmentId)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant={getStatusColor(persona.status) as any}>
                        {persona.status}
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {persona.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Add New Card */}
          <motion.div variants={itemVariants}>
            <Card className="border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer group h-full min-h-[240px]">
              <CardContent className="p-5 flex flex-col items-center justify-center h-full text-center">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="font-medium text-foreground mb-1">Add New Persona</p>
                <p className="text-sm text-muted-foreground">Create an AI team member</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Generated Tasks Dialog */}
      <Dialog open={showTasksDialog} onOpenChange={setShowTasksDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Generated Tasks for {selectedPersonaName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {generatedTasks.map((task, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{task.title}</h4>
                  <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'warning' : 'muted'}>
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>⏱️ {task.estimated_hours}h</span>
                  <span>🎯 {task.acceptance_criteria?.length || 0} criteria</span>
                </div>
                {task.suggested_approach && (
                  <p className="text-xs text-primary mt-2 italic">💡 {task.suggested_approach}</p>
                )}
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
