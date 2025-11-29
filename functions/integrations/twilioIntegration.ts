import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Twilio Integration - Communications
 * SMS, Voice, WhatsApp, Verify, Conversations
 */

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const auth = btoa(`${accountSid}:${authToken}`);

    const twilioFetch = async (endpoint, options = {}) => {
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          ...options.headers
        }
      });
      return response.json();
    };

    const toForm = (obj) => new URLSearchParams(Object.entries(obj).filter(([_, v]) => v !== undefined)).toString();

    const actions = {
      // SMS
      sendSms: async ({ to, from, body, mediaUrl }) => 
        twilioFetch('/Messages.json', { method: 'POST', body: toForm({ To: to, From: from, Body: body, MediaUrl: mediaUrl }) }),
      listMessages: async ({ to, from, limit = 20 }) => 
        twilioFetch(`/Messages.json?PageSize=${limit}${to ? `&To=${to}` : ''}${from ? `&From=${from}` : ''}`),
      getMessage: async ({ messageSid }) => 
        twilioFetch(`/Messages/${messageSid}.json`),

      // Voice
      makeCall: async ({ to, from, url, twiml }) => 
        twilioFetch('/Calls.json', { method: 'POST', body: toForm({ To: to, From: from, Url: url, Twiml: twiml }) }),
      listCalls: async ({ limit = 20 }) => 
        twilioFetch(`/Calls.json?PageSize=${limit}`),
      getCall: async ({ callSid }) => 
        twilioFetch(`/Calls/${callSid}.json`),
      updateCall: async ({ callSid, status, url }) => 
        twilioFetch(`/Calls/${callSid}.json`, { method: 'POST', body: toForm({ Status: status, Url: url }) }),

      // WhatsApp
      sendWhatsApp: async ({ to, from, body, mediaUrl }) => 
        twilioFetch('/Messages.json', { method: 'POST', body: toForm({ To: `whatsapp:${to}`, From: `whatsapp:${from}`, Body: body, MediaUrl: mediaUrl }) }),

      // Phone Numbers
      listPhoneNumbers: async () => 
        twilioFetch('/IncomingPhoneNumbers.json'),
      buyPhoneNumber: async ({ phoneNumber, areaCode }) => 
        twilioFetch('/IncomingPhoneNumbers.json', { method: 'POST', body: toForm({ PhoneNumber: phoneNumber, AreaCode: areaCode }) }),
      searchAvailableNumbers: async ({ country = 'US', areaCode, contains }) => {
        let url = `/AvailablePhoneNumbers/${country}/Local.json?`;
        if (areaCode) url += `AreaCode=${areaCode}&`;
        if (contains) url += `Contains=${contains}&`;
        return twilioFetch(url);
      },

      // Verify
      startVerification: async ({ to, channel = 'sms' }) => {
        const verifySid = Deno.env.get('TWILIO_VERIFY_SID');
        const response = await fetch(`https://verify.twilio.com/v2/Services/${verifySid}/Verifications`, {
          method: 'POST',
          headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: toForm({ To: to, Channel: channel })
        });
        return response.json();
      },
      checkVerification: async ({ to, code }) => {
        const verifySid = Deno.env.get('TWILIO_VERIFY_SID');
        const response = await fetch(`https://verify.twilio.com/v2/Services/${verifySid}/VerificationCheck`, {
          method: 'POST',
          headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: toForm({ To: to, Code: code })
        });
        return response.json();
      },

      // Conversations
      createConversation: async ({ friendlyName }) => {
        const response = await fetch('https://conversations.twilio.com/v1/Conversations', {
          method: 'POST',
          headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: toForm({ FriendlyName: friendlyName })
        });
        return response.json();
      },
      addParticipant: async ({ conversationSid, identity, address }) => {
        const response = await fetch(`https://conversations.twilio.com/v1/Conversations/${conversationSid}/Participants`, {
          method: 'POST',
          headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: toForm({ Identity: identity, 'MessagingBinding.Address': address })
        });
        return response.json();
      },
      sendConversationMessage: async ({ conversationSid, author, body }) => {
        const response = await fetch(`https://conversations.twilio.com/v1/Conversations/${conversationSid}/Messages`, {
          method: 'POST',
          headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: toForm({ Author: author, Body: body })
        });
        return response.json();
      },

      // Account
      getAccountInfo: async () => twilioFetch('.json')
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