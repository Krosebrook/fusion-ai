/**
 * User entity wrapper
 * 
 * This module exports the User entity from the Base44 auth module.
 */
import { base44 } from '../api/base44Client';

/**
 * User entity for managing user data and authentication.
 */
export const User = base44.auth;
