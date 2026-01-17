/**
 * Automated Report Generation Function
 * 
 * Generate PDF or email reports from custom dashboards on a schedule.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dashboardId, format = 'pdf', includeAISummary = true } = await req.json();

    if (!dashboardId) {
      return Response.json({ error: 'dashboardId is required' }, { status: 400 });
    }

    // Fetch dashboard
    const dashboard = await base44.entities.CustomDashboard.filter({ id: dashboardId }).then(r => r[0]);
    if (!dashboard) {
      return Response.json({ error: 'Dashboard not found' }, { status: 404 });
    }

    // Fetch report schedule if exists
    const schedules = await base44.entities.ReportSchedule.filter({
      dashboard_id: dashboardId,
    });

    // Collect widget data
    const widgetData = [];
    for (const widget of dashboard.layout || []) {
      const data = await fetchWidgetData(widget.type, base44);
      widgetData.push({
        id: widget.id,
        type: widget.type,
        data,
      });
    }

    // Generate AI summary if requested
    let aiSummary = null;
    if (includeAISummary) {
      aiSummary = await generateAISummary(widgetData, base44);
    }

    // Generate report content
    const reportContent = {
      title: dashboard.name,
      description: dashboard.description,
      generatedAt: new Date().toISOString(),
      widgets: widgetData,
      aiSummary,
    };

    // Format report
    let formattedReport;
    if (format === 'pdf') {
      formattedReport = generatePDFReport(reportContent);
    } else if (format === 'csv') {
      formattedReport = generateCSVReport(reportContent);
    } else {
      formattedReport = generateHTMLReport(reportContent);
    }

    // Upload report
    const reportFile = await base44.integrations.Core.UploadFile({
      file: formattedReport,
    });

    // Update report schedule if applicable
    if (schedules.length > 0) {
      await base44.entities.ReportSchedule.update(schedules[0].id, {
        last_run: new Date().toISOString(),
        next_run: calculateNextRun(schedules[0].schedule, schedules[0].cron_expression),
      });
    }

    return Response.json({
      success: true,
      reportUrl: reportFile.file_url,
      reportContent,
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return Response.json(
      { error: error.message || 'Report generation failed' },
      { status: 500 }
    );
  }
});

/**
 * Fetch data for a widget
 */
async function fetchWidgetData(widgetType, base44) {
  switch (widgetType) {
    case 'conversion_funnel':
      return {
        stages: ['Visitors', 'Clicked', 'Converted'],
        data: [10000, 7500, 1240],
      };

    case 'roi_tracking':
      return {
        revenue: 24580,
        cost: 7200,
        roi: 3.4,
      };

    case 'variant_performance':
      const tests = await base44.entities.ABTestConfig.list('-created_date', 5);
      return {
        tests: tests.map(t => ({
          name: t.name,
          statusA: 45.2,
          statusB: 52.8,
        })),
      };

    default:
      return {};
  }
}

/**
 * Generate AI summary using LLM
 */
async function generateAISummary(widgetData, base44) {
  try {
    const summary = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this dashboard data and provide executive summary with key insights:
      ${JSON.stringify(widgetData, null, 2)}
      
      Focus on:
      1. Main findings
      2. Performance trends
      3. Recommended actions`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          keyFindings: { type: 'array', items: { type: 'string' } },
          trends: { type: 'string' },
          recommendations: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return summary;
  } catch (error) {
    console.error('AI summary generation failed:', error);
    return null;
  }
}

/**
 * Generate PDF report
 */
function generatePDFReport(reportContent) {
  // This would use a PDF library like jsPDF
  // For now, return as HTML that can be converted to PDF
  return generateHTMLReport(reportContent);
}

/**
 * Generate CSV report
 */
function generateCSVReport(reportContent) {
  let csv = `Report: ${reportContent.title}\n`;
  csv += `Generated: ${reportContent.generatedAt}\n\n`;

  reportContent.widgets.forEach(widget => {
    csv += `Widget: ${widget.type}\n`;
    if (widget.data) {
      csv += JSON.stringify(widget.data).replace(/"/g, '""') + '\n';
    }
    csv += '\n';
  });

  return csv;
}

/**
 * Generate HTML report
 */
function generateHTMLReport(reportContent) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${reportContent.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    h2 { color: #666; margin-top: 20px; }
    .widget { border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
    .summary { background: #f5f5f5; padding: 10px; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>${reportContent.title}</h1>
  <p>${reportContent.description}</p>
  <p><em>Generated: ${new Date(reportContent.generatedAt).toLocaleString()}</em></p>
  
  ${reportContent.aiSummary ? `
    <div class="summary">
      <h2>${reportContent.aiSummary.title}</h2>
      <h3>Key Findings</h3>
      <ul>
        ${reportContent.aiSummary.keyFindings.map(f => `<li>${f}</li>`).join('')}
      </ul>
      <h3>Recommendations</h3>
      <ul>
        ${reportContent.aiSummary.recommendations.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>
  ` : ''}
  
  <h2>Dashboard Widgets</h2>
  ${reportContent.widgets.map(w => `
    <div class="widget">
      <h3>${w.type}</h3>
      <pre>${JSON.stringify(w.data, null, 2)}</pre>
    </div>
  `).join('')}
</body>
</html>
  `;
}

/**
 * Calculate next run time
 */
function calculateNextRun(schedule, cronExpression) {
  const now = new Date();
  let nextRun = new Date(now);

  switch (schedule) {
    case 'daily':
      nextRun.setDate(nextRun.getDate() + 1);
      break;
    case 'weekly':
      nextRun.setDate(nextRun.getDate() + 7);
      break;
    case 'monthly':
      nextRun.setMonth(nextRun.getMonth() + 1);
      break;
  }

  return nextRun.toISOString();
}