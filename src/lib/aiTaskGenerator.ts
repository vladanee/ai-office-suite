import { supabase } from "@/integrations/supabase/client";

export interface PersonaContext {
  name: string;
  role: string;
  department: string;
  skills?: string[];
  workload?: string;
}

export interface GeneratedTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimated_hours: number;
  acceptance_criteria: string[];
  skills_required: string[];
  suggested_approach: string;
}

export interface TaskGenerationResponse {
  success: boolean;
  persona: string;
  generated_at: string;
  tasks?: GeneratedTask[];
  error?: string;
}

export const generatePersonaTasks = async (
  persona: PersonaContext,
  workflowContext?: string,
  numTasks: number = 3,
  priorityFocus: 'low' | 'medium' | 'high' = 'medium'
): Promise<TaskGenerationResponse> => {
  const { data, error } = await supabase.functions.invoke('ai-task-generator', {
    body: {
      persona,
      workflow_context: workflowContext,
      num_tasks: numTasks,
      priority_focus: priorityFocus,
    },
  });

  if (error) {
    console.error('Error generating tasks:', error);
    throw new Error(error.message || 'Failed to generate tasks');
  }

  return data as TaskGenerationResponse;
};
