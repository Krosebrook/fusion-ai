import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Track analytics events
 * Usage: POST /trackEvent with { event_name, event_type, properties }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    const { event_name, event_type, properties, page_url } = await req.json();

    if (!event_name || !event_type) {
      return Response.json({ error: 'event_name and event_type are required' }, { status: 400 });
    }

    const event = await base44.entities.Event.create({
      event_name,
      event_type,
      user_id: user?.id,
      page_url: page_url || req.headers.get('referer'),
      properties: properties || {},
      timestamp: new Date().toISOString()
    });

    return Response.json({ success: true, event_id: event.id });

  } catch (error) {
    console.error('Event tracking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});