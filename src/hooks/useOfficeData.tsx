import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables, Json } from '@/integrations/supabase/types';

type OfficeMember = Tables<'office_members'>;

type Office = Tables<'offices'>;
type Department = Tables<'departments'>;
type Persona = Tables<'personas'>;
type Workflow = Tables<'workflows'>;
type WorkflowRun = Tables<'workflow_runs'>;

export function useCurrentOffice() {
  const { user } = useAuth();
  const [currentOffice, setCurrentOffice] = useState<Office | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCurrentOffice(null);
      setLoading(false);
      return;
    }

    const fetchCurrentOffice = async () => {
      // First check if user has a current_office_id in their profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_office_id')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.current_office_id) {
        const { data: office } = await supabase
          .from('offices')
          .select('*')
          .eq('id', profile.current_office_id)
          .maybeSingle();
        
        if (office) {
          setCurrentOffice(office);
          setLoading(false);
          return;
        }
      }

      // Otherwise, get the first office the user is a member of
      const { data: membership } = await supabase
        .from('office_members')
        .select('office_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (membership) {
        const { data: office } = await supabase
          .from('offices')
          .select('*')
          .eq('id', membership.office_id)
          .maybeSingle();
        
        setCurrentOffice(office);
      }

      setLoading(false);
    };

    fetchCurrentOffice();
  }, [user]);

  const switchOffice = async (officeId: string) => {
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ current_office_id: officeId })
      .eq('id', user.id);

    const { data: office } = await supabase
      .from('offices')
      .select('*')
      .eq('id', officeId)
      .maybeSingle();

    setCurrentOffice(office);
  };

  return { currentOffice, loading, switchOffice };
}

export function useDepartments(officeId: string | undefined) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartments = async () => {
    if (!officeId) {
      setDepartments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('office_id', officeId)
      .order('name');

    if (!error && data) {
      setDepartments(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDepartments();
  }, [officeId]);

  const createDepartment = async (department: { name: string; description?: string; color?: string }) => {
    if (!officeId) return { error: new Error('No office selected') };

    const { data, error } = await supabase
      .from('departments')
      .insert({
        ...department,
        office_id: officeId,
      })
      .select()
      .single();

    if (!error && data) {
      setDepartments(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    }

    return { data, error };
  };

  const updateDepartment = async (id: string, updates: { name?: string; description?: string; color?: string }) => {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setDepartments(prev => 
        prev.map(d => d.id === id ? data : d).sort((a, b) => a.name.localeCompare(b.name))
      );
    }

    return { data, error };
  };

  const deleteDepartment = async (id: string) => {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (!error) {
      setDepartments(prev => prev.filter(d => d.id !== id));
    }

    return { error };
  };

  return { departments, loading, createDepartment, updateDepartment, deleteDepartment, refetch: fetchDepartments };
}

export function usePersonas(officeId: string | undefined) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPersonas = async () => {
    if (!officeId) {
      setPersonas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('office_id', officeId)
      .order('name');

    if (!error && data) {
      setPersonas(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPersonas();
  }, [officeId]);

  const createPersona = async (persona: { 
    name: string; 
    role: string; 
    avatar?: string;
    department_id?: string | null;
    skills?: string[];
    status?: string;
    system_prompt?: string;
  }) => {
    if (!officeId) return { error: new Error('No office selected') };

    const { data, error } = await supabase
      .from('personas')
      .insert({
        ...persona,
        office_id: officeId,
      })
      .select()
      .single();

    if (!error && data) {
      setPersonas(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    }

    return { data, error };
  };

  const updatePersona = async (id: string, updates: { 
    name?: string; 
    role?: string; 
    avatar?: string;
    department_id?: string | null;
    skills?: string[];
    status?: string;
    system_prompt?: string;
  }) => {
    const { data, error } = await supabase
      .from('personas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setPersonas(prev => 
        prev.map(p => p.id === id ? data : p).sort((a, b) => a.name.localeCompare(b.name))
      );
    }

    return { data, error };
  };

  const deletePersona = async (id: string) => {
    const { error } = await supabase
      .from('personas')
      .delete()
      .eq('id', id);

    if (!error) {
      setPersonas(prev => prev.filter(p => p.id !== id));
    }

    return { error };
  };

  return { personas, loading, createPersona, updatePersona, deletePersona, refetch: fetchPersonas };
}

export function useWorkflows(officeId: string | undefined) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = async () => {
    if (!officeId) {
      setWorkflows([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('office_id', officeId)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setWorkflows(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkflows();
  }, [officeId]);

  const createWorkflow = async (workflow: { 
    name: string; 
    description?: string;
    nodes?: Json;
    edges?: Json;
    is_active?: boolean;
  }) => {
    if (!officeId) return { data: null, error: new Error('No office selected') };

    const { data, error } = await supabase
      .from('workflows')
      .insert({
        name: workflow.name,
        description: workflow.description,
        office_id: officeId,
        nodes: workflow.nodes || [],
        edges: workflow.edges || [],
        is_active: workflow.is_active,
      })
      .select()
      .single();

    if (!error && data) {
      setWorkflows(prev => [data, ...prev]);
    }

    return { data, error };
  };

  const updateWorkflow = async (id: string, updates: { 
    name?: string; 
    description?: string;
    nodes?: Json;
    edges?: Json;
    is_active?: boolean;
  }) => {
    const { data, error } = await supabase
      .from('workflows')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setWorkflows(prev => 
        prev.map(w => w.id === id ? data : w)
      );
    }

    return { data, error };
  };

  const deleteWorkflow = async (id: string) => {
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id);

    if (!error) {
      setWorkflows(prev => prev.filter(w => w.id !== id));
    }

    return { error };
  };

  const getWorkflow = async (id: string) => {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    return { data, error };
  };

  return { workflows, loading, createWorkflow, updateWorkflow, deleteWorkflow, getWorkflow, refetch: fetchWorkflows };
}

export type WorkflowRunWithWorkflow = WorkflowRun & {
  workflow: { name: string } | null;
};

export function useWorkflowRuns(officeId: string | undefined, limit = 50) {
  const [runs, setRuns] = useState<WorkflowRunWithWorkflow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRuns = async () => {
    if (!officeId) {
      setRuns([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('workflow_runs')
      .select('*, workflow:workflows(name)')
      .eq('office_id', officeId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data) {
      setRuns(data as WorkflowRunWithWorkflow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRuns();
  }, [officeId, limit]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!officeId) return;

    const channel = supabase
      .channel('workflow-runs-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workflow_runs',
          filter: `office_id=eq.${officeId}`,
        },
        async (payload) => {
          console.log('New workflow run:', payload.new);
          // Fetch the new run with workflow data
          const { data } = await supabase
            .from('workflow_runs')
            .select('*, workflow:workflows(name)')
            .eq('id', (payload.new as WorkflowRun).id)
            .single();
          
          if (data) {
            setRuns(prev => [data as WorkflowRunWithWorkflow, ...prev.slice(0, limit - 1)]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'workflow_runs',
          filter: `office_id=eq.${officeId}`,
        },
        (payload) => {
          console.log('Updated workflow run:', payload.new);
          const updated = payload.new as WorkflowRun;
          setRuns(prev => 
            prev.map(run => 
              run.id === updated.id 
                ? { ...run, ...updated }
                : run
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [officeId, limit]);

  const executeWorkflow = async (workflowId: string, input?: Record<string, unknown>) => {
    if (!officeId) return { data: null, error: new Error('No office selected') };

    const { data, error } = await supabase.functions.invoke('execute-workflow', {
      body: { workflowId, officeId, input },
    });

    // No need to refetch - realtime will handle it
    return { data, error };
  };

  return { runs, loading, refetch: fetchRuns, executeWorkflow };
}

export function useDashboardStats(officeId: string | undefined) {
  const [stats, setStats] = useState({
    activePersonas: 0,
    totalWorkflows: 0,
    totalRuns: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!officeId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      // Get active personas count
      const { count: personaCount } = await supabase
        .from('personas')
        .select('*', { count: 'exact', head: true })
        .eq('office_id', officeId)
        .eq('status', 'active');

      // Get workflows count
      const { count: workflowCount } = await supabase
        .from('workflows')
        .select('*', { count: 'exact', head: true })
        .eq('office_id', officeId);

      // Get runs count
      const { count: runCount } = await supabase
        .from('workflow_runs')
        .select('*', { count: 'exact', head: true })
        .eq('office_id', officeId);

      // Get completed runs for success rate
      const { count: completedCount } = await supabase
        .from('workflow_runs')
        .select('*', { count: 'exact', head: true })
        .eq('office_id', officeId)
        .eq('status', 'completed');

      const successRate = runCount && runCount > 0 
        ? Math.round((completedCount || 0) / runCount * 100 * 10) / 10
        : 0;

      setStats({
        activePersonas: personaCount || 0,
        totalWorkflows: workflowCount || 0,
        totalRuns: runCount || 0,
        successRate,
      });
      setLoading(false);
    };

    fetchStats();
  }, [officeId]);

  return { stats, loading };
}

export function useOffices() {
  const { user } = useAuth();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffices = async () => {
    if (!user) {
      setOffices([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Get all offices the user is a member of
    const { data: memberships, error: memberError } = await supabase
      .from('office_members')
      .select('office_id')
      .eq('user_id', user.id);

    if (memberError || !memberships) {
      setOffices([]);
      setLoading(false);
      return;
    }

    const officeIds = memberships.map(m => m.office_id);
    
    if (officeIds.length === 0) {
      setOffices([]);
      setLoading(false);
      return;
    }

    const { data: officesData, error } = await supabase
      .from('offices')
      .select('*')
      .in('id', officeIds)
      .order('name');

    if (!error && officesData) {
      setOffices(officesData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOffices();
  }, [user]);

  const createOffice = async (office: { name: string; description?: string; slug?: string }) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    // Generate slug from name if not provided
    const slug = office.slug || office.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36);

    const { data, error } = await supabase
      .from('offices')
      .insert({
        name: office.name,
        description: office.description,
        slug,
        owner_id: user.id,
      })
      .select()
      .single();

    if (!error && data) {
      // Add user as owner in office_members
      await supabase
        .from('office_members')
        .insert({
          office_id: data.id,
          user_id: user.id,
          role: 'owner',
        });

      setOffices(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    }

    return { data, error };
  };

  const updateOffice = async (id: string, updates: { name?: string; description?: string }) => {
    const { data, error } = await supabase
      .from('offices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setOffices(prev => 
        prev.map(o => o.id === id ? data : o).sort((a, b) => a.name.localeCompare(b.name))
      );
    }

    return { data, error };
  };

  const deleteOffice = async (id: string) => {
    const { error } = await supabase
      .from('offices')
      .delete()
      .eq('id', id);

    if (!error) {
      setOffices(prev => prev.filter(o => o.id !== id));
    }

    return { error };
  };

  return { offices, loading, createOffice, updateOffice, deleteOffice, refetch: fetchOffices };
}

export interface TeamMemberWithProfile extends OfficeMember {
  profile?: {
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useTeamMembers(officeId: string | undefined) {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!officeId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase
      .from('office_members')
      .select(`
        *,
        profile:profiles!office_members_user_id_fkey(email, full_name, avatar_url)
      `)
      .eq('office_id', officeId)
      .order('joined_at');

    if (!error && data) {
      // Transform the data to match our interface
      const transformedData = data.map(member => ({
        ...member,
        profile: Array.isArray(member.profile) ? member.profile[0] : member.profile
      })) as TeamMemberWithProfile[];
      
      setMembers(transformedData);
      
      // Set current user's role
      if (user) {
        const currentMember = transformedData.find(m => m.user_id === user.id);
        setCurrentUserRole(currentMember?.role || null);
      }
    }
    setLoading(false);
  }, [officeId, user]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = async (email: string, role: 'admin' | 'member') => {
    if (!officeId) return { error: new Error('No office selected') };

    // First find the user by email
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (profileError || !profileData) {
      return { error: new Error('User not found. They must have an account first.') };
    }

    // Check if already a member
    const existingMember = members.find(m => m.user_id === profileData.id);
    if (existingMember) {
      return { error: new Error('User is already a member of this office') };
    }

    const { data, error } = await supabase
      .from('office_members')
      .insert({
        office_id: officeId,
        user_id: profileData.id,
        role,
      })
      .select(`
        *,
        profile:profiles!office_members_user_id_fkey(email, full_name, avatar_url)
      `)
      .single();

    if (!error && data) {
      const transformedData = {
        ...data,
        profile: Array.isArray(data.profile) ? data.profile[0] : data.profile
      } as TeamMemberWithProfile;
      
      setMembers(prev => [...prev, transformedData]);
    }

    return { data, error };
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    const { data, error } = await supabase
      .from('office_members')
      .update({ role: newRole })
      .eq('id', memberId)
      .select(`
        *,
        profile:profiles!office_members_user_id_fkey(email, full_name, avatar_url)
      `)
      .single();

    if (!error && data) {
      const transformedData = {
        ...data,
        profile: Array.isArray(data.profile) ? data.profile[0] : data.profile
      } as TeamMemberWithProfile;
      
      setMembers(prev => 
        prev.map(m => m.id === memberId ? transformedData : m)
      );
    }

    return { data, error };
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase
      .from('office_members')
      .delete()
      .eq('id', memberId);

    if (!error) {
      setMembers(prev => prev.filter(m => m.id !== memberId));
    }

    return { error };
  };

  return { 
    members, 
    loading, 
    currentUserRole,
    addMember, 
    updateMemberRole, 
    removeMember, 
    refetch: fetchMembers 
  };
}
