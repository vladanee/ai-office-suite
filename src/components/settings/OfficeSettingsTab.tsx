import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Plus, 
  Pencil, 
  Trash2, 
  Users, 
  Check,
  Loader2,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { OfficeDialog } from './OfficeDialog';
import { TeamMembersSection } from './TeamMembersSection';
import { DepartmentDialog } from '@/components/departments/DepartmentDialog';
import { DeleteDepartmentDialog } from '@/components/departments/DeleteDepartmentDialog';
import { useCurrentOffice, useOffices, useDepartments, usePersonas, useTeamMembers } from '@/hooks/useOfficeData';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Office = Tables<'offices'>;
type Department = Tables<'departments'>;

export function OfficeSettingsTab() {
  const { currentOffice, loading: currentLoading, switchOffice } = useCurrentOffice();
  const { offices, loading: officesLoading, createOffice, updateOffice, deleteOffice } = useOffices();
  const { departments, loading: deptsLoading, createDepartment, updateDepartment, deleteDepartment } = useDepartments(currentOffice?.id);
  const { personas } = usePersonas(currentOffice?.id);
  const { 
    members, 
    loading: membersLoading, 
    currentUserRole,
    addMember, 
    updateMemberRole, 
    removeMember 
  } = useTeamMembers(currentOffice?.id);

  const [officeDialogOpen, setOfficeDialogOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [deleteOfficeDialogOpen, setDeleteOfficeDialogOpen] = useState(false);
  const [officeToDelete, setOfficeToDelete] = useState<Office | null>(null);

  const [deptDialogOpen, setDeptDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [deleteDeptDialogOpen, setDeleteDeptDialogOpen] = useState(false);

  const isLoading = currentLoading || officesLoading || deptsLoading;

  const getPersonasForDept = (deptId: string) => {
    return personas.filter(p => p.department_id === deptId);
  };

  // Office handlers
  const handleCreateOffice = () => {
    setSelectedOffice(null);
    setOfficeDialogOpen(true);
  };

  const handleEditOffice = (office: Office) => {
    setSelectedOffice(office);
    setOfficeDialogOpen(true);
  };

  const handleSaveOffice = async (data: { name: string; description?: string }) => {
    if (selectedOffice) {
      const { error } = await updateOffice(selectedOffice.id, data);
      if (!error) {
        toast.success('Office updated successfully');
      } else {
        toast.error('Failed to update office');
      }
      return { error };
    } else {
      const { error } = await createOffice(data);
      if (!error) {
        toast.success('Office created successfully');
      } else {
        toast.error('Failed to create office');
      }
      return { error };
    }
  };

  const handleDeleteOffice = (office: Office) => {
    setOfficeToDelete(office);
    setDeleteOfficeDialogOpen(true);
  };

  const confirmDeleteOffice = async () => {
    if (!officeToDelete) return;
    
    const { error } = await deleteOffice(officeToDelete.id);
    if (!error) {
      toast.success('Office deleted successfully');
      // If we deleted the current office, switch to another
      if (currentOffice?.id === officeToDelete.id && offices.length > 1) {
        const otherOffice = offices.find(o => o.id !== officeToDelete.id);
        if (otherOffice) {
          switchOffice(otherOffice.id);
        }
      }
    } else {
      toast.error('Failed to delete office');
    }
    setDeleteOfficeDialogOpen(false);
    setOfficeToDelete(null);
  };

  const handleSwitchOffice = async (officeId: string) => {
    await switchOffice(officeId);
    toast.success('Switched office');
  };

  // Department handlers
  const handleCreateDept = () => {
    setSelectedDepartment(null);
    setDeptDialogOpen(true);
  };

  const handleEditDept = (dept: Department) => {
    setSelectedDepartment(dept);
    setDeptDialogOpen(true);
  };

  const handleDeleteDept = (dept: Department) => {
    setSelectedDepartment(dept);
    setDeleteDeptDialogOpen(true);
  };

  const handleSaveDept = async (data: { name: string; description?: string; color?: string }) => {
    if (selectedDepartment) {
      const { error } = await updateDepartment(selectedDepartment.id, data);
      if (!error) {
        toast.success('Department updated');
      } else {
        toast.error('Failed to update department');
      }
      return { error };
    } else {
      const { error } = await createDepartment(data);
      if (!error) {
        toast.success('Department created');
      } else {
        toast.error('Failed to create department');
      }
      return { error };
    }
  };

  const handleConfirmDeleteDept = async () => {
    if (!selectedDepartment) return { error: new Error('No department selected') };
    
    const { error } = await deleteDepartment(selectedDepartment.id);
    if (!error) {
      toast.success('Department deleted');
    } else {
      toast.error('Failed to delete department');
    }
    return { error };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Current Office */}
      <Card>
        <CardHeader>
          <CardTitle>Current Office</CardTitle>
          <CardDescription>The office you're currently working in</CardDescription>
        </CardHeader>
        <CardContent>
          {currentOffice ? (
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{currentOffice.name}</p>
                  <p className="text-sm text-muted-foreground">{currentOffice.description || 'No description'}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleEditOffice(currentOffice)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No office selected</p>
              <Button onClick={handleCreateOffice}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Office
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Offices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Offices</CardTitle>
            <CardDescription>All offices you have access to</CardDescription>
          </div>
          <Button onClick={handleCreateOffice} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Office
          </Button>
        </CardHeader>
        <CardContent>
          {offices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No offices yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {offices.map((office) => (
                <div
                  key={office.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    currentOffice?.id === office.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        currentOffice?.id === office.id 
                          ? 'gradient-primary' 
                          : 'bg-secondary'
                      }`}
                    >
                      <Building2 className={`w-5 h-5 ${
                        currentOffice?.id === office.id 
                          ? 'text-primary-foreground' 
                          : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{office.name}</p>
                        {currentOffice?.id === office.id && (
                          <Badge variant="default" className="text-xs">Current</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{office.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentOffice?.id !== office.id && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSwitchOffice(office.id)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Switch
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditOffice(office)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteOffice(office)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Members */}
      {currentOffice && (
        <TeamMembersSection
          officeId={currentOffice.id}
          officeName={currentOffice.name}
          members={members}
          loading={membersLoading}
          currentUserRole={currentUserRole}
          onAddMember={addMember}
          onUpdateRole={updateMemberRole}
          onRemoveMember={removeMember}
        />
      )}

      {/* Departments */}
      {currentOffice && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Departments</CardTitle>
              <CardDescription>Manage departments in {currentOffice.name}</CardDescription>
            </div>
            <Button onClick={handleCreateDept} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </CardHeader>
          <CardContent>
            {departments.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No departments yet</p>
                <Button onClick={handleCreateDept} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Department
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {departments.map((dept) => {
                  const personaCount = getPersonasForDept(dept.id).length;
                  
                  return (
                    <div
                      key={dept.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${dept.color}20` }}
                        >
                          <Users className="w-5 h-5" style={{ color: dept.color || 'hsl(var(--primary))' }} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{dept.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {personaCount} persona{personaCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon-sm"
                          onClick={() => handleEditDept(dept)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon-sm"
                          onClick={() => handleDeleteDept(dept)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <OfficeDialog
        open={officeDialogOpen}
        onOpenChange={setOfficeDialogOpen}
        office={selectedOffice}
        onSave={handleSaveOffice}
      />

      <AlertDialog open={deleteOfficeDialogOpen} onOpenChange={setDeleteOfficeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Office</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{officeToDelete?.name}"? This will permanently delete
              all associated departments, personas, workflows, and runs. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteOffice} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Office
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DepartmentDialog
        open={deptDialogOpen}
        onOpenChange={setDeptDialogOpen}
        department={selectedDepartment}
        onSave={handleSaveDept}
      />

      <DeleteDepartmentDialog
        open={deleteDeptDialogOpen}
        onOpenChange={setDeleteDeptDialogOpen}
        department={selectedDepartment}
        personaCount={selectedDepartment ? getPersonasForDept(selectedDepartment.id).length : 0}
        onConfirm={handleConfirmDeleteDept}
      />
    </motion.div>
  );
}
