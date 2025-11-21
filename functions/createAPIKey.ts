import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { createHash } from 'node:crypto';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, permissions, pipeline_ids, expires_in_days } = await req.json();

    if (!name || !permissions || permissions.length === 0) {
      return Response.json({ error: 'Name and permissions required' }, { status: 400 });
    }

    // Generate secure API key
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const apiKey = `ffai_${Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')}`;
    
    // Hash the key for storage
    const keyHash = createHash('sha256').update(apiKey).digest('hex');
    const keyPreview = `...${apiKey.slice(-4)}`;
    
    // Calculate expiration
    const expiresAt = expires_in_days && expires_in_days > 0
      ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Create API key record
    const created = await base44.asServiceRole.entities.APIKey.create({
      name,
      key_hash: keyHash,
      key_preview: keyPreview,
      permissions,
      pipeline_ids: pipeline_ids || [],
      expires_at: expiresAt,
      active: true
    });

    // Return the plaintext key only once
    return Response.json({
      success: true,
      ...created,
      plaintext_key: apiKey
    });

  } catch (error) {
    console.error('Create API key error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});