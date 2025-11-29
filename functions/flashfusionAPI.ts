import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * FlashFusion Public API
 * Endpoints for prompt templates, execution, agents, and analytics
 */

Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const path = url.searchParams.get('path') || '';
    const method = req.method;

    // Verify authentication
    let user;
    try {
      user = await base44.auth.me();
    } catch {
      return Response.json({ 
        error: 'Unauthorized', 
        message: 'Valid API key or authentication required' 
      }, { status: 401, headers: corsHeaders });
    }

    let body = {};
    if (method === 'POST' || method === 'PUT') {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    // Route handling
    const routes = {
      // ============ PROMPT TEMPLATES ============
      'GET:/templates': async () => {
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const category = url.searchParams.get('category');
        const templates = category 
          ? await base44.entities.PromptTemplate.filter({ category }, '-created_date', limit)
          : await base44.entities.PromptTemplate.list('-created_date', limit);
        return { templates, count: templates.length };
      },

      'GET:/templates/:id': async () => {
        const id = path.split('/')[2];
        const templates = await base44.entities.PromptTemplate.filter({ id });
        if (!templates.length) throw { status: 404, message: 'Template not found' };
        return { template: templates[0] };
      },

      'POST:/templates': async () => {
        const template = await base44.entities.PromptTemplate.create({
          name: body.name,
          description: body.description,
          category: body.category || 'custom',
          template: body.template,
          variables: body.variables || [],
          llm_settings: body.llm_settings || { temperature: 0.7, max_tokens: 1000 },
          chain_of_thought: body.chain_of_thought,
          context_injection: body.context_injection,
          tags: body.tags || []
        });
        return { template, message: 'Template created successfully' };
      },

      'PUT:/templates/:id': async () => {
        const id = path.split('/')[2];
        await base44.entities.PromptTemplate.update(id, body);
        return { message: 'Template updated successfully' };
      },

      'DELETE:/templates/:id': async () => {
        const id = path.split('/')[2];
        await base44.entities.PromptTemplate.delete(id);
        return { message: 'Template deleted successfully' };
      },

      // ============ PROMPT EXECUTION ============
      'POST:/execute': async () => {
        const { template_id, variables, options } = body;
        
        // Get template
        const templates = await base44.entities.PromptTemplate.filter({ id: template_id });
        if (!templates.length) throw { status: 404, message: 'Template not found' };
        const template = templates[0];

        // Compile prompt
        let compiledPrompt = template.template;
        if (variables) {
          Object.entries(variables).forEach(([key, value]) => {
            compiledPrompt = compiledPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
          });
        }

        // Execute via LLM
        const startTime = Date.now();
        const llmSettings = { ...template.llm_settings, ...options?.llm_settings };
        
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: compiledPrompt,
          response_json_schema: template.output_schema || options?.response_schema
        });

        const latency = Date.now() - startTime;

        // Log execution
        await base44.entities.PromptExecutionLog.create({
          prompt_template_id: template_id,
          execution_type: 'single',
          status: 'success',
          input_data: variables,
          compiled_prompt: compiledPrompt,
          output_data: typeof response === 'string' ? { result: response } : response,
          latency_ms: latency,
          llm_settings: llmSettings
        });

        // Update template stats
        await base44.entities.PromptTemplate.update(template_id, {
          usage_count: (template.usage_count || 0) + 1,
          last_executed_at: new Date().toISOString()
        });

        return {
          result: response,
          metadata: {
            template_id,
            latency_ms: latency,
            compiled_prompt: options?.include_prompt ? compiledPrompt : undefined
          }
        };
      },

      'POST:/execute/batch': async () => {
        const { executions } = body; // Array of { template_id, variables }
        const results = [];

        for (const exec of executions) {
          try {
            const result = await routes['POST:/execute']();
            results.push({ success: true, ...result });
          } catch (error) {
            results.push({ success: false, error: error.message });
          }
        }

        return { results, total: executions.length, successful: results.filter(r => r.success).length };
      },

      // ============ PROMPT CHAINS ============
      'GET:/chains': async () => {
        const chains = await base44.entities.PromptChain.list('-created_date', 50);
        return { chains, count: chains.length };
      },

      'POST:/chains': async () => {
        const chain = await base44.entities.PromptChain.create(body);
        return { chain, message: 'Chain created successfully' };
      },

      'POST:/chains/:id/execute': async () => {
        const id = path.split('/')[2];
        const chains = await base44.entities.PromptChain.filter({ id });
        if (!chains.length) throw { status: 404, message: 'Chain not found' };
        
        const chain = chains[0];
        const { variables } = body;
        const executionLog = [];
        let context = { ...variables };

        // Execute nodes in order based on edges
        for (const node of chain.nodes || []) {
          if (node.type === 'prompt') {
            const startTime = Date.now();
            let prompt = node.config?.inline_prompt || '';
            
            // Replace variables
            Object.entries(context).forEach(([key, value]) => {
              prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
            });

            const response = await base44.integrations.Core.InvokeLLM({ prompt });
            
            if (node.output_variable) {
              context[node.output_variable] = response;
            }

            executionLog.push({
              node_id: node.id,
              node_name: node.name,
              status: 'success',
              latency_ms: Date.now() - startTime,
              output: response
            });
          }
        }

        return {
          result: context,
          execution_log: executionLog,
          nodes_executed: executionLog.length
        };
      },

      // ============ EXPERIMENTS ============
      'GET:/experiments': async () => {
        const status = url.searchParams.get('status');
        const experiments = status
          ? await base44.entities.PromptExperiment.filter({ status })
          : await base44.entities.PromptExperiment.list('-created_date', 50);
        return { experiments, count: experiments.length };
      },

      'POST:/experiments': async () => {
        const experiment = await base44.entities.PromptExperiment.create(body);
        return { experiment, message: 'Experiment created successfully' };
      },

      'PUT:/experiments/:id/status': async () => {
        const id = path.split('/')[2];
        const { status } = body;
        await base44.entities.PromptExperiment.update(id, { status });
        return { message: `Experiment ${status}` };
      },

      // ============ VERSIONS ============
      'GET:/templates/:id/versions': async () => {
        const templateId = path.split('/')[2];
        const versions = await base44.entities.PromptTemplateVersion.filter(
          { prompt_template_id: templateId },
          '-created_date',
          50
        );
        return { versions, count: versions.length };
      },

      'POST:/templates/:id/versions': async () => {
        const templateId = path.split('/')[2];
        const templates = await base44.entities.PromptTemplate.filter({ id: templateId });
        if (!templates.length) throw { status: 404, message: 'Template not found' };

        const version = await base44.entities.PromptTemplateVersion.create({
          prompt_template_id: templateId,
          version_number: body.version_number,
          version_tag: body.version_tag || 'draft',
          template_snapshot: templates[0],
          commit_message: body.commit_message
        });

        return { version, message: 'Version created successfully' };
      },

      // ============ ANALYTICS ============
      'GET:/analytics/overview': async () => {
        const logs = await base44.entities.PromptExecutionLog.list('-created_date', 1000);
        
        const totalExecutions = logs.length;
        const successfulExecutions = logs.filter(l => l.status === 'success').length;
        const avgLatency = logs.reduce((sum, l) => sum + (l.latency_ms || 0), 0) / (logs.length || 1);
        const totalCost = logs.reduce((sum, l) => sum + (l.cost_usd || 0), 0);

        return {
          total_executions: totalExecutions,
          success_rate: totalExecutions ? (successfulExecutions / totalExecutions * 100).toFixed(2) : 0,
          avg_latency_ms: Math.round(avgLatency),
          total_cost_usd: totalCost.toFixed(4),
          executions_by_type: {
            single: logs.filter(l => l.execution_type === 'single').length,
            chain: logs.filter(l => l.execution_type === 'chain').length,
            experiment: logs.filter(l => l.execution_type === 'experiment').length
          }
        };
      },

      'GET:/analytics/templates': async () => {
        const templates = await base44.entities.PromptTemplate.list('-usage_count', 20);
        return {
          top_templates: templates.map(t => ({
            id: t.id,
            name: t.name,
            category: t.category,
            usage_count: t.usage_count || 0,
            avg_latency_ms: t.avg_latency_ms,
            success_rate: t.success_rate
          }))
        };
      },

      'GET:/analytics/logs': async () => {
        const limit = parseInt(url.searchParams.get('limit') || '100');
        const status = url.searchParams.get('status');
        const logs = status
          ? await base44.entities.PromptExecutionLog.filter({ status }, '-created_date', limit)
          : await base44.entities.PromptExecutionLog.list('-created_date', limit);
        return { logs, count: logs.length };
      },

      // ============ AGENTS ============
      'GET:/agents': async () => {
        const workflows = await base44.entities.AgentWorkflow.list('-created_date', 50);
        const collaborations = await base44.entities.AgentCollaboration.list('-created_date', 20);
        
        return {
          workflows: workflows.map(w => ({
            id: w.id,
            name: w.name,
            trigger: w.trigger,
            agents: w.agents,
            active: w.active,
            execution_count: w.execution_count
          })),
          active_collaborations: collaborations.filter(c => c.status === 'running').length,
          total_workflows: workflows.length
        };
      },

      'POST:/agents/workflows': async () => {
        const workflow = await base44.entities.AgentWorkflow.create(body);
        return { workflow, message: 'Workflow created successfully' };
      },

      'POST:/agents/workflows/:id/trigger': async () => {
        const id = path.split('/')[2];
        const workflows = await base44.entities.AgentWorkflow.filter({ id });
        if (!workflows.length) throw { status: 404, message: 'Workflow not found' };

        const collaboration = await base44.entities.AgentCollaboration.create({
          workflow_id: id,
          workflow_name: workflows[0].name,
          status: 'pending',
          trigger: 'api',
          trigger_data: body.data || {},
          steps: workflows[0].steps?.map(s => ({ ...s, status: 'pending' })) || []
        });

        return { collaboration_id: collaboration.id, message: 'Workflow triggered' };
      },

      'GET:/agents/collaborations/:id': async () => {
        const id = path.split('/')[2];
        const collaborations = await base44.entities.AgentCollaboration.filter({ id });
        if (!collaborations.length) throw { status: 404, message: 'Collaboration not found' };
        return { collaboration: collaborations[0] };
      }
    };

    // Match route
    const routeKey = `${method}:/${path.split('/').slice(1, 3).join('/')}`;
    const exactKey = `${method}:/${path.split('/').slice(1).join('/')}`;
    
    // Try exact match first, then parameterized
    let handler = routes[exactKey];
    if (!handler) {
      // Try parameterized routes
      const paramRoutes = Object.keys(routes).filter(k => k.includes(':'));
      for (const route of paramRoutes) {
        const [rMethod, rPath] = route.split(':');
        if (rMethod !== method) continue;
        
        const routeParts = rPath.split('/');
        const pathParts = ('/' + path.split('/').slice(1).join('/')).split('/');
        
        if (routeParts.length !== pathParts.length) continue;
        
        let match = true;
        for (let i = 0; i < routeParts.length; i++) {
          if (routeParts[i].startsWith(':')) continue;
          if (routeParts[i] !== pathParts[i]) {
            match = false;
            break;
          }
        }
        
        if (match) {
          handler = routes[route];
          break;
        }
      }
    }

    if (!handler) {
      return Response.json({
        error: 'Not Found',
        message: `Endpoint ${method} /${path} not found`,
        available_endpoints: [
          'GET /templates',
          'GET /templates/:id',
          'POST /templates',
          'PUT /templates/:id',
          'DELETE /templates/:id',
          'POST /execute',
          'POST /execute/batch',
          'GET /chains',
          'POST /chains',
          'POST /chains/:id/execute',
          'GET /experiments',
          'POST /experiments',
          'PUT /experiments/:id/status',
          'GET /templates/:id/versions',
          'POST /templates/:id/versions',
          'GET /analytics/overview',
          'GET /analytics/templates',
          'GET /analytics/logs',
          'GET /agents',
          'POST /agents/workflows',
          'POST /agents/workflows/:id/trigger',
          'GET /agents/collaborations/:id'
        ]
      }, { status: 404, headers: corsHeaders });
    }

    const result = await handler();
    return Response.json(result, { status: 200, headers: corsHeaders });

  } catch (error) {
    const status = error.status || 500;
    return Response.json({
      error: error.message || 'Internal Server Error',
      code: error.code
    }, { status, headers: corsHeaders });
  }
});