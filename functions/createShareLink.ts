/**
 * Create Share Link
 * Generate public share URLs for AI generations
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { generationId, expiresIn = 7 } = await req.json();

    if (!generationId) {
      return Response.json({ error: 'generationId required' }, { status: 400 });
    }

    // Verify user owns this generation
    const generations = await base44.entities.AIGeneration.filter({ id: generationId });
    const generation = generations[0];

    if (!generation) {
      return Response.json({ error: 'Generation not found' }, { status: 404 });
    }

    if (generation.created_by !== user.email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate unique share token
    const shareToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresIn);

    // Create share record (you'll need a Share entity)
    const share = await base44.asServiceRole.entities.AIGeneration.update(generationId, {
      share_token: shareToken,
      share_expires_at: expiresAt.toISOString(),
      is_public: true,
    });

    const shareUrl = `${req.headers.get('origin')}/share/${shareToken}`;

    return Response.json({
      shareUrl,
      shareToken,
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error('Share link creation failed:', error);
    return Response.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
});