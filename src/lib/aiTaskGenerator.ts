import { supabase } from "@/integrations/supabase/client";
import { getAIProviderConfig, callOllamaCompletion } from "@/lib/aiProvider";

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
  const providerConfig = getAIProviderConfig();

  if (providerConfig.provider === 'ollama') {
    return generateTasksViaOllama(persona, workflowContext, numTasks, priorityFocus);
  }

  // Cloud path (existing)
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

async function generateTasksViaOllama(
  persona: PersonaContext,
  workflowContext?: string,
  numTasks: number = 3,
  priorityFocus: string = 'medium'
): Promise<TaskGenerationResponse> {
  const systemPrompt = `You are an AI task generator for an enterprise workflow automation system called "AI Office". 
Your role is to generate realistic, actionable tasks for AI personas working in different departments.

Guidelines:
- Tasks should be specific, measurable, and achievable
- Consider the persona's role, skills, and department
- Include clear acceptance criteria
- Estimate reasonable time requirements
- Assign appropriate priority levels`;

  const userPrompt = `Generate ${numTasks} tasks for the following AI persona:

Name: ${persona.name}
Role: ${persona.role}
Department: ${persona.department}
${persona.skills ? `Skills: ${persona.skills.join(', ')}` : ''}
${persona.workload ? `Current Workload: ${persona.workload}` : ''}

${workflowContext ? `Workflow Context: ${workflowContext}` : ''}

Priority Focus: ${priorityFocus}

Return the tasks in this exact JSON format (no markdown, just raw JSON):
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Detailed task description",
      "priority": "low|medium|high",
      "estimated_hours": number,
      "acceptance_criteria": ["criterion 1", "criterion 2"],
      "skills_required": ["skill 1", "skill 2"],
      "suggested_approach": "Brief approach suggestion"
    }
  ]
}`;

  try {
    const content = await callOllamaCompletion({
      messages: [{ role: 'user', content: userPrompt }],
      systemPrompt,
    });

    let tasks;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1] || content;
      tasks = JSON.parse(jsonStr.trim());
    } catch {
      tasks = { raw_response: content, parse_error: true };
    }

    return {
      success: true,
      persona: persona.name,
      generated_at: new Date().toISOString(),
      ...tasks,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to generate tasks via Ollama');
  }
}
