import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Real-Time Security Monitoring
 * Tracks security events and triggers alerts for critical incidents
 */

const ALERT_CHANNELS = {
  email: async (recipients, subject, body, base44) => {
    for (const recipient of recipients) {
      await base44.integrations.Core.SendEmail({
        to: recipient,
        subject,
        body
      });
    }
  },
  
  slack: async (webhookUrl, message) => {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,
        blocks: [{
          type: 'section',
          text: { type: 'mrkdwn', text: message }
        }]
      })
    });
  },
  
  discord: async (webhookUrl, message) => {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message })
    });
  },
  
  pagerduty: async (integrationKey, summary, severity) => {
    await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        routing_key: integrationKey,
        event_action: 'trigger',
        payload: {
          summary,
          severity,
          source: 'FlashFusion Security Monitor',
          timestamp: new Date().toISOString()
        }
      })
    });
  }
};

const INCIDENT_TYPES = {
  CRITICAL_VULNERABILITY: {
    severity: 'critical',
    threshold: 1,
    message: 'Critical vulnerability detected requiring immediate attention'
  },
  FAILED_AUTH_ATTEMPTS: {
    severity: 'high',
    threshold: 10,
    message: 'Multiple failed authentication attempts detected'
  },
  UNUSUAL_API_ACTIVITY: {
    severity: 'medium',
    threshold: 100,
    message: 'Unusual API request pattern detected'
  },
  SECRETS_EXPOSED: {
    severity: 'critical',
    threshold: 1,
    message: 'Potential secrets exposure in code or logs'
  },
  PRIVILEGE_ESCALATION: {
    severity: 'critical',
    threshold: 1,
    message: 'Unauthorized privilege escalation attempt'
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { eventType, eventData, forceAlert } = await req.json();
    
    // Validate event type
    if (!INCIDENT_TYPES[eventType]) {
      return Response.json({ error: 'Invalid event type' }, { status: 400 });
    }
    
    const incident = INCIDENT_TYPES[eventType];
    
    // Check if threshold met (for non-forced alerts)
    const recentEvents = await base44.entities.AuditLog.filter({
      action: eventType,
      timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000).toISOString() } // Last hour
    });
    
    const shouldAlert = forceAlert || recentEvents.length >= incident.threshold;
    
    if (!shouldAlert) {
      return Response.json({
        alerted: false,
        message: 'Event logged but threshold not met',
        currentCount: recentEvents.length,
        threshold: incident.threshold
      });
    }
    
    // Create security event record
    const securityEvent = await base44.asServiceRole.entities.Event.create({
      type: 'security_incident',
      severity: incident.severity,
      title: eventType.replace(/_/g, ' ').toLowerCase(),
      description: incident.message,
      metadata: {
        eventType,
        eventData,
        recentEventCount: recentEvents.length,
        detectedAt: new Date().toISOString(),
        detectedBy: user.email
      },
      status: 'open',
      timestamp: new Date().toISOString()
    });
    
    // Get admin users for alerts
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    const adminEmails = admins.map(a => a.email);
    
    // Prepare alert message
    const alertSubject = `🚨 [${incident.severity.toUpperCase()}] Security Alert: ${eventType}`;
    const alertBody = `
Security Incident Detected

Type: ${eventType}
Severity: ${incident.severity}
Time: ${new Date().toISOString()}
Detected By: ${user.email}

Details:
${incident.message}

Event Data:
${JSON.stringify(eventData, null, 2)}

Recent Event Count: ${recentEvents.length} in last hour

Action Required:
1. Review incident details: ${process.env.APP_URL || 'https://app.flashfusion.ai'}/security/incidents/${securityEvent.id}
2. Investigate root cause
3. Implement mitigation measures
4. Update incident status when resolved

This is an automated alert from FlashFusion Security Monitor.
`;
    
    // Send alerts through configured channels
    const alertResults = [];
    
    // Email alerts (always enabled)
    try {
      await ALERT_CHANNELS.email(adminEmails, alertSubject, alertBody, base44);
      alertResults.push({ channel: 'email', status: 'sent', recipients: adminEmails.length });
    } catch (emailError) {
      alertResults.push({ channel: 'email', status: 'failed', error: emailError.message });
    }
    
    // Slack alerts (if webhook configured)
    const slackWebhook = Deno.env.get('SLACK_SECURITY_WEBHOOK');
    if (slackWebhook) {
      try {
        await ALERT_CHANNELS.slack(slackWebhook, alertBody);
        alertResults.push({ channel: 'slack', status: 'sent' });
      } catch (slackError) {
        alertResults.push({ channel: 'slack', status: 'failed', error: slackError.message });
      }
    }
    
    // Discord alerts (if webhook configured)
    const discordWebhook = Deno.env.get('DISCORD_SECURITY_WEBHOOK');
    if (discordWebhook) {
      try {
        await ALERT_CHANNELS.discord(discordWebhook, alertBody);
        alertResults.push({ channel: 'discord', status: 'sent' });
      } catch (discordError) {
        alertResults.push({ channel: 'discord', status: 'failed', error: discordError.message });
      }
    }
    
    // PagerDuty alerts (for critical incidents only)
    const pagerdutyKey = Deno.env.get('PAGERDUTY_INTEGRATION_KEY');
    if (pagerdutyKey && incident.severity === 'critical') {
      try {
        await ALERT_CHANNELS.pagerduty(pagerdutyKey, alertSubject, incident.severity);
        alertResults.push({ channel: 'pagerduty', status: 'triggered' });
      } catch (pdError) {
        alertResults.push({ channel: 'pagerduty', status: 'failed', error: pdError.message });
      }
    }
    
    // Update security event with alert results
    await base44.asServiceRole.entities.Event.update(securityEvent.id, {
      metadata: {
        ...securityEvent.metadata,
        alertsSent: alertResults,
        alertedAt: new Date().toISOString()
      }
    });
    
    return Response.json({
      alerted: true,
      incidentId: securityEvent.id,
      severity: incident.severity,
      eventType,
      alertResults,
      message: 'Security incident detected and alerts sent'
    });
    
  } catch (error) {
    console.error('Security monitoring failed:', error);
    return Response.json({ 
      error: 'Security monitoring failed', 
      details: error.message 
    }, { status: 500 });
  }
});