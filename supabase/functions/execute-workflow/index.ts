import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SSRF Protection: Validate URLs to prevent attacks against internal services
function isUrlSafe(urlString: string): { safe: boolean; reason?: string } {
  try {
    const url = new URL(urlString);
    
    // Only allow http and https schemes
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { safe: false, reason: `Invalid protocol: ${url.protocol}. Only http and https are allowed.` };
    }
    
    const hostname = url.hostname.toLowerCase();
    
    // Block localhost and loopback addresses
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return { safe: false, reason: 'Requests to localhost are not allowed.' };
    }
    
    // Block link-local addresses (169.254.x.x) - commonly used for cloud metadata
    if (hostname === '169.254.169.254' || hostname.startsWith('169.254.')) {
      return { safe: false, reason: 'Requests to link-local addresses are not allowed.' };
    }
    
    // Block private IP ranges (RFC 1918)
    const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = hostname.match(ipv4Pattern);
    if (ipMatch) {
      const [, a, b] = ipMatch.map(Number);
      
      // 10.0.0.0/8 (10.x.x.x)
      if (a === 10) {
        return { safe: false, reason: 'Requests to private IP ranges (10.x.x.x) are not allowed.' };
      }
      
      // 172.16.0.0/12 (172.16.x.x - 172.31.x.x)
      if (a === 172 && b >= 16 && b <= 31) {
        return { safe: false, reason: 'Requests to private IP ranges (172.16-31.x.x) are not allowed.' };
      }
      
      // 192.168.0.0/16 (192.168.x.x)
      if (a === 192 && b === 168) {
        return { safe: false, reason: 'Requests to private IP ranges (192.168.x.x) are not allowed.' };
      }
      
      // 0.0.0.0
      if (a === 0) {
        return { safe: false, reason: 'Requests to 0.0.0.0 are not allowed.' };
      }
    }
    
    // Block internal Supabase/edge function hostnames
    const blockedHostPatterns = [
      /^.*\.internal$/,
      /^.*\.local$/,
      /^supabase\./,
      /^.*\.supabase\.co$/,
      /^.*\.supabase\.in$/,
    ];
    
    for (const pattern of blockedHostPatterns) {
      if (pattern.test(hostname)) {
        return { safe: false, reason: 'Requests to internal service hostnames are not allowed.' };
      }
    }
    
    return { safe: true };
  } catch (error) {
    return { safe: false, reason: `Invalid URL format: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

// Timeout for external requests (30 seconds)
const EXTERNAL_REQUEST_TIMEOUT_MS = 30000;
// Maximum response size (5MB)
const MAX_RESPONSE_SIZE = 5 * 1024 * 1024;

interface WorkflowNode {
  id: string;
  type: string;
  data: {
    label?: string;
    description?: string;
    condition?: string;
    url?: string;
    // Delay node
    delay?: number;
    // Loop node
    iterations?: number;
    collection?: string;
    // Email node
    to?: string;
    subject?: string;
    body?: string;
    // Transform node
    transform?: string;
    inputVar?: string;
    outputVar?: string;
    // HTTP node
    method?: string;
    headers?: string;
    // Social media nodes
    content?: string;
    hashtags?: string;
    mediaUrl?: string;
    scheduledAt?: string;
    webhookUrl?: string;
    platform?: 'twitter' | 'linkedin' | 'instagram' | 'facebook';
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
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Authentication: Verify user token
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Create client with user's token to verify authentication
  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
  
  if (claimsError || !claimsData?.claims) {
    console.error("Auth error:", claimsError);
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const userId = claimsData.claims.sub;
  console.log(`Authenticated user: ${userId}`);

  // Create service role client for database operations
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { workflowId, officeId, input } = await req.json();

    if (!workflowId || !officeId) {
      return new Response(
        JSON.stringify({ error: "workflowId and officeId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is a member of the office
    const { data: membership, error: membershipError } = await supabase
      .from("office_members")
      .select("id")
      .eq("office_id", officeId)
      .eq("user_id", userId)
      .maybeSingle();

    if (membershipError) {
      console.error("Membership check error:", membershipError);
      return new Response(
        JSON.stringify({ error: "Failed to verify permissions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Also check if user is office owner
    const { data: office, error: officeError } = await supabase
      .from("offices")
      .select("owner_id")
      .eq("id", officeId)
      .single();

    if (!membership && (!office || office.owner_id !== userId)) {
      console.log(`User ${userId} is not a member of office ${officeId}`);
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
            case "assignment":
            case "qa":
            case "kpi":
            case "report":
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

            case "delay":
              const delayResult = await executeDelay(currentNode, context);
              context.results[currentNodeId] = delayResult;
              processedCount++;
              break;

            case "loop":
              const loopResult = await executeLoop(currentNode, context, nodes, edges, adjacency, visited);
              context.results[currentNodeId] = loopResult;
              nextHandleId = "done"; // Continue to done path after loop completes
              processedCount++;
              break;

            case "email":
              const emailResult = await executeEmail(currentNode, context);
              context.results[currentNodeId] = emailResult;
              processedCount++;
              break;

            case "transform":
              const transformResult = executeTransform(currentNode, context);
              context.results[currentNodeId] = transformResult;
              processedCount++;
              break;

            case "http":
              const httpResult = await executeHTTP(currentNode, context);
              context.results[currentNodeId] = httpResult;
              processedCount++;
              break;

            case "twitter":
            case "linkedin":
            case "instagram":
            case "facebook":
              const socialResult = await executeSocialMedia(currentNode, context);
              context.results[currentNodeId] = socialResult;
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

  // SSRF Protection: Validate URL before making request
  const urlValidation = isUrlSafe(url);
  if (!urlValidation.safe) {
    console.error(`Webhook URL blocked (SSRF protection): ${url} - ${urlValidation.reason}`);
    return { 
      success: false, 
      error: `URL not allowed: ${urlValidation.reason}` 
    };
  }

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EXTERNAL_REQUEST_TIMEOUT_MS);

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
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check response size
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
      return {
        success: false,
        error: `Response too large: ${contentLength} bytes exceeds maximum of ${MAX_RESPONSE_SIZE} bytes`,
      };
    }

    const responseText = await response.text();
    
    // Validate response size
    if (responseText.length > MAX_RESPONSE_SIZE) {
      return {
        success: false,
        error: `Response too large: ${responseText.length} bytes exceeds maximum of ${MAX_RESPONSE_SIZE} bytes`,
      };
    }

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
    
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: `Request timeout after ${EXTERNAL_REQUEST_TIMEOUT_MS / 1000} seconds`,
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Webhook failed",
    };
  }
}

async function executeDelay(
  node: WorkflowNode,
  _context: ExecutionContext
): Promise<unknown> {
  const delay = node.data.delay || 5;
  console.log(`Executing delay: ${delay} seconds`);

  await new Promise((resolve) => setTimeout(resolve, delay * 1000));

  return {
    success: true,
    delayedFor: delay,
    completedAt: new Date().toISOString(),
  };
}

async function executeLoop(
  node: WorkflowNode,
  context: ExecutionContext,
  _nodes: WorkflowNode[],
  _edges: WorkflowEdge[],
  _adjacency: Map<string, WorkflowEdge[]>,
  _visited: Set<string>
): Promise<unknown> {
  const { iterations = 3, collection } = node.data;
  console.log(`Executing loop: ${iterations} iterations`);

  const results: unknown[] = [];
  let items: unknown[] = [];

  // If collection is specified, try to get it from context
  if (collection && collection in context.variables) {
    const collectionValue = context.variables[collection];
    if (Array.isArray(collectionValue)) {
      items = collectionValue;
    }
  }

  const loopCount = items.length > 0 ? items.length : iterations;

  for (let i = 0; i < loopCount; i++) {
    const iterationResult = {
      index: i,
      item: items[i] || null,
      timestamp: new Date().toISOString(),
    };
    results.push(iterationResult);

    // Store current iteration in context
    context.variables["_loopIndex"] = i;
    context.variables["_loopItem"] = items[i] || null;
  }

  return {
    success: true,
    iterations: loopCount,
    results,
  };
}

// Sanitize value for text context (email body, plain text)
function sanitizeForText(value: string | number): string {
  const str = String(value);
  // Remove potentially dangerous HTML/script tags for text contexts
  // This prevents HTML injection if email is rendered as HTML
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Sanitize value for JSON context (HTTP request bodies)
function sanitizeForJson(value: string | number): string {
  const str = String(value);
  // Escape special JSON characters to prevent JSON injection
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

// Validate variable value to ensure it's safe for substitution
function isValidVariableValue(value: unknown): value is string | number {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return false;
  }
  // Limit length to prevent DoS via very long strings
  if (typeof value === 'string' && value.length > 10000) {
    return false;
  }
  return true;
}

async function executeEmail(
  node: WorkflowNode,
  context: ExecutionContext
): Promise<unknown> {
  const { to, subject, body } = node.data;
  console.log(`Executing email: to=${to}, subject=${subject}`);

  if (!to) {
    return { success: false, error: "No recipient configured" };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return { success: false, error: "Invalid email address format" };
  }

  // Replace variables in subject and body with sanitization for HTML/text context
  let processedSubject = subject || "Workflow Notification";
  let processedBody = body || "This is an automated notification from your workflow.";

  // Secure variable replacement with validation and sanitization
  for (const [key, value] of Object.entries(context.variables)) {
    const placeholder = `{{${key}}}`;
    if (isValidVariableValue(value)) {
      // Sanitize for text/HTML context to prevent injection
      const sanitizedValue = sanitizeForText(value);
      processedSubject = processedSubject.replace(new RegExp(placeholder, "g"), sanitizedValue);
      processedBody = processedBody.replace(new RegExp(placeholder, "g"), sanitizedValue);
    }
  }

  // Note: Actual email sending would require Resend or similar service
  // For now, we log and return success to demonstrate the flow
  console.log(`Would send email to: ${to}`);
  console.log(`Subject: ${processedSubject}`);
  console.log(`Body: ${processedBody}`);

  return {
    success: true,
    to,
    subject: processedSubject,
    body: processedBody,
    sentAt: new Date().toISOString(),
    note: "Email simulation - configure Resend for actual sending",
  };
}

function executeTransform(
  node: WorkflowNode,
  context: ExecutionContext
): unknown {
  const { transform, inputVar, outputVar } = node.data;
  console.log(`Executing transform: ${transform}`);

  if (!transform) {
    return { success: false, error: "No transform expression configured" };
  }

  try {
    // Get input data
    let inputData: unknown = context.variables;
    if (inputVar && inputVar in context.variables) {
      inputData = context.variables[inputVar];
    }

    // Simple transforms (safe evaluation)
    let result: unknown;
    const transformLower = transform.toLowerCase().trim();

    if (transformLower === "uppercase" && typeof inputData === "string") {
      result = inputData.toUpperCase();
    } else if (transformLower === "lowercase" && typeof inputData === "string") {
      result = inputData.toLowerCase();
    } else if (transformLower === "length" && (typeof inputData === "string" || Array.isArray(inputData))) {
      result = inputData.length;
    } else if (transformLower === "json" || transformLower === "stringify") {
      result = JSON.stringify(inputData);
    } else if (transformLower === "parse" && typeof inputData === "string") {
      result = JSON.parse(inputData);
    } else if (transformLower === "keys" && typeof inputData === "object" && inputData !== null) {
      result = Object.keys(inputData as object);
    } else if (transformLower === "values" && typeof inputData === "object" && inputData !== null) {
      result = Object.values(inputData as object);
    } else if (transformLower.startsWith("get:") && typeof inputData === "object" && inputData !== null) {
      const key = transform.slice(4).trim();
      result = (inputData as Record<string, unknown>)[key];
    } else {
      // For complex transforms, we just pass through with a note
      result = inputData;
      console.log(`Complex transform not evaluated: ${transform}`);
    }

    // Store result in output variable
    if (outputVar) {
      context.variables[outputVar] = result;
    }

    return {
      success: true,
      input: inputData,
      output: result,
      transform,
    };
  } catch (error) {
    console.error(`Transform error: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Transform failed",
    };
  }
}

async function executeHTTP(
  node: WorkflowNode,
  context: ExecutionContext
): Promise<unknown> {
  const { method = "GET", url, headers, body } = node.data;
  console.log(`Executing HTTP request: ${method} ${url}`);

  if (!url) {
    return { success: false, error: "No URL configured" };
  }

  // SSRF Protection: Validate URL before making request
  const urlValidation = isUrlSafe(url);
  if (!urlValidation.safe) {
    console.error(`HTTP URL blocked (SSRF protection): ${url} - ${urlValidation.reason}`);
    return { 
      success: false, 
      error: `URL not allowed: ${urlValidation.reason}` 
    };
  }

  try {
    // Parse headers if provided
    let parsedHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (headers) {
      try {
        const customHeaders = JSON.parse(headers);
        parsedHeaders = { ...parsedHeaders, ...customHeaders };
      } catch {
        console.warn("Failed to parse headers JSON, using defaults");
      }
    }

    // Prepare request body
    let requestBody: string | undefined;
    if (body && ["POST", "PUT", "PATCH"].includes(method)) {
      // Replace variables in body with JSON-safe sanitization
      let processedBody = body;
      
      // Check if body appears to be JSON (for context-aware sanitization)
      const isJsonBody = body.trim().startsWith('{') || body.trim().startsWith('[');
      
      for (const [key, value] of Object.entries(context.variables)) {
        const placeholder = `{{${key}}}`;
        if (isValidVariableValue(value)) {
          // Use JSON sanitization for JSON bodies, otherwise plain text
          const sanitizedValue = isJsonBody ? sanitizeForJson(value) : String(value);
          processedBody = processedBody.replace(new RegExp(placeholder, "g"), sanitizedValue);
        }
      }
      requestBody = processedBody;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EXTERNAL_REQUEST_TIMEOUT_MS);

    const fetchOptions: RequestInit = {
      method,
      headers: parsedHeaders,
      signal: controller.signal,
    };

    if (requestBody) {
      fetchOptions.body = requestBody;
    }

    const response = await fetch(url, fetchOptions);
    
    clearTimeout(timeoutId);

    // Check response size
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
      return {
        success: false,
        error: `Response too large: ${contentLength} bytes exceeds maximum of ${MAX_RESPONSE_SIZE} bytes`,
      };
    }

    const responseText = await response.text();
    
    // Validate response size
    if (responseText.length > MAX_RESPONSE_SIZE) {
      return {
        success: false,
        error: `Response too large: ${responseText.length} bytes exceeds maximum of ${MAX_RESPONSE_SIZE} bytes`,
      };
    }

    let responseData: unknown;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    console.log(`HTTP response: ${response.status}`);

    // Store response in context for use by subsequent nodes
    const outputVarName = `http_${node.id.replace(/[^a-zA-Z0-9]/g, "_")}`;
    context.variables[outputVarName] = responseData;

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      outputVar: outputVarName,
    };
  } catch (error) {
    console.error(`HTTP request error: ${error}`);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: `Request timeout after ${EXTERNAL_REQUEST_TIMEOUT_MS / 1000} seconds`,
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "HTTP request failed",
    };
  }
}

async function executeSocialMedia(
  node: WorkflowNode,
  context: ExecutionContext
): Promise<unknown> {
  const platform = node.type as 'twitter' | 'linkedin' | 'instagram' | 'facebook';
  const { content, hashtags, mediaUrl, scheduledAt, webhookUrl, label } = node.data;
  
  console.log(`Executing social media post: ${platform} - ${label}`);

  if (!webhookUrl) {
    return { 
      success: false, 
      error: "No n8n webhook URL configured. Please set up an n8n webhook to handle social media posting." 
    };
  }

  // SSRF Protection: Validate webhook URL
  const urlValidation = isUrlSafe(webhookUrl);
  if (!urlValidation.safe) {
    console.error(`Social media webhook URL blocked (SSRF protection): ${webhookUrl} - ${urlValidation.reason}`);
    return { 
      success: false, 
      error: `URL not allowed: ${urlValidation.reason}` 
    };
  }

  // Process content with variable substitution
  let processedContent = content || '';
  let processedHashtags = hashtags || '';
  
  for (const [key, value] of Object.entries(context.variables)) {
    const placeholder = `{{${key}}}`;
    if (isValidVariableValue(value)) {
      const sanitizedValue = sanitizeForText(value);
      processedContent = processedContent.replace(new RegExp(placeholder, "g"), sanitizedValue);
      processedHashtags = processedHashtags.replace(new RegExp(placeholder, "g"), sanitizedValue);
    }
  }

  // Build the full post content with hashtags
  const fullContent = processedHashtags 
    ? `${processedContent}\n\n${processedHashtags}`.trim()
    : processedContent;

  // Platform-specific character limits
  const characterLimits: Record<string, number> = {
    twitter: 280,
    linkedin: 3000,
    instagram: 2200,
    facebook: 63206,
  };

  const limit = characterLimits[platform] || 3000;
  if (fullContent.length > limit) {
    console.warn(`Content exceeds ${platform} character limit: ${fullContent.length}/${limit}`);
  }

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EXTERNAL_REQUEST_TIMEOUT_MS);

    // Build payload for n8n webhook
    const payload = {
      platform,
      action: 'post',
      content: processedContent,
      hashtags: processedHashtags,
      fullContent,
      mediaUrl: mediaUrl || null,
      scheduledAt: scheduledAt || null,
      isScheduled: Boolean(scheduledAt),
      // Workflow context
      workflowId: context.workflowId,
      runId: context.runId,
      nodeId: node.id,
      nodeLabel: label,
      // Additional context data
      variables: context.variables,
      timestamp: new Date().toISOString(),
    };

    console.log(`Sending to n8n webhook: ${webhookUrl}`);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check response size
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
      return {
        success: false,
        error: `Response too large: ${contentLength} bytes exceeds maximum of ${MAX_RESPONSE_SIZE} bytes`,
      };
    }

    const responseText = await response.text();
    
    // Validate response size
    if (responseText.length > MAX_RESPONSE_SIZE) {
      return {
        success: false,
        error: `Response too large: ${responseText.length} bytes exceeds maximum of ${MAX_RESPONSE_SIZE} bytes`,
      };
    }

    let responseData: unknown;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    console.log(`Social media webhook response: ${response.status}`);

    // Store result in context
    const outputVarName = `social_${platform}_${node.id.replace(/[^a-zA-Z0-9]/g, "_")}`;
    context.variables[outputVarName] = responseData;

    return {
      success: response.ok,
      platform,
      status: response.status,
      contentLength: fullContent.length,
      characterLimit: limit,
      isScheduled: Boolean(scheduledAt),
      scheduledAt: scheduledAt || null,
      data: responseData,
      outputVar: outputVarName,
    };
  } catch (error) {
    console.error(`Social media post error: ${error}`);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        platform,
        error: `Request timeout after ${EXTERNAL_REQUEST_TIMEOUT_MS / 1000} seconds`,
      };
    }
    
    return {
      success: false,
      platform,
      error: error instanceof Error ? error.message : "Social media post failed",
    };
  }
}
