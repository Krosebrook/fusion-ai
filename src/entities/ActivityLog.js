/**
 * ActivityLog entity wrapper
 * 
 * This module exports the ActivityLog entity for tracking user activities.
 */
import { base44 } from '../api/base44Client';

/**
 * ActivityLog entity for creating, reading, updating, and deleting activity logs.
 */
export const ActivityLog = base44.entities.ActivityLog;
