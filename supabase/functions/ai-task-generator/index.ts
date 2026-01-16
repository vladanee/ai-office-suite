import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PersonaContext {
  name: string;
  role: string;
  department: string;
  skills?: string[];
  workload?: string;
}

interface TaskGenerationRequest {
  persona: PersonaContext;
  workflow_context?: string;
  num_tasks?: number;
  priority_focus?: 'low' | 'medium' | 'high';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate the JWT token using getUser
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      console.error('JWT validation failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;
    console.log('Authenticated user:', userId);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { persona, workflow_context, num_tasks = 3, priority_focus = 'medium' }: TaskGenerationRequest = await req.json();
    
    console.log('Generating tasks for persona:', persona.name);
    console.log('Workflow context:', workflow_context);

    const systemPrompt = `You are an AI task generator for an enterprise workflow automation system called "AI Office". 
Your role is to generate realistic, actionable tasks for AI personas working in different departments.

Guidelines:
- Tasks should be specific, measurable, and achievable
- Consider the persona's role, skills, and department
- Include clear acceptance criteria
- Estimate reasonable time requirements
- Assign appropriate priority levels`;

    const userPrompt = `Generate ${num_tasks} tasks for the following AI persona:

Name: ${persona.name}
Role: ${persona.role}
Department: ${persona.department}
${persona.skills ? `Skills: ${persona.skills.join(', ')}` : ''}
${persona.workload ? `Current Workload: ${persona.workload}` : ''}

${workflow_context ? `Workflow Context: ${workflow_context}` : ''}

Priority Focus: ${priority_focus}

Return the tasks in this exact JSON format:
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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log('AI response received:', content.substring(0, 200));

    // Parse the JSON from the response
    let tasks;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1] || content;
      tasks = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return raw content if parsing fails
      tasks = { raw_response: content, parse_error: true };
    }

    return new Response(JSON.stringify({
      success: true,
      persona: persona.name,
      generated_at: new Date().toISOString(),
      ...tasks
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating tasks:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
