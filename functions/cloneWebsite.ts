import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Clone a website using AI-powered code generation
 * Integrates with Firecrawl for crawling, Anthropic for generation, Vercel for deployment
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url, name, framework, styling, deploy } = await req.json();

    if (!url || !name) {
      return Response.json({ error: 'URL and name are required' }, { status: 400 });
    }

    // Create initial record
    const project = await base44.entities.ClonedWebsite.create({
      source_url: url,
      name,
      status: 'crawling',
      framework: framework || 'react',
      styling: styling || 'tailwind',
      created_by: user.email,
    });

    try {
      // Step 1: Crawl website with Firecrawl
      const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
      if (!firecrawlKey) {
        throw new Error('FIRECRAWL_API_KEY not configured');
      }

      const crawlResponse = await fetch('https://api.firecrawl.dev/v0/crawl', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          maxDepth: 1,
          includeImages: true,
          includeStyles: true,
        }),
      });

      if (!crawlResponse.ok) {
        throw new Error(`Firecrawl error: ${crawlResponse.statusText}`);
      }

      const crawlData = await crawlResponse.json();
      const pages = crawlData.pages || [];

      // Update status
      await base44.entities.ClonedWebsite.update(project.id, {
        status: 'generating',
        pages_crawled: pages.length,
      });

      // Step 2: Generate code with Anthropic
      const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
      if (!anthropicKey) {
        throw new Error('ANTHROPIC_API_KEY not configured');
      }

      const prompt = buildPrompt(pages, framework, styling);

      const generateResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 8000,
          temperature: 0.7,
          messages: [{
            role: 'user',
            content: prompt,
          }],
        }),
      });

      if (!generateResponse.ok) {
        throw new Error(`Anthropic error: ${generateResponse.statusText}`);
      }

      const generateData = await generateResponse.json();
      const generatedCode = generateData.content[0].text;

      // Parse generated code
      const projectData = parseGeneratedCode(generatedCode);

      // Update with generated files
      await base44.entities.ClonedWebsite.update(project.id, {
        status: deploy ? 'deploying' : 'completed',
        files_generated: projectData.files?.length || 0,
        project_data: projectData,
      });

      // Step 3: Deploy to Vercel (if requested)
      let deploymentUrl = null;
      let deploymentId = null;

      if (deploy) {
        const vercelToken = Deno.env.get('VERCEL_TOKEN');
        if (!vercelToken) {
          throw new Error('VERCEL_TOKEN not configured');
        }

        const files = (projectData.files || []).map(file => ({
          file: file.path,
          data: btoa(file.content),
        }));

        const deployResponse = await fetch('https://api.vercel.com/v13/deployments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${vercelToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
            files,
            projectSettings: {
              framework,
            },
            target: 'production',
          }),
        });

        if (!deployResponse.ok) {
          throw new Error(`Vercel error: ${deployResponse.statusText}`);
        }

        const deployData = await deployResponse.json();
        deploymentUrl = deployData.url;
        deploymentId = deployData.id;
      }

      // Final update
      await base44.entities.ClonedWebsite.update(project.id, {
        status: 'completed',
        deployment_url: deploymentUrl,
        deployment_id: deploymentId,
      });

      return Response.json({
        success: true,
        project_id: project.id,
        deployment_url: deploymentUrl,
        pages_crawled: pages.length,
        files_generated: projectData.files?.length || 0,
      });

    } catch (error) {
      // Update with error
      await base44.entities.ClonedWebsite.update(project.id, {
        status: 'failed',
        error_message: error.message,
      });

      throw error;
    }

  } catch (error) {
    console.error('Clone error:', error);
    return Response.json(
      { 
        error: error.message || 'Clone failed',
        details: error.stack,
      },
      { status: 500 }
    );
  }
});

function buildPrompt(pages, framework, styling) {
  const pagesSummary = pages.slice(0, 3).map((page, i) => {
    return `Page ${i + 1}: ${page.url}\nTitle: ${page.title}\nContent: ${page.text?.substring(0, 1000) || ''}...`;
  }).join('\n\n');

  return `You are an expert web developer. Generate a complete ${framework} application with ${styling} styling that clones this website.

${pagesSummary}

Requirements:
- Use ${framework} with modern best practices
- Style with ${styling} (NO inline styles)
- Make it responsive and accessible
- Include all necessary files (components, pages, config)
- Use TypeScript if framework supports it

Output ONLY valid JSON in this exact format:
{
  "files": [
    {
      "path": "src/App.tsx",
      "content": "import React from 'react';\\n\\nexport default function App() {\\n  return <div>Hello</div>;\\n}"
    },
    {
      "path": "src/components/Header.tsx",
      "content": "..."
    }
  ],
  "dependencies": {
    "react": "^18.2.0"
  }
}

Generate a production-ready codebase now:`;
}

function parseGeneratedCode(code) {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = code.match(/```json\n([\s\S]*?)\n```/) || code.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : code;
    
    const parsed = JSON.parse(jsonStr);
    return parsed;
  } catch (error) {
    console.error('Parse error:', error);
    return {
      files: [{
        path: 'error.txt',
        content: `Failed to parse generated code: ${error.message}\n\nRaw output:\n${code}`,
      }],
      dependencies: {},
    };
  }
}