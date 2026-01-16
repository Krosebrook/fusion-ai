import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, serverUrl, token, functionsVersion } = appParams;

/**
 * Base44 SDK Client Instance
 * 
 * Configured with app parameters for authenticated API requests.
 * 
 * @typedef {Object} Base44Client
 * @property {Object} auth - Authentication methods (me, updateMe, etc.)
 * @property {Object} entities - Entity CRUD operations
 * @property {Object} functions - Backend function calls
 * 
 * @type {Base44Client}
 * 
 * @example
 * // Get current user
 * const user = await base44.auth.me();
 * 
 * @example
 * // List entities
 * const items = await base44.entities.AIGeneration.list();
 */
export const base44 = createClient({
  appId,
  serverUrl,
  token,
  functionsVersion,
  requiresAuth: false
});
