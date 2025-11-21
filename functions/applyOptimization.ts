import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { optimization_id } = await req.json();

    // Fetch the optimization
    const optimizations = await base44.asServiceRole.entities.PipelineOptimization.filter({
      id: optimization_id
    });

    if (!optimizations || optimizations.length === 0) {
      return Response.json({ error: 'Optimization not found' }, { status: 404 });
    }

    const optimization = optimizations[0];

    // Fetch the pipeline config
    const configs = await base44.asServiceRole.entities.PipelineConfig.filter({
      id: optimization.pipeline_config_id
    });

    if (!configs || configs.length === 0) {
      return Response.json({ error: 'Pipeline not found' }, { status: 404 });
    }

    const config = configs[0];

    // Apply optimization based on type
    let updatedConfig = { ...config };
    const codeChanges = optimization.code_changes || {};

    switch (optimization.optimization_type) {
      case 'parallelization':
        // Enable parallel job execution
        updatedConfig.workflow_file = applyParallelization(config.workflow_file, codeChanges);
        break;

      case 'caching':
        // Add caching layers
        updatedConfig.workflow_file = applyCaching(config.workflow_file, codeChanges);
        break;

      case 'resource_allocation':
        // Optimize resource allocation
        updatedConfig.workflow_file = applyResourceOptimization(config.workflow_file, codeChanges);
        break;

      case 'build_optimization':
        // Update build commands
        if (codeChanges.build_command) {
          updatedConfig.build_command = codeChanges.build_command;
        }
        if (codeChanges.test_command) {
          updatedConfig.test_command = codeChanges.test_command;
        }
        break;

      case 'dependency_optimization':
        // Optimize dependency installation
        updatedConfig.workflow_file = applyDependencyOptimization(config.workflow_file, codeChanges);
        break;
    }

    // Update the pipeline config
    await base44.asServiceRole.entities.PipelineConfig.update(
      config.id,
      updatedConfig
    );

    // Mark optimization as applied
    await base44.asServiceRole.entities.PipelineOptimization.update(
      optimization_id,
      {
        status: 'applied',
        applied_at: new Date().toISOString()
      }
    );

    // Create notification
    await base44.asServiceRole.entities.PipelineNotification.create({
      user_email: user.email,
      type: 'optimization_available',
      title: 'Optimization Applied Successfully',
      message: `"${optimization.title}" has been applied to your pipeline`,
      pipeline_config_id: config.id,
      link: `/cicd-automation`
    });

    return Response.json({
      success: true,
      message: 'Optimization applied successfully',
      updated_config: updatedConfig
    });

  } catch (error) {
    console.error('Apply optimization error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function applyParallelization(workflowFile, changes) {
  if (!workflowFile) return workflowFile;
  
  // Add matrix strategy for parallel execution
  const matrixStrategy = `
    strategy:
      matrix:
        node-version: [18.x, 20.x]
      max-parallel: 2`;
  
  return workflowFile.replace(
    /jobs:\n  build-and-deploy:/,
    `jobs:\n  build-and-deploy:${matrixStrategy}`
  );
}

function applyCaching(workflowFile, changes) {
  if (!workflowFile) return workflowFile;
  
  // Add dependency caching
  const cacheStep = `
            - name: Cache dependencies
              uses: actions/cache@v3
              with:
                path: ~/.npm
                key: \${{ runner.os }}-node-\${{ hashFiles('**/package-lock.json') }}
                restore-keys: |
                  \${{ runner.os }}-node-
            `;
  
  return workflowFile.replace(
    /- name: Install dependencies/,
    `${cacheStep}\n            - name: Install dependencies`
  );
}

function applyResourceOptimization(workflowFile, changes) {
  if (!workflowFile) return workflowFile;
  
  // Optimize runner resources
  return workflowFile.replace(
    /runs-on: ubuntu-latest/,
    'runs-on: ubuntu-latest\n      timeout-minutes: 30'
  );
}

function applyDependencyOptimization(workflowFile, changes) {
  if (!workflowFile) return workflowFile;
  
  // Use npm ci for faster, reliable installs
  return workflowFile.replace(
    /npm install/g,
    'npm ci --prefer-offline'
  );
}