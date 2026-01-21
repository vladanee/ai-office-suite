import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentOffice } from '@/hooks/useOfficeData';
import { toast } from 'sonner';

export interface TaskTemplate {
  id: string;
  office_id: string;
  created_by: string;
  name: string;
  description: string | null;
  title_template: string;
  description_template: string | null;
  priority: string;
  estimated_hours: number | null;
  tags: string[];
  acceptance_criteria: string[];
  skills_required: string[];
  category: string | null;
  icon: string;
  is_shared: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface TaskTemplateInsert {
  name: string;
  title_template: string;
  description?: string | null;
  description_template?: string | null;
  priority?: string;
  estimated_hours?: number | null;
  tags?: string[];
  acceptance_criteria?: string[];
  skills_required?: string[];
  category?: string | null;
  icon?: string;
  is_shared?: boolean;
}

export interface TaskTemplateUpdate extends Partial<TaskTemplateInsert> {}

export function useTaskTemplates() {
  const { user } = useAuth();
  const { currentOffice } = useCurrentOffice();
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    if (!currentOffice?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .eq('office_id', currentOffice.id)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      
      setTemplates((data || []).map(t => ({
        ...t,
        tags: Array.isArray(t.tags) ? t.tags : [],
        acceptance_criteria: Array.isArray(t.acceptance_criteria) ? t.acceptance_criteria : [],
        skills_required: Array.isArray(t.skills_required) ? t.skills_required : [],
      })) as TaskTemplate[]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [currentOffice?.id]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (template: TaskTemplateInsert) => {
    if (!user || !currentOffice?.id) {
      toast.error('You must be logged in');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('task_templates')
        .insert({
          ...template,
          office_id: currentOffice.id,
          created_by: user.id,
          tags: template.tags || [],
          acceptance_criteria: template.acceptance_criteria || [],
          skills_required: template.skills_required || [],
        })
        .select()
        .single();

      if (error) throw error;
      
      const newTemplate = {
        ...data,
        tags: Array.isArray(data.tags) ? data.tags : [],
        acceptance_criteria: Array.isArray(data.acceptance_criteria) ? data.acceptance_criteria : [],
        skills_required: Array.isArray(data.skills_required) ? data.skills_required : [],
      } as TaskTemplate;
      
      setTemplates(prev => [newTemplate, ...prev]);
      toast.success('Template created');
      return newTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
      return null;
    }
  };

  const updateTemplate = async (id: string, updates: TaskTemplateUpdate) => {
    try {
      const { data, error } = await supabase
        .from('task_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const updatedTemplate = {
        ...data,
        tags: Array.isArray(data.tags) ? data.tags : [],
        acceptance_criteria: Array.isArray(data.acceptance_criteria) ? data.acceptance_criteria : [],
        skills_required: Array.isArray(data.skills_required) ? data.skills_required : [],
      } as TaskTemplate;
      
      setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
      toast.success('Template updated');
      return updatedTemplate;
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
      return null;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('task_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Template deleted');
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
      return false;
    }
  };

  const incrementUsage = async (id: string) => {
    try {
      const template = templates.find(t => t.id === id);
      if (!template) return;
      
      await supabase
        .from('task_templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', id);
      
      setTemplates(prev => prev.map(t => 
        t.id === id ? { ...t, usage_count: t.usage_count + 1 } : t
      ));
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  };

  const categories = [...new Set(templates.map(t => t.category).filter(Boolean))] as string[];

  return {
    templates,
    loading,
    categories,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage,
    refetch: fetchTemplates,
  };
}
