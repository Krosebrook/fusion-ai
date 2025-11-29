import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * SendGrid Integration - Email Delivery
 * Mail Send, Templates, Contacts, Lists, Stats
 */

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });

    const { action, data } = await req.json();
    const sendgridKey = Deno.env.get('SENDGRID_API_KEY');

    const sgFetch = async (endpoint, options = {}) => {
      const response = await fetch(`https://api.sendgrid.com/v3${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${sendgridKey}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      if (response.status === 204) return { success: true };
      return response.json();
    };

    const actions = {
      // Mail Send
      sendEmail: async ({ to, from, subject, text, html, templateId, dynamicTemplateData, attachments, categories }) => {
        const personalizations = [{ to: Array.isArray(to) ? to.map(e => ({ email: e })) : [{ email: to }] }];
        if (dynamicTemplateData) personalizations[0].dynamic_template_data = dynamicTemplateData;
        
        const body = {
          personalizations,
          from: typeof from === 'string' ? { email: from } : from,
          subject
        };
        if (templateId) body.template_id = templateId;
        if (text) body.content = [{ type: 'text/plain', value: text }];
        if (html) body.content = [...(body.content || []), { type: 'text/html', value: html }];
        if (attachments) body.attachments = attachments;
        if (categories) body.categories = categories;
        
        return sgFetch('/mail/send', { method: 'POST', body: JSON.stringify(body) });
      },

      sendBulkEmail: async ({ personalizations, from, subject, content, templateId }) => 
        sgFetch('/mail/send', { method: 'POST', body: JSON.stringify({ personalizations, from, subject, content, template_id: templateId }) }),

      // Templates
      listTemplates: async ({ generations = 'dynamic', pageSize = 50 }) => 
        sgFetch(`/templates?generations=${generations}&page_size=${pageSize}`),
      getTemplate: async ({ templateId }) => 
        sgFetch(`/templates/${templateId}`),
      createTemplate: async ({ name, generation = 'dynamic' }) => 
        sgFetch('/templates', { method: 'POST', body: JSON.stringify({ name, generation }) }),
      deleteTemplate: async ({ templateId }) => 
        sgFetch(`/templates/${templateId}`, { method: 'DELETE' }),
      createTemplateVersion: async ({ templateId, name, subject, htmlContent, plainContent, active = 1 }) => 
        sgFetch(`/templates/${templateId}/versions`, { method: 'POST', body: JSON.stringify({ name, subject, html_content: htmlContent, plain_content: plainContent, active }) }),

      // Contacts
      addContacts: async ({ contacts, listIds }) => 
        sgFetch('/marketing/contacts', { method: 'PUT', body: JSON.stringify({ contacts, list_ids: listIds }) }),
      searchContacts: async ({ query }) => 
        sgFetch('/marketing/contacts/search', { method: 'POST', body: JSON.stringify({ query }) }),
      getContact: async ({ contactId }) => 
        sgFetch(`/marketing/contacts/${contactId}`),
      deleteContacts: async ({ ids }) => 
        sgFetch(`/marketing/contacts?ids=${ids.join(',')}`, { method: 'DELETE' }),
      getContactCount: async () => 
        sgFetch('/marketing/contacts/count'),

      // Lists
      listLists: async ({ pageSize = 50 }) => 
        sgFetch(`/marketing/lists?page_size=${pageSize}`),
      createList: async ({ name }) => 
        sgFetch('/marketing/lists', { method: 'POST', body: JSON.stringify({ name }) }),
      deleteList: async ({ listId }) => 
        sgFetch(`/marketing/lists/${listId}`, { method: 'DELETE' }),
      addContactsToList: async ({ listId, contactIds }) => 
        sgFetch(`/marketing/lists/${listId}/contacts`, { method: 'POST', body: JSON.stringify({ contact_ids: contactIds }) }),
      removeContactsFromList: async ({ listId, contactIds }) => 
        sgFetch(`/marketing/lists/${listId}/contacts?contact_ids=${contactIds.join(',')}`, { method: 'DELETE' }),

      // Stats
      getGlobalStats: async ({ startDate, endDate, aggregatedBy = 'day' }) => 
        sgFetch(`/stats?start_date=${startDate}&end_date=${endDate}&aggregated_by=${aggregatedBy}`),
      getCategoryStats: async ({ startDate, endDate, categories }) => 
        sgFetch(`/categories/stats?start_date=${startDate}&end_date=${endDate}&categories=${categories.join(',')}`),

      // Suppressions
      listBounces: async ({ startTime, endTime }) => 
        sgFetch(`/suppression/bounces?start_time=${startTime}&end_time=${endTime}`),
      listUnsubscribes: async ({ startTime, endTime }) => 
        sgFetch(`/suppression/unsubscribes?start_time=${startTime}&end_time=${endTime}`),
      addToUnsubscribeGroup: async ({ groupId, emails }) => 
        sgFetch(`/asm/groups/${groupId}/suppressions`, { method: 'POST', body: JSON.stringify({ recipient_emails: emails }) }),

      // Sender Verification
      listSenders: async () => 
        sgFetch('/verified_senders'),
      verifySender: async ({ nickname, fromEmail, fromName, replyTo, address, city, country }) => 
        sgFetch('/verified_senders', { method: 'POST', body: JSON.stringify({ nickname, from_email: fromEmail, from_name: fromName, reply_to: replyTo, address, city, country }) }),

      // Webhooks
      getEventWebhookSettings: async () => 
        sgFetch('/user/webhooks/event/settings'),
      updateEventWebhookSettings: async ({ enabled, url, events }) => 
        sgFetch('/user/webhooks/event/settings', { method: 'PATCH', body: JSON.stringify({ enabled, url, ...events }) })
    };

    if (!actions[action]) {
      return Response.json({ error: 'Unknown action', available: Object.keys(actions) }, { status: 400, headers: corsHeaders });
    }

    const result = await actions[action](data || {});
    return Response.json(result, { headers: corsHeaders });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});