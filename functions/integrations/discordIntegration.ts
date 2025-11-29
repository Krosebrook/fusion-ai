import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Discord Integration - Full API Coverage
 * Messages, Channels, Guilds, Members, Webhooks
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
    const discordToken = Deno.env.get('DISCORD_BOT_TOKEN');

    const discordFetch = async (endpoint, options = {}) => {
      const response = await fetch(`https://discord.com/api/v10${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bot ${discordToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      return response.json();
    };

    const actions = {
      // Messages
      sendMessage: async ({ channelId, content, embeds, components }) => 
        discordFetch(`/channels/${channelId}/messages`, { method: 'POST', body: JSON.stringify({ content, embeds, components }) }),
      editMessage: async ({ channelId, messageId, content, embeds }) => 
        discordFetch(`/channels/${channelId}/messages/${messageId}`, { method: 'PATCH', body: JSON.stringify({ content, embeds }) }),
      deleteMessage: async ({ channelId, messageId }) => 
        discordFetch(`/channels/${channelId}/messages/${messageId}`, { method: 'DELETE' }),
      getMessages: async ({ channelId, limit = 50, before, after }) => {
        let url = `/channels/${channelId}/messages?limit=${limit}`;
        if (before) url += `&before=${before}`;
        if (after) url += `&after=${after}`;
        return discordFetch(url);
      },
      pinMessage: async ({ channelId, messageId }) => 
        discordFetch(`/channels/${channelId}/pins/${messageId}`, { method: 'PUT' }),
      unpinMessage: async ({ channelId, messageId }) => 
        discordFetch(`/channels/${channelId}/pins/${messageId}`, { method: 'DELETE' }),

      // Reactions
      addReaction: async ({ channelId, messageId, emoji }) => 
        discordFetch(`/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}/@me`, { method: 'PUT' }),
      removeReaction: async ({ channelId, messageId, emoji }) => 
        discordFetch(`/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}/@me`, { method: 'DELETE' }),

      // Channels
      getChannel: async ({ channelId }) => 
        discordFetch(`/channels/${channelId}`),
      modifyChannel: async ({ channelId, name, topic, nsfw, position }) => 
        discordFetch(`/channels/${channelId}`, { method: 'PATCH', body: JSON.stringify({ name, topic, nsfw, position }) }),
      deleteChannel: async ({ channelId }) => 
        discordFetch(`/channels/${channelId}`, { method: 'DELETE' }),
      createThread: async ({ channelId, name, messageId, autoArchiveDuration = 1440 }) => 
        discordFetch(`/channels/${channelId}/threads`, { method: 'POST', body: JSON.stringify({ name, auto_archive_duration: autoArchiveDuration }) }),

      // Guilds
      getGuild: async ({ guildId }) => 
        discordFetch(`/guilds/${guildId}`),
      getGuildChannels: async ({ guildId }) => 
        discordFetch(`/guilds/${guildId}/channels`),
      createChannel: async ({ guildId, name, type = 0, parentId, topic }) => 
        discordFetch(`/guilds/${guildId}/channels`, { method: 'POST', body: JSON.stringify({ name, type, parent_id: parentId, topic }) }),
      getGuildMembers: async ({ guildId, limit = 100 }) => 
        discordFetch(`/guilds/${guildId}/members?limit=${limit}`),
      getGuildMember: async ({ guildId, userId }) => 
        discordFetch(`/guilds/${guildId}/members/${userId}`),
      modifyMember: async ({ guildId, userId, nick, roles, mute, deaf }) => 
        discordFetch(`/guilds/${guildId}/members/${userId}`, { method: 'PATCH', body: JSON.stringify({ nick, roles, mute, deaf }) }),
      kickMember: async ({ guildId, userId }) => 
        discordFetch(`/guilds/${guildId}/members/${userId}`, { method: 'DELETE' }),
      banMember: async ({ guildId, userId, reason }) => 
        discordFetch(`/guilds/${guildId}/bans/${userId}`, { method: 'PUT', body: JSON.stringify({ reason }) }),
      unbanMember: async ({ guildId, userId }) => 
        discordFetch(`/guilds/${guildId}/bans/${userId}`, { method: 'DELETE' }),

      // Roles
      getGuildRoles: async ({ guildId }) => 
        discordFetch(`/guilds/${guildId}/roles`),
      createRole: async ({ guildId, name, color, permissions, hoist, mentionable }) => 
        discordFetch(`/guilds/${guildId}/roles`, { method: 'POST', body: JSON.stringify({ name, color, permissions, hoist, mentionable }) }),
      addRoleToMember: async ({ guildId, userId, roleId }) => 
        discordFetch(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { method: 'PUT' }),
      removeRoleFromMember: async ({ guildId, userId, roleId }) => 
        discordFetch(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { method: 'DELETE' }),

      // Webhooks
      createWebhook: async ({ channelId, name, avatar }) => 
        discordFetch(`/channels/${channelId}/webhooks`, { method: 'POST', body: JSON.stringify({ name, avatar }) }),
      executeWebhook: async ({ webhookId, webhookToken, content, embeds, username, avatarUrl }) => 
        discordFetch(`/webhooks/${webhookId}/${webhookToken}`, { method: 'POST', body: JSON.stringify({ content, embeds, username, avatar_url: avatarUrl }) }),

      // User
      getCurrentUser: async () => 
        discordFetch('/users/@me'),
      getUser: async ({ userId }) => 
        discordFetch(`/users/${userId}`),

      // Emojis
      listEmojis: async ({ guildId }) => 
        discordFetch(`/guilds/${guildId}/emojis`)
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