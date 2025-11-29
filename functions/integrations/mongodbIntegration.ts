import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * MongoDB Integration - NoSQL Database
 * Collections, Documents, Aggregations, Indexes
 */

Deno.serve(async (req) => {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });

    const { action, data } = await req.json();
    const mongoUrl = Deno.env.get('MONGODB_URL');
    
    const { MongoClient } = await import('npm:mongodb@6.3.0');
    const client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db(data?.database);
    const collection = data?.collection ? db.collection(data.collection) : null;

    const actions = {
      // Documents
      find: async ({ filter = {}, projection, sort, limit, skip }) => {
        const cursor = collection.find(filter);
        if (projection) cursor.project(projection);
        if (sort) cursor.sort(sort);
        if (limit) cursor.limit(limit);
        if (skip) cursor.skip(skip);
        return { documents: await cursor.toArray() };
      },

      findOne: async ({ filter, projection }) => {
        const options = projection ? { projection } : {};
        return { document: await collection.findOne(filter, options) };
      },

      insertOne: async ({ document }) => {
        const result = await collection.insertOne(document);
        return { insertedId: result.insertedId, acknowledged: result.acknowledged };
      },

      insertMany: async ({ documents, ordered = true }) => {
        const result = await collection.insertMany(documents, { ordered });
        return { insertedCount: result.insertedCount, insertedIds: result.insertedIds };
      },

      updateOne: async ({ filter, update, upsert = false }) => {
        const result = await collection.updateOne(filter, update, { upsert });
        return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount, upsertedId: result.upsertedId };
      },

      updateMany: async ({ filter, update, upsert = false }) => {
        const result = await collection.updateMany(filter, update, { upsert });
        return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
      },

      replaceOne: async ({ filter, replacement, upsert = false }) => {
        const result = await collection.replaceOne(filter, replacement, { upsert });
        return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
      },

      deleteOne: async ({ filter }) => {
        const result = await collection.deleteOne(filter);
        return { deletedCount: result.deletedCount };
      },

      deleteMany: async ({ filter }) => {
        const result = await collection.deleteMany(filter);
        return { deletedCount: result.deletedCount };
      },

      countDocuments: async ({ filter = {} }) => {
        return { count: await collection.countDocuments(filter) };
      },

      distinct: async ({ field, filter = {} }) => {
        return { values: await collection.distinct(field, filter) };
      },

      // Aggregations
      aggregate: async ({ pipeline }) => {
        const result = await collection.aggregate(pipeline).toArray();
        return { results: result };
      },

      // Indexes
      createIndex: async ({ keys, options }) => {
        const result = await collection.createIndex(keys, options);
        return { indexName: result };
      },

      listIndexes: async () => {
        return { indexes: await collection.listIndexes().toArray() };
      },

      dropIndex: async ({ indexName }) => {
        await collection.dropIndex(indexName);
        return { dropped: true };
      },

      // Collections
      listCollections: async () => {
        const collections = await db.listCollections().toArray();
        return { collections: collections.map(c => c.name) };
      },

      createCollection: async ({ name, options }) => {
        await db.createCollection(name, options);
        return { created: true };
      },

      dropCollection: async () => {
        await collection.drop();
        return { dropped: true };
      },

      // Transactions
      transaction: async ({ operations }) => {
        const session = client.startSession();
        try {
          const results = await session.withTransaction(async () => {
            const txResults = [];
            for (const op of operations) {
              const coll = db.collection(op.collection);
              let result;
              switch (op.operation) {
                case 'insertOne':
                  result = await coll.insertOne(op.document, { session });
                  break;
                case 'updateOne':
                  result = await coll.updateOne(op.filter, op.update, { session });
                  break;
                case 'deleteOne':
                  result = await coll.deleteOne(op.filter, { session });
                  break;
              }
              txResults.push(result);
            }
            return txResults;
          });
          return { results };
        } finally {
          await session.endSession();
        }
      },

      // Database stats
      stats: async () => {
        return await db.stats();
      },

      collectionStats: async () => {
        return await collection.stats();
      }
    };

    if (!actions[action]) {
      await client.close();
      return Response.json({ error: 'Unknown action', available: Object.keys(actions) }, { status: 400, headers: corsHeaders });
    }

    const result = await actions[action](data || {});
    await client.close();
    
    return Response.json(result, { headers: corsHeaders });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});