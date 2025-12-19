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

  salesforce: {
    name: 'Salesforce',
    icon: '☁️',
    color: 'from-blue-600 to-sky-700',
    authType: 'oauth2',
    oauth: {
      authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
      tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
      scopes: ['api', 'refresh_token'],
    },
    actions: [
      {
        id: 'create_lead',
        name: 'Create Lead',
        endpoint: '{{SALESFORCE_INSTANCE_URL}}/services/data/v58.0/sobjects/Lead',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer {{SALESFORCE_ACCESS_TOKEN}}',
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          FirstName: '{{first_name}}',
          LastName: '{{last_name}}',
          Company: '{{company}}',
          Email: '{{email}}',
        },
        requiredFields: ['last_name', 'company'],
      },
      {
        id: 'create_opportunity',
        name: 'Create Opportunity',
        endpoint: '{{SALESFORCE_INSTANCE_URL}}/services/data/v58.0/sobjects/Opportunity',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer {{SALESFORCE_ACCESS_TOKEN}}',
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          Name: '{{opportunity_name}}',
          StageName: '{{stage}}',
          CloseDate: '{{close_date}}',
          Amount: '{{amount}}',
        },
        requiredFields: ['opportunity_name', 'stage', 'close_date'],
      },
      {
        id: 'query_records',
        name: 'Query Records (SOQL)',
        endpoint: '{{SALESFORCE_INSTANCE_URL}}/services/data/v58.0/query',
        method: 'GET',
        queryParams: {
          q: '{{soql_query}}',
        },
        headers: {
          'Authorization': 'Bearer {{SALESFORCE_ACCESS_TOKEN}}',
        },
        requiredFields: ['soql_query'],
      },
    ],
  },

  hubspot: {
    name: 'HubSpot',
    icon: '🎯',
    color: 'from-orange-600 to-red-700',
    authType: 'oauth2',
    oauth: {
      authUrl: 'https://app.hubspot.com/oauth/authorize',
      tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
      scopes: ['contacts', 'crm.objects.contacts.write'],
    },
    actions: [
      {
        id: 'create_contact',
        name: 'Create Contact',
        endpoint: 'https://api.hubapi.com/crm/v3/objects/contacts',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer {{HUBSPOT_ACCESS_TOKEN}}',
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          properties: {
            firstname: '{{first_name}}',
            lastname: '{{last_name}}',
            email: '{{email}}',
            company: '{{company}}',
          },
        },
        requiredFields: ['email'],
      },
      {
        id: 'create_deal',
        name: 'Create Deal',
        endpoint: 'https://api.hubapi.com/crm/v3/objects/deals',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer {{HUBSPOT_ACCESS_TOKEN}}',
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          properties: {
            dealname: '{{deal_name}}',
            amount: '{{amount}}',
            dealstage: '{{stage}}',
            pipeline: '{{pipeline}}',
          },
        },
        requiredFields: ['deal_name', 'dealstage'],
      },
      {
        id: 'search_contacts',
        name: 'Search Contacts',
        endpoint: 'https://api.hubapi.com/crm/v3/objects/contacts/search',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer {{HUBSPOT_ACCESS_TOKEN}}',
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'EQ',
                  value: '{{search_email}}',
                },
              ],
            },
          ],
        },
        requiredFields: ['search_email'],
      },
    ],
  },

  jira: {
    name: 'Jira',
    icon: '🎫',
    color: 'from-blue-700 to-indigo-800',
    authType: 'oauth2',
    oauth: {
      authUrl: 'https://auth.atlassian.com/authorize',
      tokenUrl: 'https://auth.atlassian.com/oauth/token',
      scopes: ['read:jira-work', 'write:jira-work'],
    },
    actions: [
      {
        id: 'create_issue',
        name: 'Create Issue',
        endpoint: '{{JIRA_SITE_URL}}/rest/api/3/issue',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer {{JIRA_ACCESS_TOKEN}}',
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          fields: {
            project: { key: '{{project_key}}' },
            summary: '{{summary}}',
            description: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: '{{description}}' }],
                },
              ],
            },
            issuetype: { name: '{{issue_type}}' },
          },
        },
        requiredFields: ['project_key', 'summary', 'issue_type'],
      },
      {
        id: 'update_issue',
        name: 'Update Issue',
        endpoint: '{{JIRA_SITE_URL}}/rest/api/3/issue/{{issue_key}}',
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer {{JIRA_ACCESS_TOKEN}}',
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          fields: {},
        },
        requiredFields: ['issue_key'],
      },
      {
        id: 'search_issues',
        name: 'Search Issues (JQL)',
        endpoint: '{{JIRA_SITE_URL}}/rest/api/3/search',
        method: 'GET',
        queryParams: {
          jql: '{{jql_query}}',
          maxResults: 50,
        },
        headers: {
          'Authorization': 'Bearer {{JIRA_ACCESS_TOKEN}}',
        },
        requiredFields: ['jql_query'],
      },
    ],
  },

  github: {
    name: 'GitHub',
    icon: '🐙',
    color: 'from-gray-800 to-slate-900',
    authType: 'oauth2',
    oauth: {
      authUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      scopes: ['repo', 'user'],
    },
    actions: [
      {
        id: 'create_issue',
        name: 'Create Issue',
        endpoint: 'https://api.github.com/repos/{{owner}}/{{repo}}/issues',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer {{GITHUB_ACCESS_TOKEN}}',
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        bodyTemplate: {
          title: '{{title}}',
          body: '{{body}}',
          labels: [],
        },
        requiredFields: ['owner', 'repo', 'title'],
      },
      {
        id: 'create_pull_request',
        name: 'Create Pull Request',
        endpoint: 'https://api.github.com/repos/{{owner}}/{{repo}}/pulls',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer {{GITHUB_ACCESS_TOKEN}}',
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        bodyTemplate: {
          title: '{{title}}',
          body: '{{body}}',
          head: '{{head_branch}}',
          base: '{{base_branch}}',
        },
        requiredFields: ['owner', 'repo', 'title', 'head_branch', 'base_branch'],
      },
      {
        id: 'get_repository',
        name: 'Get Repository',
        endpoint: 'https://api.github.com/repos/{{owner}}/{{repo}}',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer {{GITHUB_ACCESS_TOKEN}}',
          'Accept': 'application/vnd.github+json',
        },
        requiredFields: ['owner', 'repo'],
      },
      {
        id: 'list_commits',
        name: 'List Commits',
        endpoint: 'https://api.github.com/repos/{{owner}}/{{repo}}/commits',
        method: 'GET',
        queryParams: {
          per_page: 30,
        },
        headers: {
          'Authorization': 'Bearer {{GITHUB_ACCESS_TOKEN}}',
          'Accept': 'application/vnd.github+json',
        },
        requiredFields: ['owner', 'repo'],
      },
    ],
  },

  stripe: {
    name: 'Stripe',
    icon: '💳',
    color: 'from-purple-600 to-indigo-700',
    actions: [
      {
        id: 'create_customer',
        name: 'Create Customer',
        endpoint: 'https://api.stripe.com/v1/customers',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer {{STRIPE_SECRET_KEY}}',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        bodyTemplate: {
          email: '{{email}}',
          name: '{{name}}',
        },
        requiredFields: ['email'],
      },
      {
        id: 'create_payment_intent',
        name: 'Create Payment Intent',
        endpoint: 'https://api.stripe.com/v1/payment_intents',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer {{STRIPE_SECRET_KEY}}',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        bodyTemplate: {
          amount: '{{amount}}',
          currency: '{{currency}}',
          customer: '{{customer_id}}',
        },
        requiredFields: ['amount', 'currency'],
      },
    ],
  },

  twilio: {
    name: 'Twilio',
    icon: '📱',
    color: 'from-red-600 to-rose-700',
    actions: [
      {
        id: 'send_sms',
        name: 'Send SMS',
        endpoint: 'https://api.twilio.com/2010-04-01/Accounts/{{TWILIO_ACCOUNT_SID}}/Messages.json',
        method: 'POST',
        headers: {
          'Authorization': 'Basic {{TWILIO_AUTH_TOKEN}}',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        bodyTemplate: {
          To: '{{to_number}}',
          From: '{{from_number}}',
          Body: '{{message}}',
        },
        requiredFields: ['to_number', 'from_number', 'message'],
      },
    ],
  },

  sendgrid: {
    name: 'SendGrid',
    icon: '📧',
    color: 'from-blue-500 to-cyan-600',
    actions: [
      {
        id: 'send_email',
        name: 'Send Email',
        endpoint: 'https://api.sendgrid.com/v3/mail/send',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer {{SENDGRID_API_KEY}}',
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          personalizations: [
            {
              to: [{ email: '{{to_email}}' }],
              subject: '{{subject}}',
            },
          ],
          from: { email: '{{from_email}}' },
          content: [
            {
              type: 'text/html',
              value: '{{html_content}}',
            },
          ],
        },
        requiredFields: ['to_email', 'from_email', 'subject', 'html_content'],
      },
    ],
  },
};

export default apiConnectorTemplates;