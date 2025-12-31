import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WorkflowNode {
  id: string;
  type: string;
  data: {
    label?: string;
    description?: string;
    condition?: string;
    url?: string;
  };
  position: { x: number; y: number };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
}

interface ExecutionContext {
  runId: string;
  workflowId: string;
  officeId: string;
  variables: Record<string, unknown>;
  results: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { workflowId, officeId, input } = await req.json();

    if (!workflowId || !officeId) {
      return new Response(
        JSON.stringify({ error: "workflowId and officeId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting workflow execution: ${workflowId}`);

    // Fetch workflow
    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", workflowId)
      .single();

    if (workflowError || !workflow) {
      console.error("Workflow fetch error:", workflowError);
      return new Response(
        JSON.stringify({ error: "Workflow not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const nodes: WorkflowNode[] = workflow.nodes || [];
    const edges: WorkflowEdge[] = workflow.edges || [];

    if (nodes.length === 0) {
      return new Response(
        JSON.stringify({ error: "Workflow has no nodes" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create workflow run
    const { data: run, error: runError } = await supabase
      .from("workflow_runs")
      .insert({
        workflow_id: workflowId,
        office_id: officeId,
        status: "running",
        progress: 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (runError || !run) {
      console.error("Run creation error:", runError);
      return new Response(
        JSON.stringify({ error: "Failed to create run" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Created run: ${run.id}`);

    // Start background execution
    const executeWorkflow = async () => {
      const context: ExecutionContext = {
        runId: run.id,
        workflowId,
        officeId,
        variables: input || {},
        results: {},
      };

      try {
        // Find start node
        const startNode = nodes.find((n) => n.type === "start");
        if (!startNode) {
          throw new Error("No start node found in workflow");
        }

        // Build adjacency map
        const adjacency = new Map<string, WorkflowEdge[]>();
        for (const edge of edges) {
          const existing = adjacency.get(edge.source) || [];
          existing.push(edge);
          adjacency.set(edge.source, existing);
        }

        // Execute nodes in order
        const visited = new Set<string>();
        const queue: string[] = [startNode.id];
        let processedCount = 0;
        const totalNodes = nodes.filter((n) => n.type !== "start" && n.type !== "end").length;

        while (queue.length > 0) {
          const currentNodeId = queue.shift()!;
          if (visited.has(currentNodeId)) continue;
          visited.add(currentNodeId);

          const currentNode = nodes.find((n) => n.id === currentNodeId);
          if (!currentNode) continue;

          console.log(`Executing node: ${currentNode.type} - ${currentNode.data.label || currentNode.id}`);

          // Update current node
          await supabase
            .from("workflow_runs")
            .update({ current_node_id: currentNodeId })
            .eq("id", run.id);

          // Execute based on node type
          let nextHandleId: string | null = null;

          switch (currentNode.type) {
            case "start":
              // Start node just passes through
              break;

            case "task":
              const taskResult = await executeTask(currentNode, context);
              context.results[currentNodeId] = taskResult;
              processedCount++;
              break;

            case "conditional":
              const conditionResult = evaluateCondition(currentNode, context);
              nextHandleId = conditionResult ? "a" : "b";
              processedCount++;
              break;

            case "webhook":
              const webhookResult = await executeWebhook(currentNode, context);
              context.results[currentNodeId] = webhookResult;
              processedCount++;
              break;

            case "end":
              // End node - workflow complete
              console.log("Reached end node");
              break;
          }

          // Update progress
          const progress = totalNodes > 0 
            ? Math.min(Math.round((processedCount / totalNodes) * 100), 99)
            : 50;
          
          await supabase
            .from("workflow_runs")
            .update({ progress })
            .eq("id", run.id);

          // Find next nodes
          const outgoingEdges = adjacency.get(currentNodeId) || [];
          for (const edge of outgoingEdges) {
            // For conditional nodes, only follow the matching handle
            if (currentNode.type === "conditional" && nextHandleId) {
              if (edge.sourceHandle !== nextHandleId) continue;
            }
            queue.push(edge.target);
          }
        }

        // Mark as completed
        await supabase
          .from("workflow_runs")
          .update({
            status: "completed",
            progress: 100,
            completed_at: new Date().toISOString(),
            result: context.results,
          })
          .eq("id", run.id);

        console.log(`Workflow completed: ${run.id}`);
      } catch (error) {
        console.error(`Workflow error: ${error}`);
        await supabase
          .from("workflow_runs")
          .update({
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
            completed_at: new Date().toISOString(),
          })
          .eq("id", run.id);
      }
    };

    // Execute in background using globalThis for Deno Deploy
    (globalThis as any).EdgeRuntime?.waitUntil?.(executeWorkflow()) ?? executeWorkflow();

    return new Response(
      JSON.stringify({ 
        success: true, 
        runId: run.id,
        message: "Workflow execution started" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Execute workflow error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function executeTask(
  node: WorkflowNode,
  context: ExecutionContext
): Promise<unknown> {
  const { label, description } = node.data;
  console.log(`Executing task: ${label}`);

  // If there's a description, use AI to process it
  if (description) {
    try {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (LOVABLE_API_KEY) {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are an AI assistant executing a workflow task. Perform the requested task and return a concise result.`,
              },
              {
                role: "user",
                content: `Task: ${label}\nDescription: ${description}\nContext: ${JSON.stringify(context.variables)}`,
              },
            ],
            max_tokens: 500,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const result = data.choices?.[0]?.message?.content || "Task completed";
          console.log(`AI task result: ${result}`);
          return { success: true, output: result };
        }
      }
    } catch (error) {
      console.error(`AI task error: ${error}`);
    }
  }

  // Default: just mark as completed
  return { success: true, output: `Task "${label}" completed` };
}

function evaluateCondition(
  node: WorkflowNode,
  context: ExecutionContext
): boolean {
  const { condition } = node.data;
  console.log(`Evaluating condition: ${condition}`);

  if (!condition) return true;

  try {
    // Simple condition evaluation
    // Supports: variable == value, variable != value, variable > value, etc.
    const conditionLower = condition.toLowerCase().trim();
    
    // Handle "true" / "false" literals
    if (conditionLower === "true") return true;
    if (conditionLower === "false") return false;

    // Handle comparison operators
    const operators = ["===", "!==", "==", "!=", ">=", "<=", ">", "<"];
    for (const op of operators) {
      if (condition.includes(op)) {
        const [left, right] = condition.split(op).map((s) => s.trim());
        const leftValue = resolveValue(left, context);
        const rightValue = resolveValue(right, context);

        switch (op) {
          case "===":
          case "==":
            return leftValue === rightValue;
          case "!==":
          case "!=":
            return leftValue !== rightValue;
          case ">=":
            return Number(leftValue) >= Number(rightValue);
          case "<=":
            return Number(leftValue) <= Number(rightValue);
          case ">":
            return Number(leftValue) > Number(rightValue);
          case "<":
            return Number(leftValue) < Number(rightValue);
        }
      }
    }

    // If no operator, check if variable is truthy
    const value = context.variables[condition];
    return Boolean(value);
  } catch (error) {
    console.error(`Condition evaluation error: ${error}`);
    return false;
  }
}

function resolveValue(
  expr: string,
  context: ExecutionContext
): unknown {
  // Remove quotes for string literals
  if ((expr.startsWith('"') && expr.endsWith('"')) || 
      (expr.startsWith("'") && expr.endsWith("'"))) {
    return expr.slice(1, -1);
  }

  // Check if it's a number
  const num = Number(expr);
  if (!isNaN(num)) return num;

  // Check if it's a boolean
  if (expr === "true") return true;
  if (expr === "false") return false;

  // Check if it's a variable
  if (expr in context.variables) {
    return context.variables[expr];
  }

  // Check if it's a result from previous node
  if (expr.startsWith("results.")) {
    const path = expr.split(".").slice(1);
    let value: unknown = context.results;
    for (const key of path) {
      if (value && typeof value === "object") {
        value = (value as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }
    return value;
  }

  return expr;
}

async function executeWebhook(
  node: WorkflowNode,
  context: ExecutionContext
): Promise<unknown> {
  const { url, label } = node.data;
  console.log(`Executing webhook: ${label} -> ${url}`);

  if (!url) {
    return { success: false, error: "No URL configured" };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workflowId: context.workflowId,
        runId: context.runId,
        nodeId: node.id,
        variables: context.variables,
        results: context.results,
      }),
    });

    const responseText = await response.text();
    let responseData: unknown;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    console.log(`Webhook response: ${response.status}`);
    
    return {
      success: response.ok,
      status: response.status,
      data: responseData,
    };
  } catch (error) {
    console.error(`Webhook error: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Webhook failed",
    };
  }
}
