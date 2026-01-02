import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Shield,
  Crown,
  User,
  MoreVertical,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TeamMemberDialog } from './TeamMemberDialog';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: {
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface TeamMembersSectionProps {
  officeId: string;
  officeName: string;
  members: TeamMember[];
  loading: boolean;
  currentUserRole: string | null;
  onAddMember: (email: string, role: 'admin' | 'member') => Promise<{ error?: Error | null }>;
  onUpdateRole: (memberId: string, newRole: string) => Promise<{ error?: Error | null }>;
  onRemoveMember: (memberId: string) => Promise<{ error?: Error | null }>;
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: User,
};

const roleBadgeVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  owner: 'default',
  admin: 'secondary',
  member: 'outline',
};

export function TeamMembersSection({
  officeId,
  officeName,
  members,
  loading,
  currentUserRole,
  onAddMember,
  onUpdateRole,
  onRemoveMember,
}: TeamMembersSectionProps) {
  const { user } = useAuth();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const canManageTeam = currentUserRole === 'owner' || currentUserRole === 'admin';
  const isOwner = currentUserRole === 'owner';

  const handleAddMember = async (email: string, role: 'admin' | 'member') => {
    const result = await onAddMember(email, role);
    if (!result.error) {
      toast.success(`Invited ${email} as ${role}`);
    } else {
      toast.error(result.error.message || 'Failed to add member');
    }
    return result;
  };

  const handleRoleChange = async (member: TeamMember, newRole: string) => {
    if (member.role === newRole) return;
    
    setUpdatingRole(member.id);
    const result = await onUpdateRole(member.id, newRole);
    setUpdatingRole(null);

    if (!result.error) {
      toast.success(`Updated role to ${newRole}`);
    } else {
      toast.error('Failed to update role');
    }
  };

  const handleRemoveMember = (member: TeamMember) => {
    setMemberToRemove(member);
    setRemoveDialogOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;

    const result = await onRemoveMember(memberToRemove.id);
    if (!result.error) {
      toast.success('Team member removed');
    } else {
      toast.error('Failed to remove member');
    }
    setRemoveDialogOpen(false);
    setMemberToRemove(null);
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members
            </CardTitle>
            <CardDescription>
              Manage who has access to {officeName}
            </CardDescription>
          </div>
          {canManageTeam && (
            <Button onClick={() => setAddDialogOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No team members yet</p>
              {canManageTeam && (
                <Button onClick={() => setAddDialogOpen(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Member
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => {
                const RoleIcon = roleIcons[member.role as keyof typeof roleIcons] || User;
                const isCurrentUser = member.user_id === user?.id;
                const canEdit = canManageTeam && !isCurrentUser && member.role !== 'owner';
                const canRemove = (isOwner && member.role !== 'owner') || 
                                  (currentUserRole === 'admin' && member.role === 'member');

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(member.profile?.full_name || null, member.profile?.email || null)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">
                            {member.profile?.full_name || member.profile?.email || 'Unknown User'}
                          </p>
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {member.profile?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {canEdit && member.role !== 'owner' ? (
                        <Select
                          value={member.role}
                          onValueChange={(value) => handleRoleChange(member, value)}
                          disabled={updatingRole === member.id}
                        >
                          <SelectTrigger className="w-[120px]">
                            {updatingRole === member.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={roleBadgeVariants[member.role] || 'outline'} className="capitalize">
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {member.role}
                        </Badge>
                      )}
                      
                      {canRemove && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <TeamMemberDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onInvite={handleAddMember}
      />

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-medium">
                {memberToRemove?.profile?.full_name || memberToRemove?.profile?.email}
              </span>{' '}
              from this office? They will lose access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
