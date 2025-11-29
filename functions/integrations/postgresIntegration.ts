import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * PostgreSQL Integration - Direct Database Access
 * Query, Insert, Update, Delete, Transactions
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
    const connectionString = Deno.env.get('POSTGRES_URL');

    // Using postgres npm package for connection
    const { default: postgres } = await import('npm:postgres@3.4.3');
    const sql = postgres(connectionString);

    const actions = {
      // Query
      query: async ({ sql: query, params = [] }) => {
        const result = await sql.unsafe(query, params);
        return { rows: result, rowCount: result.length };
      },

      // Select
      select: async ({ table, columns = '*', where, orderBy, limit, offset }) => {
        let query = `SELECT ${columns} FROM ${table}`;
        if (where) query += ` WHERE ${where}`;
        if (orderBy) query += ` ORDER BY ${orderBy}`;
        if (limit) query += ` LIMIT ${limit}`;
        if (offset) query += ` OFFSET ${offset}`;
        const result = await sql.unsafe(query);
        return { rows: result, rowCount: result.length };
      },

      // Insert
      insert: async ({ table, data: row, returning = '*' }) => {
        const result = await sql`INSERT INTO ${sql(table)} ${sql(row)} RETURNING ${sql.unsafe(returning)}`;
        return { rows: result, rowCount: result.length };
      },

      bulkInsert: async ({ table, data: rows, returning = '*' }) => {
        const result = await sql`INSERT INTO ${sql(table)} ${sql(rows)} RETURNING ${sql.unsafe(returning)}`;
        return { rows: result, rowCount: result.length };
      },

      // Update
      update: async ({ table, data: updates, where, returning = '*' }) => {
        const result = await sql`UPDATE ${sql(table)} SET ${sql(updates)} WHERE ${sql.unsafe(where)} RETURNING ${sql.unsafe(returning)}`;
        return { rows: result, rowCount: result.length };
      },

      // Delete
      delete: async ({ table, where, returning }) => {
        const ret = returning ? `RETURNING ${returning}` : '';
        const result = await sql.unsafe(`DELETE FROM ${table} WHERE ${where} ${ret}`);
        return { rows: result, rowCount: result.length };
      },

      // Transactions
      transaction: async ({ queries }) => {
        const results = await sql.begin(async tx => {
          const txResults = [];
          for (const query of queries) {
            const result = await tx.unsafe(query.sql, query.params || []);
            txResults.push({ rows: result, rowCount: result.length });
          }
          return txResults;
        });
        return { results };
      },

      // Schema
      listTables: async ({ schema = 'public' }) => {
        const result = await sql`SELECT tablename FROM pg_tables WHERE schemaname = ${schema}`;
        return { tables: result.map(r => r.tablename) };
      },

      getTableSchema: async ({ table }) => {
        const result = await sql`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_name = ${table}
        `;
        return { columns: result };
      },

      // Stored Procedures
      callProcedure: async ({ procedure, params = [] }) => {
        const placeholders = params.map((_, i) => `$${i + 1}`).join(', ');
        const result = await sql.unsafe(`SELECT * FROM ${procedure}(${placeholders})`, params);
        return { rows: result, rowCount: result.length };
      },

      // Analytics
      count: async ({ table, where }) => {
        const query = `SELECT COUNT(*) as count FROM ${table}${where ? ` WHERE ${where}` : ''}`;
        const result = await sql.unsafe(query);
        return { count: parseInt(result[0].count) };
      },

      aggregate: async ({ table, aggregates, groupBy, where }) => {
        let query = `SELECT ${aggregates}${groupBy ? `, ${groupBy}` : ''} FROM ${table}`;
        if (where) query += ` WHERE ${where}`;
        if (groupBy) query += ` GROUP BY ${groupBy}`;
        const result = await sql.unsafe(query);
        return { rows: result, rowCount: result.length };
      },

      // Full-text search
      fullTextSearch: async ({ table, searchColumn, query, limit = 100 }) => {
        const result = await sql.unsafe(
          `SELECT * FROM ${table} WHERE ${searchColumn} @@ to_tsquery($1) LIMIT ${limit}`,
          [query]
        );
        return { rows: result, rowCount: result.length };
      },

      // Database info
      getDatabaseInfo: async () => {
        const result = await sql`SELECT current_database(), version()`;
        return result[0];
      },

      // Close connection (cleanup)
      close: async () => {
        await sql.end();
        return { message: 'Connection closed' };
      }
    };

    if (!actions[action]) {
      return Response.json({ error: 'Unknown action', available: Object.keys(actions) }, { status: 400, headers: corsHeaders });
    }

    const result = await actions[action](data || {});
    
    // Close connection after action
    if (action !== 'close') {
      await sql.end();
    }

    return Response.json(result, { headers: corsHeaders });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});