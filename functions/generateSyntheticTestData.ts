/**
 * Synthetic Test Data Generation
 * Create realistic test data for performance testing
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { schema, recordCount = 1000, realistic = true } = await req.json();

    // Generate data matching schema
    const data = [];
    for (let i = 0; i < recordCount; i++) {
      data.push(generateRecord(schema, i, realistic));
    }

    // Store as test fixture
    const fixture = await base44.integrations.Core.UploadFile({
      file: JSON.stringify(data, null, 2),
    });

    return Response.json({
      success: true,
      recordsGenerated: recordCount,
      fixtureUrl: fixture.file_url,
      sampleSize: 5,
      samples: data.slice(0, 5),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateRecord(schema, index, realistic) {
  const record = {};
  
  for (const [key, type] of Object.entries(schema)) {
    if (type === 'string') {
      record[key] = realistic ? `value_${index}_${key}` : `string_${index}`;
    } else if (type === 'number') {
      record[key] = Math.floor(Math.random() * 1000);
    } else if (type === 'email') {
      record[key] = `user${index}@example.com`;
    } else if (type === 'boolean') {
      record[key] = Math.random() > 0.5;
    } else if (type === 'date') {
      record[key] = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString();
    }
  }
  
  return record;
}