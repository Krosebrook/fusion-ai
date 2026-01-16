/**
 * Entity and Authentication API
 * 
 * Provides access to Base44 entities and authentication methods.
 * These are re-exported from the base44 client for convenience.
 * 
 * @module api/entities
 */

import { base44 } from './base44Client';

/**
 * Query Entity
 * 
 * Provides CRUD operations for Query entities.
 * 
 * @type {Object}
 * @property {Function} list - List all queries
 * @property {Function} get - Get a specific query by ID
 * @property {Function} create - Create a new query
 * @property {Function} update - Update an existing query
 * @property {Function} delete - Delete a query
 */
export const Query = base44.entities.Query;

/**
 * User Authentication API
 * 
 * Provides authentication and user management methods.
 * 
 * @type {Object}
 * @property {Function} me - Get current authenticated user
 * @property {Function} updateMe - Update current user profile
 * @property {Function} login - Authenticate a user
 * @property {Function} logout - Log out current user
 * 
 * @example
 * // Get current user
 * const user = await User.me();
 * 
 * @example
 * // Update user profile
 * await User.updateMe({ name: 'John Doe' });
 */
export const User = base44.auth;
