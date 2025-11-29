import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Notion Integration - Workspace & Knowledge Management
 * Full API coverage for pages, databases, blocks, users, and search
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

    const { action, data } = await req.json();
    const notionToken = Deno.env.get('NOTION_API_KEY');

    const notionFetch = async (endpoint, options = {}) => {
      const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${notionToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
          ...options.headers
        }
      });
      return response.json();
    };

    const actions = {
      // Pages
      getPage: async ({ pageId }) => {
        return notionFetch(`/pages/${pageId}`);
      },

      createPage: async ({ parentId, parentType, properties, children, icon, cover }) => {
        const parent = parentType === 'database' 
          ? { database_id: parentId }
          : { page_id: parentId };
        return notionFetch('/pages', {
          method: 'POST',
          body: JSON.stringify({ parent, properties, children, icon, cover })
        });
      },

      updatePage: async ({ pageId, properties, icon, cover, archived }) => {
        return notionFetch(`/pages/${pageId}`, {
          method: 'PATCH',
          body: JSON.stringify({ properties, icon, cover, archived })
        });
      },

      archivePage: async ({ pageId }) => {
        return notionFetch(`/pages/${pageId}`, {
          method: 'PATCH',
          body: JSON.stringify({ archived: true })
        });
      },

      getPageProperty: async ({ pageId, propertyId }) => {
        return notionFetch(`/pages/${pageId}/properties/${propertyId}`);
      },

      // Databases
      getDatabase: async ({ databaseId }) => {
        return notionFetch(`/databases/${databaseId}`);
      },

      queryDatabase: async ({ databaseId, filter, sorts, startCursor, pageSize = 100 }) => {
        return notionFetch(`/databases/${databaseId}/query`, {
          method: 'POST',
          body: JSON.stringify({ filter, sorts, start_cursor: startCursor, page_size: pageSize })
        });
      },

      createDatabase: async ({ parentPageId, title, properties, icon, cover }) => {
        return notionFetch('/databases', {
          method: 'POST',
          body: JSON.stringify({
            parent: { page_id: parentPageId },
            title: [{ type: 'text', text: { content: title } }],
            properties,
            icon,
            cover
          })
        });
      },

      updateDatabase: async ({ databaseId, title, properties, icon, cover }) => {
        const body = {};
        if (title) body.title = [{ type: 'text', text: { content: title } }];
        if (properties) body.properties = properties;
        if (icon) body.icon = icon;
        if (cover) body.cover = cover;
        return notionFetch(`/databases/${databaseId}`, {
          method: 'PATCH',
          body: JSON.stringify(body)
        });
      },

      // Blocks
      getBlock: async ({ blockId }) => {
        return notionFetch(`/blocks/${blockId}`);
      },

      getBlockChildren: async ({ blockId, startCursor, pageSize = 100 }) => {
        const params = new URLSearchParams();
        if (startCursor) params.append('start_cursor', startCursor);
        params.append('page_size', pageSize.toString());
        return notionFetch(`/blocks/${blockId}/children?${params}`);
      },

      appendBlockChildren: async ({ blockId, children }) => {
        return notionFetch(`/blocks/${blockId}/children`, {
          method: 'PATCH',
          body: JSON.stringify({ children })
        });
      },

      updateBlock: async ({ blockId, content }) => {
        return notionFetch(`/blocks/${blockId}`, {
          method: 'PATCH',
          body: JSON.stringify(content)
        });
      },

      deleteBlock: async ({ blockId }) => {
        return notionFetch(`/blocks/${blockId}`, { method: 'DELETE' });
      },

      // Users
      listUsers: async ({ startCursor, pageSize = 100 }) => {
        const params = new URLSearchParams();
        if (startCursor) params.append('start_cursor', startCursor);
        params.append('page_size', pageSize.toString());
        return notionFetch(`/users?${params}`);
      },

      getUser: async ({ userId }) => {
        return notionFetch(`/users/${userId}`);
      },

      getMe: async () => {
        return notionFetch('/users/me');
      },

      // Search
      search: async ({ query, filter, sort, startCursor, pageSize = 100 }) => {
        return notionFetch('/search', {
          method: 'POST',
          body: JSON.stringify({ 
            query, 
            filter, 
            sort,
            start_cursor: startCursor,
            page_size: pageSize 
          })
        });
      },

      // Comments
      getComments: async ({ blockId, startCursor }) => {
        const params = new URLSearchParams();
        params.append('block_id', blockId);
        if (startCursor) params.append('start_cursor', startCursor);
        return notionFetch(`/comments?${params}`);
      },

      createComment: async ({ parentId, parentType, richText }) => {
        const parent = parentType === 'page' 
          ? { page_id: parentId }
          : { discussion_id: parentId };
        return notionFetch('/comments', {
          method: 'POST',
          body: JSON.stringify({ parent, rich_text: richText })
        });
      },

      // Helper: Create common blocks
      createTextBlock: async ({ parentId, text, type = 'paragraph' }) => {
        return notionFetch(`/blocks/${parentId}/children`, {
          method: 'PATCH',
          body: JSON.stringify({
            children: [{
              object: 'block',
              type,
              [type]: {
                rich_text: [{ type: 'text', text: { content: text } }]
              }
            }]
          })
        });
      },

      createTodoBlock: async ({ parentId, text, checked = false }) => {
        return notionFetch(`/blocks/${parentId}/children`, {
          method: 'PATCH',
          body: JSON.stringify({
            children: [{
              object: 'block',
              type: 'to_do',
              to_do: {
                rich_text: [{ type: 'text', text: { content: text } }],
                checked
              }
            }]
          })
        });
      }
    };

    if (!actions[action]) {
      return Response.json({ 
        error: 'Unknown action', 
        available: Object.keys(actions) 
      }, { status: 400, headers: corsHeaders });
    }

    const result = await actions[action](data || {});
    
    await base44.entities.IntegrationAction.create({
      integration_slug: 'notion',
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