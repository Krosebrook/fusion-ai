/**
 * Agent SDK wrapper
 * 
 * This module provides a convenient wrapper around the Base44 agent SDK.
 * It exports the agentSDK for use throughout the application.
 */
import { base44 } from './api/base44Client';

/**
 * Agent SDK for managing AI agent conversations.
 * Provides methods to create conversations, send messages, and subscribe to real-time updates.
 */
export const agentSDK = base44.agents;
