import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Redis Integration - In-Memory Data Store
 * Full coverage: Strings, Hashes, Lists, Sets, Sorted Sets, Pub/Sub, Streams
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
    const redisUrl = Deno.env.get('REDIS_URL') || 'redis://localhost:6379';
    
    // Using Upstash REST API for serverless Redis
    const upstashUrl = Deno.env.get('UPSTASH_REDIS_REST_URL');
    const upstashToken = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

    const redisCommand = async (command, ...args) => {
      const response = await fetch(upstashUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${upstashToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([command, ...args])
      });
      return response.json();
    };

    const actions = {
      // ============ STRINGS ============
      get: async ({ key }) => redisCommand('GET', key),
      set: async ({ key, value, ex, px, nx, xx }) => {
        const args = [key, value];
        if (ex) args.push('EX', ex);
        if (px) args.push('PX', px);
        if (nx) args.push('NX');
        if (xx) args.push('XX');
        return redisCommand('SET', ...args);
      },
      mget: async ({ keys }) => redisCommand('MGET', ...keys),
      mset: async ({ pairs }) => redisCommand('MSET', ...Object.entries(pairs).flat()),
      incr: async ({ key }) => redisCommand('INCR', key),
      incrby: async ({ key, increment }) => redisCommand('INCRBY', key, increment),
      decr: async ({ key }) => redisCommand('DECR', key),
      append: async ({ key, value }) => redisCommand('APPEND', key, value),
      strlen: async ({ key }) => redisCommand('STRLEN', key),

      // ============ KEYS ============
      del: async ({ keys }) => redisCommand('DEL', ...keys),
      exists: async ({ keys }) => redisCommand('EXISTS', ...keys),
      expire: async ({ key, seconds }) => redisCommand('EXPIRE', key, seconds),
      expireat: async ({ key, timestamp }) => redisCommand('EXPIREAT', key, timestamp),
      ttl: async ({ key }) => redisCommand('TTL', key),
      pttl: async ({ key }) => redisCommand('PTTL', key),
      persist: async ({ key }) => redisCommand('PERSIST', key),
      keys: async ({ pattern }) => redisCommand('KEYS', pattern),
      scan: async ({ cursor, match, count }) => {
        const args = [cursor];
        if (match) args.push('MATCH', match);
        if (count) args.push('COUNT', count);
        return redisCommand('SCAN', ...args);
      },
      type: async ({ key }) => redisCommand('TYPE', key),
      rename: async ({ key, newKey }) => redisCommand('RENAME', key, newKey),

      // ============ HASHES ============
      hget: async ({ key, field }) => redisCommand('HGET', key, field),
      hset: async ({ key, fields }) => redisCommand('HSET', key, ...Object.entries(fields).flat()),
      hmget: async ({ key, fields }) => redisCommand('HMGET', key, ...fields),
      hgetall: async ({ key }) => redisCommand('HGETALL', key),
      hdel: async ({ key, fields }) => redisCommand('HDEL', key, ...fields),
      hexists: async ({ key, field }) => redisCommand('HEXISTS', key, field),
      hincrby: async ({ key, field, increment }) => redisCommand('HINCRBY', key, field, increment),
      hkeys: async ({ key }) => redisCommand('HKEYS', key),
      hvals: async ({ key }) => redisCommand('HVALS', key),
      hlen: async ({ key }) => redisCommand('HLEN', key),

      // ============ LISTS ============
      lpush: async ({ key, values }) => redisCommand('LPUSH', key, ...values),
      rpush: async ({ key, values }) => redisCommand('RPUSH', key, ...values),
      lpop: async ({ key, count }) => count ? redisCommand('LPOP', key, count) : redisCommand('LPOP', key),
      rpop: async ({ key, count }) => count ? redisCommand('RPOP', key, count) : redisCommand('RPOP', key),
      lrange: async ({ key, start, stop }) => redisCommand('LRANGE', key, start, stop),
      llen: async ({ key }) => redisCommand('LLEN', key),
      lindex: async ({ key, index }) => redisCommand('LINDEX', key, index),
      lset: async ({ key, index, value }) => redisCommand('LSET', key, index, value),
      lrem: async ({ key, count, value }) => redisCommand('LREM', key, count, value),
      ltrim: async ({ key, start, stop }) => redisCommand('LTRIM', key, start, stop),

      // ============ SETS ============
      sadd: async ({ key, members }) => redisCommand('SADD', key, ...members),
      srem: async ({ key, members }) => redisCommand('SREM', key, ...members),
      smembers: async ({ key }) => redisCommand('SMEMBERS', key),
      sismember: async ({ key, member }) => redisCommand('SISMEMBER', key, member),
      scard: async ({ key }) => redisCommand('SCARD', key),
      sinter: async ({ keys }) => redisCommand('SINTER', ...keys),
      sunion: async ({ keys }) => redisCommand('SUNION', ...keys),
      sdiff: async ({ keys }) => redisCommand('SDIFF', ...keys),
      srandmember: async ({ key, count }) => count ? redisCommand('SRANDMEMBER', key, count) : redisCommand('SRANDMEMBER', key),
      spop: async ({ key, count }) => count ? redisCommand('SPOP', key, count) : redisCommand('SPOP', key),

      // ============ SORTED SETS ============
      zadd: async ({ key, members }) => {
        const args = [key];
        members.forEach(m => args.push(m.score, m.member));
        return redisCommand('ZADD', ...args);
      },
      zrem: async ({ key, members }) => redisCommand('ZREM', key, ...members),
      zrange: async ({ key, start, stop, withScores }) => {
        const args = [key, start, stop];
        if (withScores) args.push('WITHSCORES');
        return redisCommand('ZRANGE', ...args);
      },
      zrevrange: async ({ key, start, stop, withScores }) => {
        const args = [key, start, stop];
        if (withScores) args.push('WITHSCORES');
        return redisCommand('ZREVRANGE', ...args);
      },
      zscore: async ({ key, member }) => redisCommand('ZSCORE', key, member),
      zrank: async ({ key, member }) => redisCommand('ZRANK', key, member),
      zcard: async ({ key }) => redisCommand('ZCARD', key),
      zincrby: async ({ key, increment, member }) => redisCommand('ZINCRBY', key, increment, member),
      zrangebyscore: async ({ key, min, max, withScores, limit }) => {
        const args = [key, min, max];
        if (withScores) args.push('WITHSCORES');
        if (limit) args.push('LIMIT', limit.offset, limit.count);
        return redisCommand('ZRANGEBYSCORE', ...args);
      },

      // ============ PUB/SUB ============
      publish: async ({ channel, message }) => redisCommand('PUBLISH', channel, message),

      // ============ STREAMS ============
      xadd: async ({ key, id = '*', fields }) => {
        const args = [key, id, ...Object.entries(fields).flat()];
        return redisCommand('XADD', ...args);
      },
      xread: async ({ streams, count, block }) => {
        const args = [];
        if (count) args.push('COUNT', count);
        if (block !== undefined) args.push('BLOCK', block);
        args.push('STREAMS', ...streams.map(s => s.key), ...streams.map(s => s.id || '$'));
        return redisCommand('XREAD', ...args);
      },
      xrange: async ({ key, start = '-', end = '+', count }) => {
        const args = [key, start, end];
        if (count) args.push('COUNT', count);
        return redisCommand('XRANGE', ...args);
      },
      xlen: async ({ key }) => redisCommand('XLEN', key),

      // ============ SERVER ============
      ping: async () => redisCommand('PING'),
      info: async ({ section }) => section ? redisCommand('INFO', section) : redisCommand('INFO'),
      dbsize: async () => redisCommand('DBSIZE'),
      flushdb: async () => redisCommand('FLUSHDB'),

      // ============ JSON (RedisJSON) ============
      jsonSet: async ({ key, path = '$', value }) => redisCommand('JSON.SET', key, path, JSON.stringify(value)),
      jsonGet: async ({ key, path = '$' }) => redisCommand('JSON.GET', key, path),
      jsonDel: async ({ key, path = '$' }) => redisCommand('JSON.DEL', key, path),
      jsonArrAppend: async ({ key, path, values }) => redisCommand('JSON.ARRAPPEND', key, path, ...values.map(v => JSON.stringify(v)))
    };

    if (!actions[action]) {
      return Response.json({ 
        error: 'Unknown action', 
        available: Object.keys(actions) 
      }, { status: 400, headers: corsHeaders });
    }

    const result = await actions[action](data || {});
    return Response.json(result, { headers: corsHeaders });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});