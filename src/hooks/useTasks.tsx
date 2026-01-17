import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Task {
  id: string;
  office_id: string | null;
  persona_id: string | null;
  assigned_to: string | null;
  created_by: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_hours: number | null;
  actual_hours: number | null;
  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  source: 'manual' | 'ai_generated' | 'workflow' | 'template';
  acceptance_criteria: string[];
  skills_required: string[];
  suggested_approach: string | null;
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TaskInsert {
  office_id: string;
  persona_id?: string | null;
  assigned_to?: string | null;
  title: string;
  description?: string | null;
  status?: Task['status'];
  priority?: Task['priority'];
  estimated_hours?: number | null;
  due_date?: string | null;
  source?: Task['source'];
  acceptance_criteria?: string[];
  skills_required?: string[];
  suggested_approach?: string | null;
  tags?: string[];
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  status?: Task['status'];
  priority?: Task['priority'];
  persona_id?: string | null;
  assigned_to?: string | null;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  due_date?: string | null;
  acceptance_criteria?: string[];
  skills_required?: string[];
  suggested_approach?: string | null;
  tags?: string[];
}

export function useTasks(officeId?: string) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!officeId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('office_id', officeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } else {
      // Transform JSONB arrays to proper arrays
      const transformedTasks = (data || []).map(task => ({
        ...task,
        acceptance_criteria: Array.isArray(task.acceptance_criteria) ? task.acceptance_criteria : [],
        skills_required: Array.isArray(task.skills_required) ? task.skills_required : [],
        tags: Array.isArray(task.tags) ? task.tags : [],
        metadata: task.metadata || {},
      })) as Task[];
      setTasks(transformedTasks);
    }
    setLoading(false);
  }, [officeId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Realtime subscription
  useEffect(() => {
    if (!officeId) return;

    const channel = supabase
      .channel(`tasks-${officeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `office_id=eq.${officeId}`,
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [officeId, fetchTasks]);

  const createTask = async (taskData: TaskInsert) => {
    if (!user?.id) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        created_by: user.id,
        acceptance_criteria: taskData.acceptance_criteria || [],
        skills_required: taskData.skills_required || [],
        tags: taskData.tags || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return { error };
    }

    return { data, error: null };
  };

  const updateTask = async (taskId: string, updates: TaskUpdate) => {
    const updatePayload: Record<string, any> = { ...updates };
    
    // Handle status transitions
    if (updates.status === 'in_progress' && !updatePayload.started_at) {
      updatePayload.started_at = new Date().toISOString();
    }
    if (updates.status === 'done' && !updatePayload.completed_at) {
      updatePayload.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updatePayload)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return { error };
    }

    return { data, error: null };
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      return { error };
    }

    return { error: null };
  };

  const bulkCreateTasks = async (tasksData: TaskInsert[]) => {
    if (!user?.id) return { error: new Error('Not authenticated') };

    const tasksWithUser = tasksData.map(task => ({
      ...task,
      created_by: user.id,
      acceptance_criteria: task.acceptance_criteria || [],
      skills_required: task.skills_required || [],
      tags: task.tags || [],
    }));

    const { data, error } = await supabase
      .from('tasks')
      .insert(tasksWithUser)
      .select();

    if (error) {
      console.error('Error bulk creating tasks:', error);
      return { error };
    }

    return { data, error: null };
  };

  // Get tasks grouped by status (for Kanban view)
  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    in_review: tasks.filter(t => t.status === 'in_review'),
    done: tasks.filter(t => t.status === 'done'),
    cancelled: tasks.filter(t => t.status === 'cancelled'),
  };

  // Statistics
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length,
    byPriority: {
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    },
  };

  return {
    tasks,
    tasksByStatus,
    stats,
    loading,
    createTask,
    updateTask,
    deleteTask,
    bulkCreateTasks,
    refetch: fetchTasks,
  };
}
