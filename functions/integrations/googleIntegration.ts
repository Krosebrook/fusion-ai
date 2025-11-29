import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Google Ecosystem Integration
 * Covers: Drive, Sheets, Docs, Calendar, Gmail, Cloud Storage, BigQuery, Analytics
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
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const { action, data, service } = await req.json();
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    const googleAccessToken = Deno.env.get('GOOGLE_ACCESS_TOKEN');

    const googleFetch = async (url, options = {}) => {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      return response.json();
    };

    const services = {
      // ============ GOOGLE DRIVE ============
      drive: {
        listFiles: async ({ query, pageSize = 100, pageToken, orderBy }) => {
          const params = new URLSearchParams();
          if (query) params.append('q', query);
          params.append('pageSize', pageSize.toString());
          if (pageToken) params.append('pageToken', pageToken);
          if (orderBy) params.append('orderBy', orderBy);
          params.append('fields', 'files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink)');
          return googleFetch(`https://www.googleapis.com/drive/v3/files?${params}`);
        },

        getFile: async ({ fileId, fields }) => {
          const params = fields ? `?fields=${fields}` : '';
          return googleFetch(`https://www.googleapis.com/drive/v3/files/${fileId}${params}`);
        },

        createFile: async ({ name, mimeType, parents, content }) => {
          const metadata = { name, mimeType, parents };
          return googleFetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            body: JSON.stringify(metadata)
          });
        },

        updateFile: async ({ fileId, name, description }) => {
          return googleFetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
            method: 'PATCH',
            body: JSON.stringify({ name, description })
          });
        },

        deleteFile: async ({ fileId }) => {
          return googleFetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, { method: 'DELETE' });
        },

        createFolder: async ({ name, parents }) => {
          return googleFetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            body: JSON.stringify({
              name,
              mimeType: 'application/vnd.google-apps.folder',
              parents
            })
          });
        },

        shareFile: async ({ fileId, email, role = 'reader', type = 'user' }) => {
          return googleFetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
            method: 'POST',
            body: JSON.stringify({ role, type, emailAddress: email })
          });
        }
      },

      // ============ GOOGLE SHEETS ============
      sheets: {
        getSpreadsheet: async ({ spreadsheetId }) => {
          return googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`);
        },

        getValues: async ({ spreadsheetId, range }) => {
          return googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`);
        },

        updateValues: async ({ spreadsheetId, range, values, valueInputOption = 'USER_ENTERED' }) => {
          return googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=${valueInputOption}`, {
            method: 'PUT',
            body: JSON.stringify({ values })
          });
        },

        appendValues: async ({ spreadsheetId, range, values, valueInputOption = 'USER_ENTERED' }) => {
          return googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=${valueInputOption}`, {
            method: 'POST',
            body: JSON.stringify({ values })
          });
        },

        clearValues: async ({ spreadsheetId, range }) => {
          return googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`, {
            method: 'POST'
          });
        },

        createSpreadsheet: async ({ title, sheets }) => {
          return googleFetch('https://sheets.googleapis.com/v4/spreadsheets', {
            method: 'POST',
            body: JSON.stringify({ properties: { title }, sheets })
          });
        },

        addSheet: async ({ spreadsheetId, title }) => {
          return googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
            method: 'POST',
            body: JSON.stringify({
              requests: [{ addSheet: { properties: { title } } }]
            })
          });
        }
      },

      // ============ GOOGLE DOCS ============
      docs: {
        getDocument: async ({ documentId }) => {
          return googleFetch(`https://docs.googleapis.com/v1/documents/${documentId}`);
        },

        createDocument: async ({ title }) => {
          return googleFetch('https://docs.googleapis.com/v1/documents', {
            method: 'POST',
            body: JSON.stringify({ title })
          });
        },

        batchUpdate: async ({ documentId, requests }) => {
          return googleFetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
            method: 'POST',
            body: JSON.stringify({ requests })
          });
        },

        insertText: async ({ documentId, text, index = 1 }) => {
          return googleFetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
            method: 'POST',
            body: JSON.stringify({
              requests: [{ insertText: { location: { index }, text } }]
            })
          });
        }
      },

      // ============ GOOGLE CALENDAR ============
      calendar: {
        listCalendars: async () => {
          return googleFetch('https://www.googleapis.com/calendar/v3/users/me/calendarList');
        },

        listEvents: async ({ calendarId = 'primary', timeMin, timeMax, maxResults = 100 }) => {
          const params = new URLSearchParams();
          if (timeMin) params.append('timeMin', timeMin);
          if (timeMax) params.append('timeMax', timeMax);
          params.append('maxResults', maxResults.toString());
          params.append('singleEvents', 'true');
          params.append('orderBy', 'startTime');
          return googleFetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params}`);
        },

        getEvent: async ({ calendarId = 'primary', eventId }) => {
          return googleFetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`);
        },

        createEvent: async ({ calendarId = 'primary', summary, description, start, end, attendees, location }) => {
          return googleFetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
            method: 'POST',
            body: JSON.stringify({ summary, description, start, end, attendees, location })
          });
        },

        updateEvent: async ({ calendarId = 'primary', eventId, summary, description, start, end }) => {
          return googleFetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`, {
            method: 'PATCH',
            body: JSON.stringify({ summary, description, start, end })
          });
        },

        deleteEvent: async ({ calendarId = 'primary', eventId }) => {
          return googleFetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`, {
            method: 'DELETE'
          });
        }
      },

      // ============ GMAIL ============
      gmail: {
        listMessages: async ({ query, maxResults = 50, pageToken }) => {
          const params = new URLSearchParams();
          if (query) params.append('q', query);
          params.append('maxResults', maxResults.toString());
          if (pageToken) params.append('pageToken', pageToken);
          return googleFetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`);
        },

        getMessage: async ({ messageId, format = 'full' }) => {
          return googleFetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=${format}`);
        },

        sendMessage: async ({ to, subject, body, cc, bcc }) => {
          const message = [
            `To: ${to}`,
            cc ? `Cc: ${cc}` : '',
            bcc ? `Bcc: ${bcc}` : '',
            `Subject: ${subject}`,
            '',
            body
          ].filter(Boolean).join('\r\n');
          
          const encodedMessage = btoa(message).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
          return googleFetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            body: JSON.stringify({ raw: encodedMessage })
          });
        },

        listLabels: async () => {
          return googleFetch('https://gmail.googleapis.com/gmail/v1/users/me/labels');
        },

        modifyLabels: async ({ messageId, addLabelIds, removeLabelIds }) => {
          return googleFetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
            method: 'POST',
            body: JSON.stringify({ addLabelIds, removeLabelIds })
          });
        }
      },

      // ============ GOOGLE ANALYTICS ============
      analytics: {
        runReport: async ({ propertyId, dateRanges, metrics, dimensions }) => {
          return googleFetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
            method: 'POST',
            body: JSON.stringify({ dateRanges, metrics, dimensions })
          });
        },

        getRealtimeData: async ({ propertyId, metrics, dimensions }) => {
          return googleFetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
            method: 'POST',
            body: JSON.stringify({ metrics, dimensions })
          });
        }
      },

      // ============ CLOUD STORAGE ============
      storage: {
        listBuckets: async ({ projectId }) => {
          return googleFetch(`https://storage.googleapis.com/storage/v1/b?project=${projectId}`);
        },

        listObjects: async ({ bucket, prefix, maxResults = 1000 }) => {
          const params = new URLSearchParams();
          if (prefix) params.append('prefix', prefix);
          params.append('maxResults', maxResults.toString());
          return googleFetch(`https://storage.googleapis.com/storage/v1/b/${bucket}/o?${params}`);
        },

        getObject: async ({ bucket, object }) => {
          return googleFetch(`https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(object)}`);
        },

        deleteObject: async ({ bucket, object }) => {
          return googleFetch(`https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(object)}`, {
            method: 'DELETE'
          });
        }
      }
    };

    const serviceHandler = services[service];
    if (!serviceHandler) {
      return Response.json({ 
        error: 'Unknown service', 
        available: Object.keys(services) 
      }, { status: 400, headers: corsHeaders });
    }

    const actionHandler = serviceHandler[action];
    if (!actionHandler) {
      return Response.json({ 
        error: 'Unknown action', 
        available: Object.keys(serviceHandler) 
      }, { status: 400, headers: corsHeaders });
    }

    const result = await actionHandler(data || {});
    
    await base44.entities.IntegrationAction.create({
      integration_slug: `google-${service}`,
      action_type: 'action',
      name: action,
      input_data: data,
      output_data: result,
      status: 'success',
      executed_at: new Date().toISOString()
    });

    return Response.json(result, { headers: corsHeaders });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});