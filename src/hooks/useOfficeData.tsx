import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables } from '@/integrations/supabase/types';

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

  useEffect(() => {
    if (!officeId) {
      setWorkflows([]);
      setLoading(false);
      return;
    }

    const fetchWorkflows = async () => {
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

    fetchWorkflows();
  }, [officeId]);

  return { workflows, loading };
}

export function useWorkflowRuns(officeId: string | undefined, limit = 10) {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!officeId) {
      setRuns([]);
      setLoading(false);
      return;
    }

    const fetchRuns = async () => {
      const { data, error } = await supabase
        .from('workflow_runs')
        .select('*')
        .eq('office_id', officeId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        setRuns(data);
      }
      setLoading(false);
    };

    fetchRuns();
  }, [officeId, limit]);

  return { runs, loading };
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
