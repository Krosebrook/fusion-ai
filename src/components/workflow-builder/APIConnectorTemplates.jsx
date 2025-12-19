/**
 * Pre-built API Connector Templates
 * Common integrations for Slack, Google Sheets, and REST APIs
 */

export const apiConnectorTemplates = {
  slack: {
    name: 'Slack',
    icon: '💬',
    color: 'from-purple-500 to-pink-600',
    actions: [
      {
        id: 'send_message',
        name: 'Send Message',
        endpoint: 'https://slack.com/api/chat.postMessage',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer {{SLACK_BOT_TOKEN}}',
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          channel: '{{channel}}',
          text: '{{message}}',
          blocks: [],
        },
        requiredFields: ['channel', 'message'],
        outputMapping: {
          ok: 'success',
          ts: 'message_timestamp',
        },
      },
      {
        id: 'create_channel',
        name: 'Create Channel',
        endpoint: 'https://slack.com/api/conversations.create',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer {{SLACK_BOT_TOKEN}}',
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          name: '{{channel_name}}',
          is_private: false,
        },
        requiredFields: ['channel_name'],
      },
    ],
  },
  
  googleSheets: {
    name: 'Google Sheets',
    icon: '📊',
    color: 'from-green-500 to-teal-600',
    actions: [
      {
        id: 'append_row',
        name: 'Append Row',
        endpoint: 'https://sheets.googleapis.com/v4/spreadsheets/{{spreadsheet_id}}/values/{{range}}:append',
        method: 'POST',
        queryParams: {
          valueInputOption: 'USER_ENTERED',
        },
        headers: {
          'Authorization': 'Bearer {{GOOGLE_ACCESS_TOKEN}}',
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          values: [['{{value1}}', '{{value2}}', '{{value3}}']],
        },
        requiredFields: ['spreadsheet_id', 'range', 'values'],
      },
      {
        id: 'read_range',
        name: 'Read Range',
        endpoint: 'https://sheets.googleapis.com/v4/spreadsheets/{{spreadsheet_id}}/values/{{range}}',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer {{GOOGLE_ACCESS_TOKEN}}',
        },
        requiredFields: ['spreadsheet_id', 'range'],
        outputMapping: {
          values: 'rows',
        },
      },
    ],
  },

  webhook: {
    name: 'Webhook',
    icon: '🔔',
    color: 'from-blue-500 to-cyan-600',
    actions: [
      {
        id: 'post_webhook',
        name: 'POST Webhook',
        endpoint: '{{webhook_url}}',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          data: '{{payload}}',
        },
        requiredFields: ['webhook_url', 'payload'],
      },
    ],
  },

  rest_api: {
    name: 'REST API',
    icon: '🔌',
    color: 'from-orange-500 to-red-600',
    actions: [
      {
        id: 'custom_get',
        name: 'GET Request',
        endpoint: '{{api_url}}',
        method: 'GET',
        headers: {},
        requiredFields: ['api_url'],
      },
      {
        id: 'custom_post',
        name: 'POST Request',
        endpoint: '{{api_url}}',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        bodyTemplate: {},
        requiredFields: ['api_url'],
      },
      {
        id: 'custom_put',
        name: 'PUT Request',
        endpoint: '{{api_url}}',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        bodyTemplate: {},
        requiredFields: ['api_url'],
      },
      {
        id: 'custom_delete',
        name: 'DELETE Request',
        endpoint: '{{api_url}}',
        method: 'DELETE',
        headers: {},
        requiredFields: ['api_url'],
      },
    ],
  },

  airtable: {
    name: 'Airtable',
    icon: '🗂️',
    color: 'from-yellow-500 to-amber-600',
    actions: [
      {
        id: 'create_record',
        name: 'Create Record',
        endpoint: 'https://api.airtable.com/v0/{{base_id}}/{{table_name}}',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer {{AIRTABLE_API_KEY}}',
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          fields: {},
        },
        requiredFields: ['base_id', 'table_name', 'fields'],
      },
    ],
  },

  notion: {
    name: 'Notion',
    icon: '📝',
    color: 'from-gray-500 to-slate-600',
    actions: [
      {
        id: 'create_page',
        name: 'Create Page',
        endpoint: 'https://api.notion.com/v1/pages',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer {{NOTION_API_KEY}}',
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          parent: { database_id: '{{database_id}}' },
          properties: {},
        },
        requiredFields: ['database_id', 'properties'],
      },
    ],
  },
};

export default apiConnectorTemplates;