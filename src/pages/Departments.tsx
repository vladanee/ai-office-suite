import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TopBar } from '@/components/layout/TopBar';
import { DepartmentDialog } from '@/components/departments/DepartmentDialog';
import { DeleteDepartmentDialog } from '@/components/departments/DeleteDepartmentDialog';
import { useCurrentOffice, useDepartments, usePersonas } from '@/hooks/useOfficeData';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

type Department = Tables<'departments'>;

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
  const { currentOffice, loading: officeLoading } = useCurrentOffice();
  const { departments, loading: deptLoading, createDepartment, updateDepartment, deleteDepartment } = useDepartments(currentOffice?.id);
  const { personas, loading: personasLoading } = usePersonas(currentOffice?.id);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const isLoading = officeLoading || deptLoading || personasLoading;

  const getPersonasForDept = (deptId: string) => {
    return personas.filter(p => p.department_id === deptId);
  };

  const handleCreate = () => {
    setSelectedDepartment(null);
    setDialogOpen(true);
  };

  const handleEdit = (dept: Department) => {
    setSelectedDepartment(dept);
    setDialogOpen(true);
  };

  const handleDelete = (dept: Department) => {
    setSelectedDepartment(dept);
    setDeleteDialogOpen(true);
  };

  const handleSave = async (data: { name: string; description?: string; color?: string }) => {
    if (selectedDepartment) {
      const { error } = await updateDepartment(selectedDepartment.id, data);
      if (!error) {
        toast.success('Department updated successfully');
      } else {
        toast.error('Failed to update department');
      }
      return { error };
    } else {
      const { error } = await createDepartment(data);
      if (!error) {
        toast.success('Department created successfully');
      } else {
        toast.error('Failed to create department');
      }
      return { error };
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDepartment) return { error: new Error('No department selected') };
    
    const { error } = await deleteDepartment(selectedDepartment.id);
    if (!error) {
      toast.success('Department deleted successfully');
    } else {
      toast.error('Failed to delete department');
    }
    return { error };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <TopBar title="Departments" subtitle="Organize your AI workforce" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!currentOffice) {
    return (
      <div className="min-h-screen">
        <TopBar title="Departments" subtitle="Organize your AI workforce" />
        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="max-w-md text-center p-8">
            <CardContent className="space-y-4">
              <Users className="w-12 h-12 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-semibold">No Office Found</h2>
              <p className="text-muted-foreground">
                You need to create or join an office before managing departments.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Departments" 
        subtitle={`Organize your AI workforce in ${currentOffice.name}`}
        actions={
          <Button onClick={handleCreate}>
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
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${dept.color}20` }}
                      >
                        <Users className="w-6 h-6" style={{ color: dept.color || 'hsl(var(--primary))' }} />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                            aria-label="Department actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(dept)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(dept)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="mt-4">{dept.name}</CardTitle>
                    <CardDescription>{dept.description || 'No description'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline">{deptPersonas.length} personas</Badge>
                      {activeCount > 0 && (
                        <Badge variant="success">{activeCount} active</Badge>
                      )}
                    </div>

                    {deptPersonas.length > 0 ? (
                      <div className="flex -space-x-2">
                        {deptPersonas.slice(0, 5).map((persona) => (
                          <div
                            key={persona.id}
                            className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-medium text-primary-foreground border-2 border-card"
                            title={persona.name}
                          >
                            {persona.avatar || '🤖'}
                          </div>
                        ))}
                        {deptPersonas.length > 5 && (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground border-2 border-card">
                            +{deptPersonas.length - 5}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No personas assigned</p>
                    )}

                    <div className="mt-4 pt-4 border-t border-border">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleEdit(dept)}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Department
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {/* Add New Card */}
          <motion.div variants={itemVariants}>
            <Card 
              className="border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer group h-full min-h-[280px]"
              onClick={handleCreate}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              aria-label="Create new department"
            >
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

        {departments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No departments yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first department to organize your AI personas by function.
            </p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Department
            </Button>
          </motion.div>
        )}
      </div>

      <DepartmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        department={selectedDepartment}
        onSave={handleSave}
      />

      <DeleteDepartmentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        department={selectedDepartment}
        personaCount={selectedDepartment ? getPersonasForDept(selectedDepartment.id).length : 0}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}