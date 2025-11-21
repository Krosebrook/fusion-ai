import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const defaultTemplates = [
  {
    name: "React Production",
    description: "Optimized React app with testing, linting, and automated deployment",
    project_type: "react",
    icon: "Code",
    color: "#61DAFB",
    is_default: true,
    configuration: {
      build_command: "npm run build",
      test_command: "npm test -- --coverage",
      deploy_command: "npm run deploy",
      triggers: {
        push: true,
        pullRequest: true,
        manual: true,
        schedule: false
      },
      quality_gates: {
        enabled: true,
        min_coverage: 80,
        max_critical_issues: 0,
        max_high_issues: 5,
        tools: ["eslint", "snyk"]
      },
      auto_scale: true,
      notifications: true
    }
  },
  {
    name: "Node.js API",
    description: "Backend API with security scanning and automated testing",
    project_type: "node",
    icon: "Server",
    color: "#339933",
    is_default: true,
    configuration: {
      build_command: "npm install",
      test_command: "npm test",
      deploy_command: "npm start",
      triggers: {
        push: true,
        pullRequest: true,
        manual: true,
        schedule: false
      },
      quality_gates: {
        enabled: true,
        min_coverage: 70,
        max_critical_issues: 0,
        max_high_issues: 3,
        tools: ["eslint", "snyk"]
      },
      auto_scale: true,
      notifications: true
    }
  },
  {
    name: "Python ML Pipeline",
    description: "Python with testing, linting, and model validation",
    project_type: "python",
    icon: "Package",
    color: "#3776AB",
    is_default: true,
    configuration: {
      build_command: "pip install -r requirements.txt",
      test_command: "pytest --cov",
      deploy_command: "python deploy.py",
      triggers: {
        push: true,
        pullRequest: true,
        manual: true,
        schedule: true
      },
      quality_gates: {
        enabled: true,
        min_coverage: 75,
        max_critical_issues: 0,
        max_high_issues: 5,
        tools: ["snyk"]
      },
      auto_scale: false,
      notifications: true
    }
  },
  {
    name: "Next.js Full-Stack",
    description: "Next.js with SSR, API routes, and optimized builds",
    project_type: "nextjs",
    icon: "Zap",
    color: "#000000",
    is_default: true,
    configuration: {
      build_command: "npm run build",
      test_command: "npm test",
      deploy_command: "npm run start",
      triggers: {
        push: true,
        pullRequest: true,
        manual: true,
        schedule: false
      },
      quality_gates: {
        enabled: true,
        min_coverage: 80,
        max_critical_issues: 0,
        max_high_issues: 5,
        tools: ["eslint", "snyk", "prettier"]
      },
      auto_scale: true,
      notifications: true
    }
  },
  {
    name: "Docker Containerized",
    description: "Multi-stage Docker builds with security scanning",
    project_type: "docker",
    icon: "Box",
    color: "#2496ED",
    is_default: true,
    configuration: {
      build_command: "docker build -t app .",
      test_command: "docker run app npm test",
      deploy_command: "docker push app",
      triggers: {
        push: true,
        pullRequest: true,
        manual: true,
        schedule: false
      },
      quality_gates: {
        enabled: true,
        min_coverage: 70,
        max_critical_issues: 0,
        max_high_issues: 3,
        tools: ["snyk"]
      },
      auto_scale: true,
      notifications: true
    }
  },
  {
    name: "Vue.js Progressive",
    description: "Vue 3 with composition API and optimized builds",
    project_type: "vue",
    icon: "Code",
    color: "#42B883",
    is_default: true,
    configuration: {
      build_command: "npm run build",
      test_command: "npm run test:unit",
      deploy_command: "npm run deploy",
      triggers: {
        push: true,
        pullRequest: true,
        manual: true,
        schedule: false
      },
      quality_gates: {
        enabled: true,
        min_coverage: 75,
        max_critical_issues: 0,
        max_high_issues: 5,
        tools: ["eslint", "snyk"]
      },
      auto_scale: true,
      notifications: true
    }
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if templates already exist
    const existing = await base44.asServiceRole.entities.PipelineTemplate.filter({
      is_default: true
    });

    if (existing.length > 0) {
      return Response.json({ 
        message: 'Templates already seeded',
        count: existing.length 
      });
    }

    // Create default templates
    const created = [];
    for (const template of defaultTemplates) {
      const result = await base44.asServiceRole.entities.PipelineTemplate.create(template);
      created.push(result);
    }

    return Response.json({
      success: true,
      message: `Created ${created.length} default templates`,
      templates: created
    });

  } catch (error) {
    console.error('Seed templates error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});