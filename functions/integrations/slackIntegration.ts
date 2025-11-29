import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Slack Integration - Full API Coverage
 * Messages, Channels, Users, Files, Reactions, Apps
 */

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    const slackToken = Deno.env.get('SLACK_BOT_TOKEN');

    const slackFetch = async (method, params = {}) => {
      const response = await fetch(`https://slack.com/api/${method}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${slackToken}`,
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(params)
      });
      return response.json();
    };

    const actions = {
      // Messages
      postMessage: async ({ channel, text, blocks, attachments, threadTs, unfurlLinks }) => 
        slackFetch('chat.postMessage', { channel, text, blocks, attachments, thread_ts: threadTs, unfurl_links: unfurlLinks }),
      updateMessage: async ({ channel, ts, text, blocks }) => 
        slackFetch('chat.update', { channel, ts, text, blocks }),
      deleteMessage: async ({ channel, ts }) => 
        slackFetch('chat.delete', { channel, ts }),
      scheduleMessage: async ({ channel, text, postAt }) => 
        slackFetch('chat.scheduleMessage', { channel, text, post_at: postAt }),
      getPermalink: async ({ channel, messageTs }) => 
        slackFetch('chat.getPermalink', { channel, message_ts: messageTs }),

      // Channels
      listChannels: async ({ types = 'public_channel,private_channel', limit = 100 }) => 
        slackFetch('conversations.list', { types, limit }),
      createChannel: async ({ name, isPrivate = false }) => 
        slackFetch('conversations.create', { name, is_private: isPrivate }),
      archiveChannel: async ({ channel }) => 
        slackFetch('conversations.archive', { channel }),
      joinChannel: async ({ channel }) => 
        slackFetch('conversations.join', { channel }),
      leaveChannel: async ({ channel }) => 
        slackFetch('conversations.leave', { channel }),
      getChannelHistory: async ({ channel, limit = 100, oldest, latest }) => 
        slackFetch('conversations.history', { channel, limit, oldest, latest }),
      getChannelInfo: async ({ channel }) => 
        slackFetch('conversations.info', { channel }),
      inviteToChannel: async ({ channel, users }) => 
        slackFetch('conversations.invite', { channel, users: users.join(',') }),

      // Users
      listUsers: async ({ limit = 100 }) => 
        slackFetch('users.list', { limit }),
      getUserInfo: async ({ user }) => 
        slackFetch('users.info', { user }),
      getUserProfile: async ({ user }) => 
        slackFetch('users.profile.get', { user }),
      setUserStatus: async ({ statusText, statusEmoji, statusExpiration }) => 
        slackFetch('users.profile.set', { profile: { status_text: statusText, status_emoji: statusEmoji, status_expiration: statusExpiration } }),
      lookupByEmail: async ({ email }) => 
        slackFetch('users.lookupByEmail', { email }),

      // Reactions
      addReaction: async ({ channel, timestamp, name }) => 
        slackFetch('reactions.add', { channel, timestamp, name }),
      removeReaction: async ({ channel, timestamp, name }) => 
        slackFetch('reactions.remove', { channel, timestamp, name }),
      getReactions: async ({ channel, timestamp }) => 
        slackFetch('reactions.get', { channel, timestamp }),

      // Files
      uploadFile: async ({ channels, content, filename, filetype, title, initialComment }) => 
        slackFetch('files.upload', { channels, content, filename, filetype, title, initial_comment: initialComment }),
      deleteFile: async ({ file }) => 
        slackFetch('files.delete', { file }),
      listFiles: async ({ channel, types, count = 20 }) => 
        slackFetch('files.list', { channel, types, count }),

      // Pins
      addPin: async ({ channel, timestamp }) => 
        slackFetch('pins.add', { channel, timestamp }),
      removePin: async ({ channel, timestamp }) => 
        slackFetch('pins.remove', { channel, timestamp }),
      listPins: async ({ channel }) => 
        slackFetch('pins.list', { channel }),

      // Reminders
      addReminder: async ({ text, time, user }) => 
        slackFetch('reminders.add', { text, time, user }),
      deleteReminder: async ({ reminder }) => 
        slackFetch('reminders.delete', { reminder }),
      listReminders: async () => 
        slackFetch('reminders.list'),

      // Bookmarks
      addBookmark: async ({ channel_id, title, type, link }) => 
        slackFetch('bookmarks.add', { channel_id, title, type, link }),

      // Search
      searchMessages: async ({ query, count = 20, sort = 'timestamp' }) => 
        slackFetch('search.messages', { query, count, sort }),
      searchFiles: async ({ query, count = 20 }) => 
        slackFetch('search.files', { query, count }),

      // Team
      getTeamInfo: async () => 
        slackFetch('team.info'),
      getTeamAccessLogs: async ({ count = 100 }) => 
        slackFetch('team.accessLogs', { count }),

      // Auth
      testAuth: async () => 
        slackFetch('auth.test')
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